import uuid
from django.db import models
from django.utils import timezone
from users.models import User
from conversations.models import Conversation
from subscriptions.models import Subscription


class UserStatistic(models.Model):
    """Track user engagement and activity metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='statistics')
    
    # Activity metrics
    total_conversations = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    total_video_minutes = models.IntegerField(default=0)
    
    # Engagement
    last_active_at = models.DateTimeField(null=True, blank=True)
    first_conversation_at = models.DateTimeField(null=True, blank=True)
    
    # Usage patterns
    average_messages_per_conversation = models.FloatField(default=0.0)
    average_conversation_duration_minutes = models.FloatField(default=0.0)
    
    # Subscription info
    subscription_tier = models.CharField(max_length=50, default='free')
    subscription_status = models.CharField(max_length=20, default='active')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Statistics for {self.user.email}"
    
    class Meta:
        verbose_name_plural = "User Statistics"
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['subscription_tier']),
            models.Index(fields=['last_active_at']),
        ]


class ConversationAnalytic(models.Model):
    """Detailed analytics for each conversation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.OneToOneField(Conversation, on_delete=models.CASCADE, related_name='analytic')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversation_analytics')
    
    # Metrics
    message_count = models.IntegerField(default=0)
    duration_minutes = models.IntegerField(default=0)
    
    # Interaction types
    with_gemini = models.BooleanField(default=False)
    with_heygen = models.BooleanField(default=False)
    
    # Quality metrics
    sentiment_average = models.FloatField(default=0.0, help_text="Average sentiment score (-1 to 1)")
    engagement_score = models.FloatField(default=0.0, help_text="0-100 engagement score")
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # Source tracking
    source = models.CharField(max_length=50, choices=[
        ('web', 'Web'),
        ('mobile', 'Mobile'),
        ('api', 'API'),
        ('plugin', 'Plugin'),
    ], default='web')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics for {self.conversation.id}"
    
    class Meta:
        verbose_name_plural = "Conversation Analytics"
        indexes = [
            models.Index(fields=['user_id', 'created_at']),
            models.Index(fields=['with_gemini']),
            models.Index(fields=['with_heygen']),
            models.Index(fields=['created_at']),
        ]


class RevenueAnalytic(models.Model):
    """Track revenue and payment metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='revenue_analytics')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='revenue_analytics')
    
    # Revenue data
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Discount tracking
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_code = models.CharField(max_length=100, null=True, blank=True)
    
    # Payment details
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ], default='pending')
    
    # Timing
    billing_period_start = models.DateField()
    billing_period_end = models.DateField()
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Churn risk
    churn_risk = models.BooleanField(default=False, help_text="Marked if user likely to churn")
    churn_reason = models.CharField(max_length=255, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Revenue ${self.amount} from {self.user.email}"
    
    class Meta:
        verbose_name_plural = "Revenue Analytics"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', 'billing_period_start']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['churn_risk']),
        ]


class SystemHealth(models.Model):
    """Track system health and performance metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Performance metrics
    avg_response_time_ms = models.FloatField(default=0.0, help_text="Average API response time in milliseconds")
    error_rate_percent = models.FloatField(default=0.0, help_text="Percentage of failed requests")
    
    # Capacity
    active_users = models.IntegerField(default=0)
    active_conversations = models.IntegerField(default=0)
    
    # Database
    database_query_count = models.IntegerField(default=0)
    database_slow_queries = models.IntegerField(default=0)
    
    # API calls
    total_api_calls = models.IntegerField(default=0)
    gemini_api_calls = models.IntegerField(default=0)
    stripe_api_calls = models.IntegerField(default=0)
    heygen_api_calls = models.IntegerField(default=0)
    
    # Errors
    critical_errors = models.IntegerField(default=0)
    warnings = models.IntegerField(default=0)
    
    # Timestamp
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"System Health at {self.recorded_at}"
    
    class Meta:
        verbose_name_plural = "System Health"
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['recorded_at']),
            models.Index(fields=['error_rate_percent']),
        ]


class DailyMetric(models.Model):
    """Aggregate daily metrics for dashboards"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True)
    
    # User metrics
    total_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    
    # Engagement
    conversations_created = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    
    # Revenue
    revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    subscriptions_created = models.IntegerField(default=0)
    subscriptions_canceled = models.IntegerField(default=0)
    
    # Quality
    avg_sentiment = models.FloatField(default=0.0)
    avg_engagement_score = models.FloatField(default=0.0)
    
    # System
    api_errors = models.IntegerField(default=0)
    avg_response_time = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Daily Metrics for {self.date}"
    
    class Meta:
        verbose_name_plural = "Daily Metrics"
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['new_users']),
        ]


class HourlyMetric(models.Model):
    """Hourly metrics for real-time monitoring"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField()
    hour = models.IntegerField(help_text="Hour of day (0-23)")
    
    # Activity
    active_users = models.IntegerField(default=0)
    api_requests = models.IntegerField(default=0)
    errors = models.IntegerField(default=0)
    
    # Performance
    avg_response_time = models.FloatField(default=0.0)
    peak_concurrency = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Hourly metrics at {self.timestamp}"
    
    class Meta:
        verbose_name_plural = "Hourly Metrics"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['timestamp']),
            models.Index(fields=['hour']),
        ]


class EventLog(models.Model):
    """Log important system events"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event details
    event_type = models.CharField(max_length=50, choices=[
        ('user_signup', 'User Signup'),
        ('subscription_created', 'Subscription Created'),
        ('subscription_canceled', 'Subscription Canceled'),
        ('payment_succeeded', 'Payment Succeeded'),
        ('payment_failed', 'Payment Failed'),
        ('conversation_started', 'Conversation Started'),
        ('conversation_completed', 'Conversation Completed'),
        ('api_error', 'API Error'),
        ('system_error', 'System Error'),
        ('rate_limit_hit', 'Rate Limit Hit'),
    ])
    
    # Context
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='event_logs')
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    
    # Severity
    severity = models.CharField(max_length=20, choices=[
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ], default='info')
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.event_type} - {self.description[:50]}"
    
    class Meta:
        verbose_name_plural = "Event Logs"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['severity', 'timestamp']),
            models.Index(fields=['user_id', 'timestamp']),
        ]
