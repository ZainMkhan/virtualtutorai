from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class ActivityLog(models.Model):
    """
    Model to track user activities for audit, security, and analytics purposes.
    """
    
    ACTION_CHOICES = [
        # Authentication
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('password_change', 'Password Changed'),
        ('password_reset', 'Password Reset'),
        
        # Subscription
        ('subscription_created', 'Subscription Created'),
        ('subscription_upgraded', 'Subscription Upgraded'),
        ('subscription_downgraded', 'Subscription Downgraded'),
        ('subscription_canceled', 'Subscription Canceled'),
        ('subscription_renewed', 'Subscription Renewed'),
        
        # Payments
        ('payment_initiated', 'Payment Initiated'),
        ('payment_succeeded', 'Payment Succeeded'),
        ('payment_failed', 'Payment Failed'),
        ('payment_refunded', 'Payment Refunded'),
        ('discount_applied', 'Discount Code Applied'),
        
        # Content
        ('conversation_created', 'Conversation Created'),
        ('conversation_deleted', 'Conversation Deleted'),
        ('message_sent', 'Message Sent'),
        ('resource_accessed', 'Resource Accessed'),
        ('video_started', 'Video Started'),
        ('video_completed', 'Video Completed'),
        
        # Account
        ('profile_updated', 'Profile Updated'),
        ('avatar_uploaded', 'Avatar Uploaded'),
        ('settings_changed', 'Settings Changed'),
        
        # Admin
        ('user_deleted', 'User Deleted (Admin)'),
        ('user_suspended', 'User Suspended (Admin)'),
        ('user_restored', 'User Restored (Admin)'),
        ('tier_created', 'Subscription Tier Created (Admin)'),
        ('tier_updated', 'Subscription Tier Updated (Admin)'),
        ('tier_deleted', 'Subscription Tier Deleted (Admin)'),
    ]
    
    RESOURCE_TYPE_CHOICES = [
        ('user', 'User'),
        ('subscription', 'Subscription'),
        ('payment', 'Payment'),
        ('conversation', 'Conversation'),
        ('message', 'Message'),
        ('avatar', 'Avatar'),
        ('tier', 'Subscription Tier'),
        ('discount', 'Discount Code'),
        ('invoice', 'Invoice'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    
    # Action details
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPE_CHOICES)
    resource_id = models.CharField(max_length=255, null=True, blank=True, help_text="ID of the resource affected")
    
    # Request details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    # Additional context
    description = models.TextField(null=True, blank=True, help_text="Human-readable description of the action")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional JSON metadata")
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[('success', 'Success'), ('failure', 'Failure'), ('pending', 'Pending')],
        default='success'
    )
    error_message = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
            models.Index(fields=['resource_type', '-created_at']),
        ]
        verbose_name_plural = 'Activity Logs'
    
    def __str__(self):
        return f"{self.user.email} - {self.get_action_display()} - {self.created_at}"
    
    @classmethod
    def log_activity(cls, user, action, resource_type, resource_id=None, 
                     ip_address=None, user_agent=None, description=None, 
                     metadata=None, status='success', error_message=None):
        """
        Convenience method to create an activity log.
        
        Usage:
            ActivityLog.log_activity(
                user=request.user,
                action='login',
                resource_type='user',
                resource_id=str(request.user.id),
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                description='User logged in successfully'
            )
        """
        return cls.objects.create(
            user=user,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            description=description,
            metadata=metadata or {},
            status=status,
            error_message=error_message
        )
