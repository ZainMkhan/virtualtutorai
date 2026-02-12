from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
from users.models import User


class SubscriptionTier(models.Model):
    """
    Subscription tier/plan definition.
    Admins can create and manage different subscription levels.
    """
    
    TIER_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('pro', 'Pro'),
        ('enterprise', 'Enterprise'),
    ]
    
    BILLING_INTERVAL_CHOICES = [
        ('month', 'Monthly'),
        ('year', 'Yearly'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the tier"
    )
    
    tier = models.CharField(
        max_length=20,
        choices=TIER_CHOICES,
        help_text="Subscription tier level: free, basic, pro, enterprise"
    )
    
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Internal name: 'free', 'basic', 'pro', 'enterprise'"
    )
    
    display_name = models.CharField(
        max_length=100,
        help_text="Display name for users: 'Free', 'Basic Pro', 'Enterprise'"
    )
    
    description = models.TextField(
        blank=True,
        help_text="Tier description shown to users"
    )
    
    # Stripe reference
    stripe_price_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="Stripe Price ID for this tier"
    )
    
    # Pricing (Admin can change)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Price per billing interval"
    )
    
    billing_interval = models.CharField(
        max_length=10,
        choices=BILLING_INTERVAL_CHOICES,
        default='month',
        help_text="Billing interval"
    )
    
    # Usage Limits (Admin can change - new subscriptions will snapshot these)
    conversations_per_month = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        help_text="Maximum conversations per month"
    )
    
    video_minutes_per_month = models.IntegerField(
        default=5,
        validators=[MinValueValidator(0)],
        help_text="Maximum video minutes per month (0 = unlimited)"
    )
    
    messages_per_month = models.IntegerField(
        default=500,
        validators=[MinValueValidator(1)],
        help_text="Maximum messages per month"
    )
    
    interactive_minutes_per_month = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text="Maximum interactive minutes per month (0 = unlimited)"
    )
    
    max_concurrent_sessions = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Maximum concurrent sessions"
    )
    
    # Features (JSON for flexibility)
    features = models.JSONField(
        default=dict,
        blank=True,
        help_text="Features available in this tier (custom avatars, priority support, etc.)"
    )
    
    # Display options
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this tier is available for new subscriptions"
    )
    
    is_featured = models.BooleanField(
        default=False,
        help_text="Show this tier prominently"
    )
    
    display_order = models.IntegerField(
        default=0,
        help_text="Order to display tiers (lower first)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_tiers'
        verbose_name = 'Subscription Tier'
        verbose_name_plural = 'Subscription Tiers'
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['is_active', 'display_order']),
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return f"{self.display_name} (${self.price:.2f})"
    
    @property
    def is_free(self):
        return self.price == 0


