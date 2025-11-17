from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import stripe
from stripe._error import StripeError, SignatureVerificationError
import json

from users.models import User
from subscriptions.models import SubscriptionTier, Subscription, UsageLimit
from .models import Payment, Invoice, Discount, DiscountUsage
from .serializers import (
    PaymentSerializer,
    InvoiceSerializer,
    PaymentIntentCreateSerializer,
)
from analytics.activity_utils import (
    log_payment_initiated,
    log_payment_succeeded,
    log_payment_failed,
    log_discount_applied,
    log_user_activity,
)


class PaymentIntentCreateAPIView(APIView):
    """
    Create a Stripe PaymentIntent for subscription upgrade.
    """
    permission_classes = [IsAuthenticated]
    
    def dispatch(self, request, *args, **kwargs):
        # Initialize Stripe API key on each request
        stripe.api_key = settings.STRIPE_API_KEY
        return super().dispatch(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_summary="Create Payment Intent",
        operation_description="Create Stripe PaymentIntent for subscription upgrade",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['tier_id'],
            properties={
                'tier_id': openapi.Schema(type=openapi.TYPE_STRING, format='uuid'),
                'discount_code': openapi.Schema(type=openapi.TYPE_STRING),
            }
        ),
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            201: openapi.Response(description="PaymentIntent created successfully"),
            400: openapi.Response(description="Validation failed"),
        }
    )
    def post(self, request):
        """Create payment intent"""
        serializer = PaymentIntentCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        tier_id = serializer.validated_data['tier_id']
        discount_code = serializer.validated_data.get('discount_code')
        
        tier = get_object_or_404(SubscriptionTier, id=tier_id, is_active=True)
        
        # Free tier - no payment needed
        if tier.price == 0:
            # Create subscription directly
            try:
                subscription = Subscription.objects.get(user=request.user)
                subscription.tier = tier
                subscription.status = 'active'
                subscription.current_period_start = timezone.now()
                subscription.current_period_end = timezone.now() + timezone.timedelta(days=30)
                subscription.save()
            except Subscription.DoesNotExist:
                subscription = Subscription.objects.create(
                    user=request.user,
                    tier=tier,
                    stripe_customer_id='free_user',
                    status='active',
                    current_period_start=timezone.now(),
                    current_period_end=timezone.now() + timezone.timedelta(days=30)
                )
                UsageLimit.objects.create(
                    subscription=subscription,
                    period_start=subscription.current_period_start,
                    period_end=subscription.current_period_end
                )
            
            return Response({
                'success': True,
                'message': 'Free subscription activated',
                'data': {
                    'requires_payment': False,
                    'subscription_id': str(subscription.id)
                }
            }, status=status.HTTP_201_CREATED)
        
        # Paid tier - create Stripe payment intent
        try:
            # Get or create Stripe customer
            customer_id = getattr(request.user, 'stripe_customer_id', None)
            if not customer_id:
                customer = stripe.Customer.create(
                    email=request.user.email,
                    metadata={'user_id': str(request.user.id)}
                )
                customer_id = customer.id
            else:
                customer = stripe.Customer.retrieve(customer_id)
            
            # Calculate amount
            amount = int(tier.price * 100)  # Convert to cents
            discount = None
            discount_amount = 0
            
            # Apply discount if provided
            if discount_code:
                discount = Discount.objects.get(code=discount_code)
                
                # Check if user can use this discount
                if not discount.can_user_use(request.user):
                    return Response({
                        'success': False,
                        'message': 'You cannot use this discount code'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Calculate discount
                _, discount_amount = discount.apply_discount(tier.price)
                amount = int((tier.price - discount_amount) * 100)
                
                # Log discount application
                try:
                    log_discount_applied(
                        request,
                        discount,
                        description=f'Discount code {discount_code} applied to {tier.display_name} subscription'
                    )
                except:
                    pass
            
            # Create PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='usd',
                customer=customer_id,
                metadata={
                    'user_id': str(request.user.id),
                    'tier_id': str(tier.id),
                    'discount_code': discount_code or '',
                }
            )
            
            # Create Payment record
            payment = Payment.objects.create(
                user=request.user,
                stripe_payment_intent_id=intent.id,
                original_amount=tier.price,
                discount_amount=discount_amount,
                final_amount=tier.price - discount_amount,
                discount=discount if discount_code else None,
                status='pending',
            )
            
            # Log payment initiation
            try:
                log_payment_initiated(
                    request,
                    payment,
                    description=f'Payment initiated for {tier.display_name} subscription'
                )
            except:
                pass
            
            return Response({
                'success': True,
                'message': 'PaymentIntent created successfully',
                'data': {
                    'client_secret': intent.client_secret,
                    'payment_intent_id': intent.id,
                    'amount': amount,
                    'currency': 'usd',
                    'tier': {
                        'id': str(tier.id),
                        'name': tier.display_name,
                        'price': str(tier.price),
                    },
                    'discount': {
                        'code': discount_code,
                        'amount': str(discount_amount)
                    } if discount_code else None
                }
            }, status=status.HTTP_201_CREATED)
            
        except StripeError as e:
            return Response({
                'success': False,
                'message': f'Stripe error: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentListAPIView(APIView):
    """
    List user's payment history.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="List Payments",
        operation_description="Get user's payment history",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(description="Payments retrieved successfully"),
        }
    )
    def get(self, request):
        """List user's payments"""
        payments = Payment.objects.filter(user=request.user).order_by('-created_at')[:20]
        serializer = PaymentSerializer(payments, many=True)
        
        return Response({
            'success': True,
            'message': 'Payments retrieved successfully',
            'data': serializer.data
        })


class InvoiceListAPIView(APIView):
    """
    List user's invoices.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="List Invoices",
        operation_description="Get user's invoices",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(description="Invoices retrieved successfully"),
        }
    )
    def get(self, request):
        """List user's invoices"""
        invoices = Invoice.objects.filter(user=request.user).order_by('-issue_date')[:20]
        serializer = InvoiceSerializer(invoices, many=True)
        
        return Response({
            'success': True,
            'message': 'Invoices retrieved successfully',
            'data': serializer.data
        })


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookAPIView(APIView):
    """
    Handle Stripe webhook events.
    """
    permission_classes = [permissions.AllowAny]
    
    def dispatch(self, request, *args, **kwargs):
        # Initialize Stripe API key on each request
        stripe.api_key = settings.STRIPE_API_KEY
        return super().dispatch(request, *args, **kwargs)
    
    def post(self, request):
        """Process Stripe webhook"""
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
        except SignatureVerificationError:
            return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle events
        event_type = event['type']
        
        if event_type == 'payment_intent.succeeded':
            self._handle_payment_succeeded(event['data']['object'])
        
        elif event_type == 'payment_intent.payment_failed':
            self._handle_payment_failed(event['data']['object'])
        
        return Response({'received': True})
    
    def _handle_payment_succeeded(self, payment_intent):
        """Handle successful payment"""
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent['id'])
            
            # Update payment status
            payment.status = 'succeeded'
            payment.save()
            
            # Get tier from metadata
            tier_id = payment_intent['metadata'].get('tier_id')
            user_id = payment_intent['metadata'].get('user_id')
            
            tier = SubscriptionTier.objects.get(id=tier_id)
            user = User.objects.get(id=user_id)
            
            # Create or update subscription
            subscription, created = Subscription.objects.get_or_create(
                user=user,
                defaults={
                    'tier': tier,
                    'stripe_customer_id': payment_intent['customer'],
                    'status': 'active',
                    'current_period_start': timezone.now(),
                    'current_period_end': timezone.now() + timezone.timedelta(days=30)
                }
            )
            
            if not created:
                subscription.tier = tier
                subscription.status = 'active'
                subscription.current_period_start = timezone.now()
                subscription.current_period_end = timezone.now() + timezone.timedelta(days=30)
                subscription.save()
            
            # Create or update usage limit
            UsageLimit.objects.get_or_create(
                subscription=subscription,
                defaults={
                    'period_start': subscription.current_period_start,
                    'period_end': subscription.current_period_end
                }
            )
            
            # Create invoice
            invoice_number = f"INV-{payment.user.id}-{timezone.now().timestamp()}"
            Invoice.objects.create(
                user=payment.user,
                subscription=subscription,
                payment=payment,
                stripe_invoice_id=payment_intent['id'],
                invoice_number=invoice_number,
                original_amount=payment.original_amount,
                discount_amount=payment.discount_amount,
                total_amount=payment.final_amount,
                issue_date=timezone.now().date(),
                due_date=timezone.now().date(),
                paid_at=timezone.now(),
                status='paid'
            )
            
            # Record discount usage if applicable
            if payment.discount:
                DiscountUsage.objects.get_or_create(
                    discount=payment.discount,
                    user=payment.user
                )
                payment.discount.current_uses += 1
                payment.discount.save()
            
            # Log payment success
            try:
                log_payment_succeeded(
                    request=None,  # Webhook context, no request available
                    payment=payment,
                    description=f'Payment of ${payment.final_amount} for {tier.display_name} subscription succeeded'
                )
            except:
                pass
        
        except Exception as e:
            print(f"Error handling payment succeeded: {str(e)}")
    
    def _handle_payment_failed(self, payment_intent):
        """Handle failed payment"""
        try:
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent['id'])
            payment.status = 'failed'
            payment.save()
            
            # Log payment failure
            try:
                error_message = payment_intent.get('last_payment_error', {}).get('message', 'Unknown error')
                log_payment_failed(
                    request=None,  # Webhook context, no request available
                    payment=payment,
                    error_msg=error_message,
                    description=f'Payment of ${payment.final_amount} failed'
                )
            except:
                pass
        except Exception as e:
            print(f"Error handling payment failed: {str(e)}")
