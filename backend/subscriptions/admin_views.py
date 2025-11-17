"""
Admin APIs for viewing all users with subscriptions and billing details.
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.db.models import Prefetch, Q
from users.models import User
from subscriptions.models import Subscription, UsageLimit
from payments.models import Payment, Invoice
from subscriptions.serializers import SubscriptionDetailSerializer, UsageLimitSerializer


class IsAdmin(permissions.BasePermission):
    """Check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminAllUsersWithSubscriptionsAPIView(APIView):
    """
    Admin endpoint to get all users with their subscription details.
    
    GET /api/admin/users-subscriptions/
    
    Query parameters:
    - page: Page number (default 1)
    - page_size: Items per page (default 20)
    - status: Filter by subscription status (active, past_due, canceled, incomplete)
    - tier_id: Filter by specific tier UUID
    - search: Search by email or username
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get all users with subscription details"""
        try:
            # Base queryset
            users = User.objects.filter(is_active=True).select_related(
                'subscription__tier',
                'subscription__usage_limit'
            ).order_by('-date_joined')
            
            # Filter by subscription status
            sub_status = request.query_params.get('status')
            if sub_status:
                users = users.filter(subscription__status=sub_status)
            
            # Filter by tier
            tier_id = request.query_params.get('tier_id')
            if tier_id:
                users = users.filter(subscription__tier_id=tier_id)
            
            # Search by email or username
            search = request.query_params.get('search')
            if search:
                users = users.filter(
                    Q(email__icontains=search) | Q(username__icontains=search)
                )
            
            # Pagination
            paginator = AdminPagination()
            page = paginator.paginate_queryset(users, request)
            
            if page is not None:
                data = []
                for user in page:
                    user_data = {
                        'user_id': str(user.id),
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'date_joined': user.date_joined,
                        'is_active': user.is_active,
                        'status': user.status,
                    }
                    
                    # Add subscription details if exists
                    if hasattr(user, 'subscription'):
                        sub = user.subscription
                        user_data['subscription'] = {
                            'subscription_id': str(sub.id),
                            'tier_name': sub.tier.display_name,
                            'tier_id': str(sub.tier.id),
                            'status': sub.status,
                            'price': str(sub.tier.price),
                            'billing_interval': sub.tier.billing_interval,
                            'current_period_start': sub.current_period_start,
                            'current_period_end': sub.current_period_end,
                            'days_until_renewal': sub.days_until_renewal,
                            'cancel_at_period_end': sub.cancel_at_period_end,
                        }
                        
                        # Add usage details
                        if hasattr(sub, 'usage_limit'):
                            usage = sub.usage_limit
                            user_data['usage'] = {
                                'messages_sent': usage.messages_sent,
                                'messages_limit': usage.messages_limit,
                                'messages_remaining': usage.messages_remaining,
                                'conversations_used': usage.conversations_used,
                                'conversations_limit': usage.conversations_limit,
                                'interactive_minutes_used': usage.interactive_minutes_used,
                                'interactive_minutes_limit': usage.interactive_minutes_limit,
                                'video_minutes_used': usage.video_minutes_used,
                                'video_minutes_limit': usage.video_minutes_limit,
                            }
                    else:
                        user_data['subscription'] = None
                        user_data['usage'] = None
                    
                    data.append(user_data)
                
                paginated_response = paginator.get_paginated_response(data)
                return Response({
                    'success': True,
                    'message': 'Users with subscriptions retrieved successfully',
                    'data': paginated_response.data
                })
            
            return Response({
                'success': False,
                'message': 'Pagination failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminAllBillingDetailsAPIView(APIView):
    """
    Admin endpoint to get all billing/payment details.
    
    GET /api/admin/billing-details/
    
    Query parameters:
    - page: Page number (default 1)
    - page_size: Items per page (default 20)
    - status: Filter by payment status (completed, pending, failed)
    - user_id: Filter by specific user
    - start_date: From date (ISO format)
    - end_date: To date (ISO format)
    - min_amount: Minimum amount filter
    - max_amount: Maximum amount filter
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get all billing/payment details"""
        try:
            # Base queryset
            payments = Payment.objects.select_related(
                'user',
                'subscription__tier'
            ).order_by('-created_at')
            
            # Filter by status
            pay_status = request.query_params.get('status')
            if pay_status:
                payments = payments.filter(status=pay_status)
            
            # Filter by user
            user_id = request.query_params.get('user_id')
            if user_id:
                payments = payments.filter(user_id=user_id)
            
            # Filter by date range
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date:
                payments = payments.filter(created_at__gte=start_date)
            if end_date:
                payments = payments.filter(created_at__lte=end_date)
            
            # Filter by amount
            min_amount = request.query_params.get('min_amount')
            max_amount = request.query_params.get('max_amount')
            if min_amount:
                payments = payments.filter(final_amount__gte=float(min_amount))
            if max_amount:
                payments = payments.filter(final_amount__lte=float(max_amount))
            
            # Pagination
            paginator = AdminPagination()
            page = paginator.paginate_queryset(payments, request)
            
            if page is not None:
                data = []
                for payment in page:
                    payment_data = {
                        'payment_id': str(payment.id),
                        'user_email': payment.user.email,
                        'user_id': str(payment.user.id),
                        'original_amount': str(payment.original_amount),
                        'discount_amount': str(payment.discount_amount),
                        'final_amount': str(payment.final_amount),
                        'currency': payment.currency,
                        'status': payment.status,
                        'stripe_payment_intent_id': payment.stripe_payment_intent_id,
                        'created_at': payment.created_at,
                        'updated_at': payment.updated_at,
                    }
                    
                    # Add subscription tier if available
                    if payment.subscription:
                        payment_data['subscription_tier'] = payment.subscription.tier.display_name
                        payment_data['subscription_id'] = str(payment.subscription.id)
                    
                    data.append(payment_data)
                
                paginated_response = paginator.get_paginated_response(data)
                return Response({
                    'success': True,
                    'message': 'Billing details retrieved successfully',
                    'data': paginated_response.data
                })
            
            return Response({
                'success': False,
                'message': 'Pagination failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminInvoicesAPIView(APIView):
    """
    Admin endpoint to get all invoices.
    
    GET /api/admin/invoices/
    
    Query parameters:
    - page: Page number (default 1)
    - page_size: Items per page (default 20)
    - status: Filter by invoice status
    - user_id: Filter by specific user
    - subscription_id: Filter by subscription
    - start_date: From date (ISO format)
    - end_date: To date (ISO format)
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get all invoices"""
        try:
            # Base queryset
            invoices = Invoice.objects.select_related(
                'payment__user',
                'payment__subscription__tier'
            ).order_by('-created_at')
            
            # Filter by status
            inv_status = request.query_params.get('status')
            if inv_status:
                invoices = invoices.filter(status=inv_status)
            
            # Filter by user
            user_id = request.query_params.get('user_id')
            if user_id:
                invoices = invoices.filter(payment__user_id=user_id)
            
            # Filter by subscription
            subscription_id = request.query_params.get('subscription_id')
            if subscription_id:
                invoices = invoices.filter(payment__subscription_id=subscription_id)
            
            # Filter by date range
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            if start_date:
                invoices = invoices.filter(created_at__gte=start_date)
            if end_date:
                invoices = invoices.filter(created_at__lte=end_date)
            
            # Pagination
            paginator = AdminPagination()
            page = paginator.paginate_queryset(invoices, request)
            
            if page is not None:
                data = []
                for invoice in page:
                    invoice_data = {
                        'invoice_id': str(invoice.id),
                        'invoice_number': invoice.invoice_number,
                        'user_email': invoice.user.email,
                        'user_id': str(invoice.user.id),
                        'original_amount': str(invoice.original_amount),
                        'discount_amount': str(invoice.discount_amount),
                        'total_amount': str(invoice.total_amount),
                        'currency': invoice.currency,
                        'status': invoice.status,
                        'issue_date': invoice.issue_date,
                        'due_date': invoice.due_date,
                        'paid_at': invoice.paid_at,
                        'pdf_url': invoice.pdf_url,
                    }
                    
                    if invoice.subscription:
                        invoice_data['subscription_tier'] = invoice.subscription.tier.display_name
                    
                    data.append(invoice_data)
                
                paginated_response = paginator.get_paginated_response(data)
                return Response({
                    'success': True,
                    'message': 'Invoices retrieved successfully',
                    'data': paginated_response.data
                })
            
            return Response({
                'success': False,
                'message': 'Pagination failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminSubscriptionSummaryAPIView(APIView):
    """
    Admin endpoint to get summary statistics of all subscriptions.
    
    GET /api/admin/subscription-summary/
    
    Returns:
    - Total active subscriptions
    - Breakdown by tier
    - Total revenue this month
    - Upcoming renewals
    - Canceled subscriptions
    """
    
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get subscription summary statistics"""
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            now = timezone.now()
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
            
            # Count by status
            active_count = Subscription.objects.filter(status='active').count()
            past_due_count = Subscription.objects.filter(status='past_due').count()
            canceled_count = Subscription.objects.filter(status='canceled').count()
            incomplete_count = Subscription.objects.filter(status='incomplete').count()
            
            # Count by tier
            tier_breakdown = {}
            from subscriptions.models import SubscriptionTier
            for tier in SubscriptionTier.objects.filter(is_active=True):
                count = Subscription.objects.filter(tier=tier, status='active').count()
                if count > 0:
                    tier_breakdown[tier.display_name] = count
            
            # Revenue this month
            monthly_revenue = Payment.objects.filter(
                created_at__gte=month_start,
                created_at__lte=month_end,
                status='completed'
            ).values('currency').annotate(
                total=__import__('django.db.models', fromlist=['Sum']).Sum('amount')
            )
            
            revenue_by_currency = {}
            for item in monthly_revenue:
                revenue_by_currency[item['currency']] = str(item['total'])
            
            # Upcoming renewals (next 7 days)
            week_from_now = now + timedelta(days=7)
            upcoming_renewals = Subscription.objects.filter(
                current_period_end__gte=now,
                current_period_end__lte=week_from_now,
                status='active'
            ).count()
            
            return Response({
                'success': True,
                'message': 'Subscription summary retrieved successfully',
                'data': {
                    'subscription_counts': {
                        'active': active_count,
                        'past_due': past_due_count,
                        'canceled': canceled_count,
                        'incomplete': incomplete_count,
                        'total': active_count + past_due_count + canceled_count + incomplete_count
                    },
                    'breakdown_by_tier': tier_breakdown,
                    'monthly_revenue': revenue_by_currency,
                    'upcoming_renewals_next_7_days': upcoming_renewals,
                    'period': {
                        'start': month_start,
                        'end': month_end,
                        'current_date': now
                    }
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