class Subscription(models.Model):
    """
    User subscription to a tier.
    Tracks current subscription status and billing cycle.
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('incomplete', 'Incomplete'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for subscription"
    )
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='subscription',
        help_text="User with this subscription"
    )
    
    tier = models.ForeignKey(
        SubscriptionTier,
        on_delete=models.PROTECT,
        related_name='subscriptions',
        help_text="Subscription tier"
    )
    
    # Stripe references
    stripe_customer_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="Stripe Customer ID"
    )
    
    stripe_subscription_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text="Stripe Subscription ID for recurring billing"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text="Current subscription status"
    )
    
    # Billing cycle
    current_period_start = models.DateTimeField(
        help_text="Current billing period start"
    )
    
    current_period_end = models.DateTimeField(
        help_text="Current billing period end"
    )
    
    # Cancellation
    cancel_at_period_end = models.BooleanField(
        default=False,
        help_text="Cancel at end of current period"
    )
    
    canceled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When subscription was canceled"
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional subscription data"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['current_period_end']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.tier.display_name}"
    
    @property
    def is_active(self):
        return self.status == 'active'
    
    @property
    def days_until_renewal(self):
        """Days until next billing period"""
        delta = self.current_period_end - timezone.now()
        return max(0, delta.days)
    
    def create_usage_limit(self):
        """
        Create UsageLimit record by copying current tier limits.
        Called when subscription is created or activated.
        """
        from django.db import transaction
        
        with transaction.atomic():
            # Delete any existing usage limit
            if hasattr(self, 'usage_limit'):
                self.usage_limit.delete()
            
            # Create new usage limit with tier snapshot
            return UsageLimit.objects.create(
                subscription=self,
                # Copy tier limits
                conversations_limit=self.tier.conversations_per_month,
                video_minutes_limit=self.tier.video_minutes_per_month,
                messages_limit=self.tier.messages_per_month,
                interactive_minutes_limit=self.tier.interactive_minutes_per_month,
                max_concurrent_sessions=self.tier.max_concurrent_sessions,
                # Set period
                period_start=self.current_period_start,
                period_end=self.current_period_end,
            )


class UsageLimit(models.Model):
    """
    Track usage against subscription tier limits.
    Resets monthly based on subscription period.
    
    IMPORTANT: Limits are DENORMALIZED from tier at subscription time.
    This allows admins to change tier limits without affecting existing users.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier"
    )
    
    subscription = models.OneToOneField(
        Subscription,
        on_delete=models.CASCADE,
        related_name='usage_limit',
        help_text="Associated subscription"
    )
    
    # ============ TIER LIMITS (Denormalized at subscription time) ============
    # These are copied from SubscriptionTier when user subscribes
    # Allows tier limits to change without affecting existing users
    
    conversations_limit = models.IntegerField(
        default=10,
        validators=[MinValueValidator(1)],
        help_text="Max conversations this user can have per month (snapshot from tier)"
    )
    
    video_minutes_limit = models.IntegerField(
        default=5,
        validators=[MinValueValidator(0)],
        help_text="Max video minutes this user can use per month (0=unlimited, snapshot from tier)"
    )
    
    messages_limit = models.IntegerField(
        default=500,
        validators=[MinValueValidator(1)],
        help_text="Max messages this user can send per month (snapshot from tier)"
    )
    
    interactive_minutes_limit = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text="Max interactive minutes this user can use per month (0=unlimited, snapshot from tier)"
    )
    
    max_concurrent_sessions = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Max concurrent sessions (snapshot from tier)"
    )
    
    # ============ CURRENT USAGE (resets monthly) ============
    
    messages_sent = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Messages sent this period"
    )
    
    interactive_minutes_used = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Interactive minutes used this period"
    )
    
    # Period dates
    period_start = models.DateTimeField(
        help_text="When current period started"
    )
    
    period_end = models.DateTimeField(
        help_text="When current period ends"
    )
    
    # Tracking
    last_reset_at = models.DateTimeField(
        auto_now=True,
        help_text="Last time usage was reset"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'usage_limits'
        verbose_name = 'Usage Limit'
        verbose_name_plural = 'Usage Limits'
        indexes = [
            models.Index(fields=['subscription', 'period_end']),
        ]
    
    def __str__(self):
        return f"{self.subscription.user.email} - Usage ({self.messages_sent}/{self.messages_limit} msgs)"
    
    # ============ REMAINING CALCULATIONS ============
    
    @property
    def messages_remaining(self):
        """Get remaining messages in period"""
        if self.messages_limit == 0:  # 0 means unlimited
            return float('inf')
        return max(0, self.messages_limit - self.messages_sent)
    
    @property
    def interactive_minutes_remaining(self):
        """Get remaining interactive minutes in period"""
        if self.interactive_minutes_limit == 0:  # 0 means unlimited
            return float('inf')
        return max(0, self.interactive_minutes_limit - self.interactive_minutes_used)
    
    # ============ PERCENTAGE CALCULATIONS ============
    
    @property
    def messages_percentage(self):
        """Percentage of messages used"""
        if self.messages_limit == 0:
            return 0
        return (self.messages_sent / self.messages_limit) * 100
    
    @property
    def interactive_minutes_percentage(self):
        """Percentage of interactive minutes used"""
        if self.interactive_minutes_limit == 0:
            return 0
        return (self.interactive_minutes_used / self.interactive_minutes_limit) * 100
    
    # ============ USAGE MANAGEMENT ============
    
    def reset_usage(self):
        """Reset usage counters for new period"""
        self.messages_sent = 0
        self.interactive_minutes_used = 0
        self.period_start = timezone.now()
        self.period_end = self.subscription.current_period_end
        self.save(update_fields=[
            'messages_sent', 'interactive_minutes_used',
            'period_start', 'period_end'
        ])
    
    def increment_messages(self, amount=1):
        """Increment messages counter"""
        self.messages_sent += amount
        self.save(update_fields=['messages_sent'])
    
    def increment_interactive_minutes(self, minutes):
        """Increment interactive minutes counter"""
        self.interactive_minutes_used += minutes
        self.save(update_fields=['interactive_minutes_used'])
    
    def update_limits_from_tier(self):
        """
        Update limits from current tier (useful when tier changes)
        Called when user upgrades/downgrades subscription
        """
        tier = self.subscription.tier
        self.conversations_limit = tier.conversations_per_month
        self.video_minutes_limit = tier.video_minutes_per_month
        self.messages_limit = getattr(tier, 'messages_per_month', 500)
        self.interactive_minutes_limit = getattr(tier, 'interactive_minutes_per_month', 1)
        self.max_concurrent_sessions = tier.max_concurrent_sessions
        self.save()
    
    def override_limits(self, **kwargs):
        """
        Manually override limits (for admin adjustments, trials, etc.)
        Example: usage_limit.override_limits(messages_limit=1000, interactive_minutes_limit=5)
        """
        allowed_fields = [
            'conversations_limit',
            'video_minutes_limit', 
            'messages_limit',
            'interactive_minutes_limit',
            'max_concurrent_sessions'
        ]
        
        update_fields = []
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                setattr(self, field, value)
                update_fields.append(field)
        
        if update_fields:
            self.save(update_fields=update_fields)
    
    def get_usage_summary(self):
        """Return complete usage summary for API responses"""
        return {
            'messages': {
                'used': self.messages_sent,
                'limit': self.messages_limit,
                'remaining': self.messages_remaining,
                'percentage': round(self.messages_percentage, 2),
            },
            'interactive_minutes': {
                'used': self.interactive_minutes_used,
                'limit': self.interactive_minutes_limit,
                'remaining': self.interactive_minutes_remaining,
                'percentage': round(self.interactive_minutes_percentage, 2),
            },
            'period': {
                'start': self.period_start.isoformat(),
                'end': self.period_end.isoformat(),
                'days_remaining': max(0, (self.period_end - timezone.now()).days),
            }
        }
