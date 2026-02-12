from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import SubscriptionTier, Subscription, UsageLimit
from analytics.activity_utils import (
    log_subscription_created,
    log_subscription_upgraded,
    log_subscription_canceled,
    log_admin_action,
)
from .serializers import (
    SubscriptionTierSerializer,
    SubscriptionTierAdminSerializer,
    SubscriptionDetailSerializer,
    SubscriptionCreateSerializer,
    UsageLimitSerializer,
)


class IsAdmin(permissions.BasePermission):
    """Check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class SubscriptionTierListAPIView(APIView):
    """
    List all active subscription tiers or create new tier (admin only).
    """
    
    @swagger_auto_schema(
        operation_summary="List Subscription Tiers",
        operation_description="Get all available subscription tiers",
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
            200: openapi.Response(description="Tiers retrieved successfully"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def get(self, request):
        """Get all active subscription tiers"""
        permission_classes = [IsAuthenticated]
        tiers = SubscriptionTier.objects.filter(is_active=True).order_by('display_order')
        serializer = SubscriptionTierSerializer(tiers, many=True)
        
        return Response({
            'success': True,
            'message': 'Subscription tiers retrieved successfully',
            'data': serializer.data
        })
    
    @swagger_auto_schema(
        operation_summary="Create Subscription Tier",
        operation_description="Create a new subscription tier (admin only)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['display_name', 'price', 'billing_interval'],
            properties={
                'display_name': openapi.Schema(type=openapi.TYPE_STRING, description='Display name (e.g., Pro, Business)'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='Tier description'),
                'price': openapi.Schema(type=openapi.TYPE_NUMBER, description='Price in USD'),
                'billing_interval': openapi.Schema(type=openapi.TYPE_STRING, enum=['month', 'year'], description='Billing interval'),
                'conversations_per_month': openapi.Schema(type=openapi.TYPE_INTEGER, description='Conversations limit (0 = unlimited)'),
                'video_minutes_per_month': openapi.Schema(type=openapi.TYPE_INTEGER, description='Video minutes limit (0 = unlimited)'),
                'max_concurrent_sessions': openapi.Schema(type=openapi.TYPE_INTEGER, description='Max concurrent sessions'),
                'features': openapi.Schema(type=openapi.TYPE_OBJECT, description='Features JSON object'),
                'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Is tier active'),
                'is_featured': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Is tier featured'),
                'display_order': openapi.Schema(type=openapi.TYPE_INTEGER, description='Display order'),
            }
        ),
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token (Admin only)",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            201: openapi.Response(description="Tier created successfully"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Admin access required")
        }
    )
    def post(self, request):
        """Create a new subscription tier (admin only)"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = SubscriptionTierAdminSerializer(data=request.data)
        if serializer.is_valid():
            tier = serializer.save()
            
            # Log tier creation
            try:
                log_admin_action(
                    request=request,
                    action='tier_created',
                    resource_type='tier',
                    resource_id=str(tier.id),
                    description=f'Admin created subscription tier: {tier.display_name}',
                    metadata={'price': str(tier.price), 'billing_interval': tier.billing_interval}
                )
            except:
                pass
            
            return Response({
                'success': True,
                'message': 'Subscription tier created successfully',
                'data': SubscriptionTierAdminSerializer(tier).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class CurrentSubscriptionAPIView(APIView):
    """
    Get user's current subscription details.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get Current Subscription",
        operation_description="Get user's current subscription and usage",
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
            200: openapi.Response(description="Subscription retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            404: openapi.Response(description="No subscription found")
        }
    )
    def get(self, request):
        """Get current subscription"""
        try:
            subscription = request.user.subscription
            serializer = SubscriptionDetailSerializer(subscription)
            
            return Response({
                'success': True,
                'message': 'Subscription retrieved successfully',
                'data': serializer.data
            })
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No subscription found for user'
            }, status=status.HTTP_404_NOT_FOUND)


class SubscriptionUsageAPIView(APIView):
    """
    Get user's current usage statistics.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get Usage Statistics",
        operation_description="Get current usage against subscription limits",
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
            200: openapi.Response(description="Usage retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            404: openapi.Response(description="No subscription found")
        }
    )
    def get(self, request):
        """Get usage statistics"""
        try:
            subscription = request.user.subscription
            usage_limit = subscription.usage_limit
            
            serializer = UsageLimitSerializer(usage_limit)
            
            return Response({
                'success': True,
                'message': 'Usage statistics retrieved successfully',
                'tier': {
                    'id': str(subscription.tier.id),
                    'tier': subscription.tier.tier,
                    'name': subscription.tier.name,
                    'display_name': subscription.tier.display_name,
                },
                'data': serializer.data
            })
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No subscription found for user'
            }, status=status.HTTP_404_NOT_FOUND)


