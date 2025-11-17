"""
Utility functions for logging user activities throughout the application.

Usage:
    from analytics.activity_utils import log_user_activity
    
    # Log a login
    log_user_activity(
        request=request,
        action='login',
        resource_type='user',
        description='User logged in successfully'
    )
    
    # Log a payment
    log_user_activity(
        request=request,
        action='payment_succeeded',
        resource_type='payment',
        resource_id=str(payment.id),
        metadata={'amount': payment.final_amount, 'tier': str(payment.tier.id)}
    )
"""

from .activity_models import ActivityLog


def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip


def get_user_agent(request):
    """Extract user agent from request"""
    return request.META.get('HTTP_USER_AGENT', '')


def log_user_activity(request, action, resource_type, resource_id=None, 
                      description=None, metadata=None, status='success', 
                      error_message=None, user=None):
    """
    Log a user activity to the database.
    
    Args:
        request: Django request object
        action: Activity action (e.g., 'login', 'payment_succeeded')
        resource_type: Type of resource affected (e.g., 'user', 'payment')
        resource_id: ID of the affected resource (optional)
        description: Human-readable description (optional)
        metadata: Additional JSON metadata (optional, dict)
        status: 'success', 'failure', or 'pending' (default: 'success')
        error_message: Error message if status is 'failure' (optional)
        user: User object (defaults to request.user if not provided)
    
    Returns:
        ActivityLog instance or None if logging fails
    """
    try:
        if user is None:
            user = request.user
        
        # Don't log anonymous users
        if not user or not user.is_authenticated:
            return None
        
        log = ActivityLog.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            metadata=metadata or {},
            status=status,
            error_message=error_message,
            ip_address=get_client_ip(request),
            user_agent=get_user_agent(request),
        )
        return log
    except Exception as e:
        # Fail silently to avoid breaking main functionality
        print(f"Error logging activity: {str(e)}")
        return None


# Convenience functions for common activities

def log_login(request, description="User logged in"):
    """Log user login"""
    return log_user_activity(
        request=request,
        action='login',
        resource_type='user',
        resource_id=str(request.user.id),
        description=description
    )


def log_logout(request, description="User logged out"):
    """Log user logout"""
    return log_user_activity(
        request=request,
        action='logout',
        resource_type='user',
        resource_id=str(request.user.id),
        description=description
    )


def log_password_change(request, description="User changed password"):
    """Log password change"""
    return log_user_activity(
        request=request,
        action='password_change',
        resource_type='user',
        resource_id=str(request.user.id),
        description=description
    )


def log_subscription_created(request, subscription, description="Subscription created"):
    """Log subscription creation"""
    return log_user_activity(
        request=request,
        action='subscription_created',
        resource_type='subscription',
        resource_id=str(subscription.id),
        description=description,
        metadata={
            'tier_id': str(subscription.tier.id),
            'tier_name': subscription.tier.display_name,
            'price': str(subscription.tier.price)
        }
    )


def log_subscription_upgraded(request, subscription, old_tier, new_tier, description="Subscription upgraded"):
    """Log subscription upgrade"""
    return log_user_activity(
        request=request,
        action='subscription_upgraded',
        resource_type='subscription',
        resource_id=str(subscription.id),
        description=description,
        metadata={
            'old_tier': str(old_tier.id),
            'new_tier': str(new_tier.id),
            'old_price': str(old_tier.price),
            'new_price': str(new_tier.price)
        }
    )


def log_subscription_canceled(request, subscription, description="Subscription canceled"):
    """Log subscription cancellation"""
    return log_user_activity(
        request=request,
        action='subscription_canceled',
        resource_type='subscription',
        resource_id=str(subscription.id),
        description=description,
        metadata={
            'tier': subscription.tier.display_name,
            'end_date': str(subscription.current_period_end)
        }
    )


def log_payment_initiated(request, payment, description="Payment initiated"):
    """Log payment initiation"""
    return log_user_activity(
        request=request,
        action='payment_initiated',
        resource_type='payment',
        resource_id=str(payment.id),
        description=description,
        metadata={
            'amount': str(payment.final_amount),
            'currency': 'usd'
        }
    )


def log_payment_succeeded(request, payment, description="Payment succeeded"):
    """Log successful payment"""
    return log_user_activity(
        request=request,
        action='payment_succeeded',
        resource_type='payment',
        resource_id=str(payment.id),
        description=description,
        metadata={
            'amount': str(payment.final_amount),
            'currency': 'usd',
            'tier': payment.subscription.tier.display_name if hasattr(payment, 'subscription') else None
        }
    )


def log_payment_failed(request, payment, error_msg=None, description="Payment failed"):
    """Log failed payment"""
    return log_user_activity(
        request=request,
        action='payment_failed',
        resource_type='payment',
        resource_id=str(payment.id),
        description=description,
        status='failure',
        error_message=error_msg,
        metadata={
            'amount': str(payment.final_amount),
            'currency': 'usd'
        }
    )


def log_conversation_created(request, conversation, description="Conversation created"):
    """Log conversation creation"""
    return log_user_activity(
        request=request,
        action='conversation_created',
        resource_type='conversation',
        resource_id=str(conversation.id),
        description=description,
        metadata={
            'topic': conversation.topic if hasattr(conversation, 'topic') else None,
        }
    )


def log_message_sent(request, message, description="Message sent"):
    """Log message sending"""
    return log_user_activity(
        request=request,
        action='message_sent',
        resource_type='message',
        resource_id=str(message.id),
        description=description,
        metadata={
            'conversation_id': str(message.conversation.id) if hasattr(message, 'conversation') else None,
            'message_type': message.message_type if hasattr(message, 'message_type') else None,
        }
    )


def log_profile_updated(request, changes=None, description="Profile updated"):
    """Log profile update"""
    return log_user_activity(
        request=request,
        action='profile_updated',
        resource_type='user',
        resource_id=str(request.user.id),
        description=description,
        metadata={
            'changed_fields': changes or []
        }
    )


def log_discount_applied(request, discount, description="Discount code applied"):
    """Log discount application"""
    return log_user_activity(
        request=request,
        action='discount_applied',
        resource_type='discount',
        resource_id=str(discount.id),
        description=description,
        metadata={
            'code': discount.code,
            'discount_type': discount.discount_type if hasattr(discount, 'discount_type') else None,
        }
    )


def log_admin_action(request, action, resource_type, target_user=None, resource_id=None, 
                     description=None, metadata=None):
    """
    Log admin actions (user deletion, suspension, etc.)
    
    Args:
        request: Request from admin user
        action: Admin action (e.g., 'user_deleted', 'user_suspended')
        resource_type: Type of resource
        target_user: User being acted upon (optional)
        resource_id: Resource ID
        description: Description of action
        metadata: Additional metadata
    """
    meta = metadata or {}
    if target_user:
        meta['target_user_id'] = str(target_user.id)
        meta['target_user_email'] = target_user.email
    
    return log_user_activity(
        request=request,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        metadata=meta
    )
