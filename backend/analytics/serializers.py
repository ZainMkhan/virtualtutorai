from rest_framework import serializers
from .models import (
    UserStatistic, ConversationAnalytic, RevenueAnalytic,
    SystemHealth, DailyMetric, HourlyMetric, EventLog
)


class UserStatisticSerializer(serializers.ModelSerializer):
    """Serialize user statistics"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserStatistic
        fields = [
            'id', 'user_email', 'total_conversations', 'total_messages',
            'total_video_minutes', 'last_active_at', 'first_conversation_at',
            'average_messages_per_conversation', 'average_conversation_duration_minutes',
            'subscription_tier', 'subscription_status', 'created_at', 'updated_at'
        ]
        read_only_fields = fields


class ConversationAnalyticSerializer(serializers.ModelSerializer):
    """Serialize conversation analytics"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    conversation_title = serializers.CharField(source='conversation.title', read_only=True)
    
    class Meta:
        model = ConversationAnalytic
        fields = [
            'id', 'user_email', 'conversation_title', 'message_count',
            'duration_minutes', 'with_gemini', 'with_heygen',
            'sentiment_average', 'engagement_score', 'started_at',
            'ended_at', 'source', 'created_at'
        ]
        read_only_fields = fields


class RevenueAnalyticSerializer(serializers.ModelSerializer):
    """Serialize revenue analytics"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    tier_name = serializers.CharField(source='subscription.tier.display_name', read_only=True)
    
    class Meta:
        model = RevenueAnalytic
        fields = [
            'id', 'user_email', 'tier_name', 'amount', 'currency',
            'discount_applied', 'discount_code', 'status',
            'billing_period_start', 'billing_period_end', 'paid_at',
            'churn_risk', 'churn_reason', 'created_at'
        ]
        read_only_fields = fields


class SystemHealthSerializer(serializers.ModelSerializer):
    """Serialize system health metrics"""
    
    class Meta:
        model = SystemHealth
        fields = [
            'id', 'avg_response_time_ms', 'error_rate_percent',
            'active_users', 'active_conversations',
            'database_query_count', 'database_slow_queries',
            'total_api_calls', 'gemini_api_calls', 'stripe_api_calls',
            'heygen_api_calls', 'critical_errors', 'warnings', 'recorded_at'
        ]
        read_only_fields = fields


class DailyMetricSerializer(serializers.ModelSerializer):
    """Serialize daily metrics"""
    
    class Meta:
        model = DailyMetric
        fields = [
            'id', 'date', 'total_users', 'new_users', 'active_users',
            'conversations_created', 'total_messages', 'revenue',
            'subscriptions_created', 'subscriptions_canceled',
            'avg_sentiment', 'avg_engagement_score',
            'api_errors', 'avg_response_time'
        ]
        read_only_fields = fields


class HourlyMetricSerializer(serializers.ModelSerializer):
    """Serialize hourly metrics"""
    
    class Meta:
        model = HourlyMetric
        fields = [
            'id', 'timestamp', 'hour', 'active_users', 'api_requests',
            'errors', 'avg_response_time', 'peak_concurrency'
        ]
        read_only_fields = fields


class EventLogSerializer(serializers.ModelSerializer):
    """Serialize event logs"""
    user_email = serializers.CharField(source='user.email', read_only=True, allow_null=True)
    
    class Meta:
        model = EventLog
        fields = [
            'id', 'event_type', 'user_email', 'description',
            'metadata', 'severity', 'timestamp'
        ]
        read_only_fields = fields