class SubscriptionUpgradeAPIView(APIView):
    """
    Upgrade or downgrade subscription.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Upgrade/Downgrade Subscription",
        operation_description="Change subscription to a different tier",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['tier_id'],
            properties={
                'tier_id': openapi.Schema(type=openapi.TYPE_STRING, format='uuid', description='Target tier ID'),
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
            200: openapi.Response(description="Upgrade initiated, payment required"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def post(self, request):
        """Initiate subscription upgrade"""
        serializer = SubscriptionCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        tier_id = serializer.validated_data['tier_id']
        
        tier = get_object_or_404(SubscriptionTier, id=tier_id, is_active=True)
        
        # Check if user already has subscription
        try:
            current_sub = request.user.subscription
            if current_sub.tier_id == tier.id:
                return Response({
                    'success': False,
                    'message': f'Already subscribed to {tier.display_name}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Log subscription upgrade
            try:
                log_subscription_upgraded(
                    request,
                    current_sub,
                    current_sub.tier,
                    tier,
                    description=f'User initiated upgrade from {current_sub.tier.display_name} to {tier.display_name}'
                )
            except:
                pass
        except Subscription.DoesNotExist:
            pass
        
        # Return tier details and price info
        return Response({
            'success': True,
            'message': 'Ready to process payment',
            'data': {
                'tier': {
                    'id': str(tier.id),
                    'name': tier.display_name,
                    'price': str(tier.price),
                    'billing_interval': tier.billing_interval,
                },
                'requires_payment': tier.price > 0,
            }
        })


class SubscriptionTierDetailAPIView(APIView):
    """
    Retrieve, update, or delete a specific subscription tier (admin only).
    """
    
    @swagger_auto_schema(
        operation_summary="Get Subscription Tier",
        operation_description="Get a specific subscription tier by ID",
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
            200: openapi.Response(description="Tier retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            404: openapi.Response(description="Tier not found")
        }
    )
    def get(self, request, tier_id):
        """Get a specific subscription tier"""
        try:
            tier = get_object_or_404(SubscriptionTier, id=tier_id)
            serializer = SubscriptionTierAdminSerializer(tier)
            return Response({
                'success': True,
                'message': 'Subscription tier retrieved successfully',
                'data': serializer.data
            })
        except:
            return Response({
                'success': False,
                'message': 'Subscription tier not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        operation_summary="Update Subscription Tier",
        operation_description="Update a subscription tier (admin only)",
        request_body=SubscriptionTierAdminSerializer,
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token (Admin only)",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(description="Tier updated successfully"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Admin access required"),
            404: openapi.Response(description="Tier not found")
        }
    )
    def put(self, request, tier_id):
        """Update a subscription tier (admin only)"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tier = get_object_or_404(SubscriptionTier, id=tier_id)
            serializer = SubscriptionTierAdminSerializer(tier, data=request.data, partial=True)
            
            if serializer.is_valid():
                tier = serializer.save()
                
                # Log tier update
                try:
                    log_admin_action(
                        request=request,
                        action='tier_updated',
                        resource_type='tier',
                        resource_id=str(tier.id),
                        description=f'Admin updated subscription tier: {tier.display_name}',
                        metadata={
                            'updated_fields': list(serializer.validated_data.keys()),
                            'price': str(tier.price),
                            'billing_interval': tier.billing_interval
                        }
                    )
                except:
                    pass
                
                return Response({
                    'success': True,
                    'message': 'Subscription tier updated successfully',
                    'data': SubscriptionTierAdminSerializer(tier).data
                })
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({
                'success': False,
                'message': 'Subscription tier not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        operation_summary="Delete Subscription Tier",
        operation_description="Delete a subscription tier (admin only)",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token (Admin only)",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(description="Tier deleted successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Admin access required"),
            404: openapi.Response(description="Tier not found")
        }
    )
    def delete(self, request, tier_id):
        """Delete a subscription tier (admin only)"""
        if not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'Admin access required'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            tier = get_object_or_404(SubscriptionTier, id=tier_id)
            
            # Log tier deletion
            try:
                log_admin_action(
                    request=request,
                    action='tier_deleted',
                    resource_type='tier',
                    resource_id=str(tier.id),
                    description=f'Admin deleted subscription tier: {tier.display_name}',
                    metadata={'price': str(tier.price), 'billing_interval': tier.billing_interval}
                )
            except:
                pass
            
            tier.delete()
            return Response({
                'success': True,
                'message': 'Subscription tier deleted successfully'
            })
        except:
            return Response({
                'success': False,
                'message': 'Subscription tier not found'
            }, status=status.HTTP_404_NOT_FOUND)


