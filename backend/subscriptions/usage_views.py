"""
API views for managing usage tracking and limits.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from subscriptions.models import UsageLimit, Subscription
from django.utils import timezone
from django.db import transaction


class UsageViewSet(viewsets.ViewSet):
    """
    API endpoints for tracking and managing user usage.
    
    Endpoints:
    - GET /api/usage/ - Get current usage summary
    - POST /api/usage/check-limit/ - Check if user can perform action
    - PUT /api/usage/override-limits/ - Admin: Override limits for user
    - POST /api/usage/reset/ - Admin: Manually reset usage period
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_user_usage_limit(self, user):
        """Get or create usage limit for user"""
        try:
            subscription = user.subscription
            return subscription.usage_limit
        except (Subscription.DoesNotExist, AttributeError):
            return None
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        GET /api/usage/current/
        Get current usage summary for authenticated user
        """
        usage_limit = self.get_user_usage_limit(request.user)
        
        if not usage_limit:
            return Response(
                {
                    'error': 'No active subscription found',
                    'error_code': 'NO_SUBSCRIPTION'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'success': True,
            'usage': usage_limit.get_usage_summary()
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def check_limit(self, request):
        """
        POST /api/usage/check-limit/
        
        Check if user can perform an action without exceeding limits.
        
        Body:
        {
            "action": "send_message",  // or: send_messages, start_interactive, create_conversation
            "quantity": 1,  // how many/much to consume
            "allow_deduction": false  // if true, automatically deduct if allowed
        }
        
        Response:
        {
            "allowed": true/false,
            "reason": "...",
            "usage": { ... },
            "deducted": false/true  // if allow_deduction was true
        }
        """
        try:
            usage_limit = self.get_user_usage_limit(request.user)
            if not usage_limit:
                return Response(
                    {
                        'error': 'No active subscription found',
                        'error_code': 'NO_SUBSCRIPTION'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            action = request.data.get('action')
            quantity = request.data.get('quantity', 1)
            allow_deduction = request.data.get('allow_deduction', False)
            
            # Check subscription still active
            subscription = request.user.subscription
            if subscription.status != 'active':
                return Response({
                    'success': False,
                    'allowed': False,
                    'reason': f"Subscription is {subscription.status}",
                    'deducted': False,
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check period not expired
            if timezone.now() > usage_limit.period_end:
                return Response({
                    'success': False,
                    'allowed': False,
                    'reason': 'Billing period has ended',
                    'deducted': False,
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Check specific action limits
            allowed, reason = self._check_action_limit(usage_limit, action, quantity)
            
            deducted = False
            if allowed and allow_deduction:
                self._deduct_usage(usage_limit, action, quantity)
                deducted = True
            
            return Response({
                'success': True,
                'allowed': allowed,
                'reason': reason,
                'deducted': deducted,
                'usage': usage_limit.get_usage_summary()
            }, status=status.HTTP_200_OK if allowed else status.HTTP_403_FORBIDDEN)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _check_action_limit(self, usage_limit, action, quantity=1):
        """
        Check if user has enough quota for action.
        Returns: (allowed: bool, reason: str)
        """
        if action == 'send_message' or action == 'send_messages':
            if usage_limit.messages_limit > 0:
                if usage_limit.messages_sent + quantity > usage_limit.messages_limit:
                    remaining = usage_limit.messages_remaining
                    return False, (
                        f"Not enough message quota. "
                        f"You have {remaining} messages remaining, "
                        f"need {quantity}."
                    )
            return True, ""
        
        elif action == 'start_interactive' or action == 'interactive_minutes':
            if usage_limit.interactive_minutes_limit > 0:
                if usage_limit.interactive_minutes_used + quantity > usage_limit.interactive_minutes_limit:
                    remaining = usage_limit.interactive_minutes_remaining
                    return False, (
                        f"Not enough interactive minutes. "
                        f"You have {remaining} minutes remaining, "
                        f"need {quantity}."
                    )
            return True, ""
        
        elif action == 'create_conversation' or action == 'new_conversation':
            if usage_limit.conversations_limit > 0:
                if usage_limit.conversations_used + quantity > usage_limit.conversations_limit:
                    remaining = usage_limit.conversations_remaining
                    return False, (
                        f"Not enough conversations. "
                        f"You have {remaining} conversations remaining, "
                        f"need {quantity}."
                    )
            return True, ""
        
        elif action == 'video_minutes':
            if usage_limit.video_minutes_limit > 0:
                if usage_limit.video_minutes_used + quantity > usage_limit.video_minutes_limit:
                    remaining = usage_limit.video_minutes_remaining
                    return False, (
                        f"Not enough video minutes. "
                        f"You have {remaining} minutes remaining, "
                        f"need {quantity}."
                    )
            return True, ""
        
        return True, f"Unknown action: {action}"
    
    def _deduct_usage(self, usage_limit, action, quantity):
        """Deduct usage from user's quota"""
        if action == 'send_message' or action == 'send_messages':
            usage_limit.increment_messages(quantity)
        elif action == 'start_interactive' or action == 'interactive_minutes':
            usage_limit.increment_interactive_minutes(quantity)
        elif action == 'create_conversation' or action == 'new_conversation':
            usage_limit.increment_conversation(quantity)
        elif action == 'video_minutes':
            usage_limit.increment_video_minutes(quantity)
    
    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def override_limits(self, request):
        """
        PUT /api/usage/override-limits/
        
        ADMIN ONLY: Override user limits (for trials, support, etc.)
        
        Body:
        {
            "user_id": "uuid-of-user",  // admin specifying which user
            "messages_limit": 1000,
            "interactive_minutes_limit": 5,
            "conversations_limit": 50,
            "video_minutes_limit": 30,
            "reason": "Trial upgrade for customer support"  // optional
        }
        """
        # Check if admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin permission required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from users.models import User
            
            user_id = request.data.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get target user
            target_user = User.objects.get(id=user_id)
            usage_limit = self.get_user_usage_limit(target_user)
            
            if not usage_limit:
                return Response(
                    {'error': 'User has no active subscription'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Extract limits to override
            override_data = {
                k: v for k, v in request.data.items()
                if k in [
                    'messages_limit',
                    'interactive_minutes_limit',
                    'conversations_limit',
                    'video_minutes_limit',
                    'max_concurrent_sessions'
                ] and v is not None
            }
            
            # Apply overrides
            usage_limit.override_limits(**override_data)
            
            # Log the action
            from analytics.activity_models import ActivityLog
            reason = request.data.get('reason', 'Limit override')
            ActivityLog.log_activity(
                user=request.user,
                action='limit_override',
                resource_type='subscription',
                resource_id=str(usage_limit.subscription.id),
                metadata={
                    'target_user': str(target_user.id),
                    'changes': override_data,
                    'reason': reason,
                }
            )
            
            return Response({
                'success': True,
                'message': f'Limits updated for {target_user.email}',
                'usage': usage_limit.get_usage_summary()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def reset(self, request):
        """
        POST /api/usage/reset/
        
        ADMIN ONLY: Manually reset usage for a user (for current period only)
        
        Body:
        {
            "user_id": "uuid-of-user",  // admin specifying which user
            "reason": "Customer complaint resolution"  // optional
        }
        """
        # Check if admin
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin permission required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from users.models import User
            
            user_id = request.data.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get target user
            target_user = User.objects.get(id=user_id)
            usage_limit = self.get_user_usage_limit(target_user)
            
            if not usage_limit:
                return Response(
                    {'error': 'User has no active subscription'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Reset usage
            old_usage = {
                'messages_sent': usage_limit.messages_sent,
                'interactive_minutes_used': usage_limit.interactive_minutes_used,
                'conversations_used': usage_limit.conversations_used,
                'video_minutes_used': usage_limit.video_minutes_used,
            }
            
            usage_limit.reset_usage()
            
            # Log the action
            from analytics.activity_models import ActivityLog
            reason = request.data.get('reason', 'Usage reset')
            ActivityLog.log_activity(
                user=request.user,
                action='usage_reset',
                resource_type='subscription',
                resource_id=str(usage_limit.subscription.id),
                metadata={
                    'target_user': str(target_user.id),
                    'old_usage': old_usage,
                    'reason': reason,
                }
            )
            
            return Response({
                'success': True,
                'message': f'Usage reset for {target_user.email}',
                'usage': usage_limit.get_usage_summary()
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