class SubscriptionCancelAPIView(APIView):
    """
    Cancel subscription at end of billing period.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Cancel Subscription",
        operation_description="Cancel subscription (effective at end of billing period)",
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
            200: openapi.Response(description="Subscription canceled successfully"),
            401: openapi.Response(description="Authentication required"),
            404: openapi.Response(description="No active subscription found")
        }
    )
    def post(self, request):
        """Cancel subscription"""
        try:
            subscription = request.user.subscription
            
            if subscription.status != 'active':
                return Response({
                    'success': False,
                    'message': f'Cannot cancel subscription with status: {subscription.status}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            subscription.cancel_at_period_end = True
            subscription.save(update_fields=['cancel_at_period_end', 'updated_at'])
            
            # Log subscription cancellation
            try:
                log_subscription_canceled(
                    request,
                    subscription,
                    description=f'User canceled {subscription.tier.display_name} subscription'
                )
            except:
                pass
            
            return Response({
                'success': True,
                'message': 'Subscription will be canceled at end of billing period',
                'data': {
                    'id': str(subscription.id),
                    'cancel_at_period_end': subscription.cancel_at_period_end,
                    'current_period_end': subscription.current_period_end
                }
            })
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No active subscription found'
            }, status=status.HTTP_404_NOT_FOUND)


class UpdateInteractiveMinutesAPIView(APIView):
    """
    Update user's interactive minutes usage.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Update Interactive Minutes Usage",
        operation_description="Increment user's interactive minutes usage for current billing period",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['minutes'],
            properties={
                'minutes': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='Number of interactive minutes to add (must be positive)'
                ),
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
            200: openapi.Response(description="Interactive minutes updated successfully"),
            400: openapi.Response(description="Validation failed or usage limit exceeded"),
            401: openapi.Response(description="Authentication required"),
            404: openapi.Response(description="No subscription found")
        }
    )
    def post(self, request):
        """Update interactive minutes usage"""
        try:
            # Validate request data
            minutes = request.data.get('minutes')
            
            if minutes is None:
                return Response({
                    'success': False,
                    'message': 'minutes parameter is required',
                    'errors': {'minutes': 'This field is required'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                minutes = int(minutes)
            except (ValueError, TypeError):
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': {'minutes': 'Must be a valid integer'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if minutes <= 0:
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': {'minutes': 'Must be a positive number'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get user's subscription and usage limit
            subscription = request.user.subscription
            usage_limit = subscription.usage_limit
            
            # Check if usage limit would be exceeded
            if usage_limit.interactive_minutes_limit > 0:  # 0 means unlimited
                if usage_limit.interactive_minutes_used + minutes > usage_limit.interactive_minutes_limit:
                    return Response({
                        'success': False,
                        'message': 'Interactive minutes limit would be exceeded',
                        'data': {
                            'current_usage': usage_limit.interactive_minutes_used,
                            'limit': usage_limit.interactive_minutes_limit,
                            'requested': minutes,
                            'remaining': usage_limit.interactive_minutes_remaining,
                        }
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Increment interactive minutes
            usage_limit.increment_interactive_minutes(minutes)
            
            # Log the update
            try:
                log_admin_action(
                    request=request,
                    action='interactive_minutes_updated',
                    resource_type='usage',
                    resource_id=str(usage_limit.subscription.id),
                    description=f'User added {minutes} interactive minutes',
                    metadata={
                        'minutes_added': minutes,
                        'total_used': usage_limit.interactive_minutes_used,
                        'limit': usage_limit.interactive_minutes_limit,
                    }
                )
            except:
                pass
            
            return Response({
                'success': True,
                'message': 'Interactive minutes updated successfully',
                'data': {
                    'minutes_added': minutes,
                    'total_used': usage_limit.interactive_minutes_used,
                    'limit': usage_limit.interactive_minutes_limit,
                    'remaining': usage_limit.interactive_minutes_remaining,
                    'percentage_used': round(usage_limit.interactive_minutes_percentage, 2),
                }
            }, status=status.HTTP_200_OK)
            
        except Subscription.DoesNotExist:
            return Response({
                'success': False,
                'message': 'No subscription found for user'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'An error occurred',
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
