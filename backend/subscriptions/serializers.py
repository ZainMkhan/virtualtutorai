from rest_framework import serializers
from .models import SubscriptionTier, Subscription, UsageLimit


class SubscriptionTierSerializer(serializers.ModelSerializer):
    """Serializer for SubscriptionTier model - display available tiers to users"""
    
    features_display = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionTier
        fields = [
            'id',
            'name',
            'display_name',
            'description',
            'price',
            'billing_interval',
            'conversations_per_month',
            'video_minutes_per_month',
            'messages_per_month',
            'interactive_minutes_per_month',
            'max_concurrent_sessions',
            'features',
            'features_display',
            'is_active',
            'is_featured',
        ]
        read_only_fields = fields
    
    def get_features_display(self, obj):
        """Format features for display"""
        if not obj.features:
            return []
        return [f"{k}: {v}" for k, v in obj.features.items()]


class SubscriptionTierAdminSerializer(serializers.ModelSerializer):
    """Serializer for admins to manage tiers (create, update prices, etc.)"""
    
    class Meta:
        model = SubscriptionTier
        fields = [
            'id',
            'name',
            'display_name',
            'description',
            'price',
            'billing_interval',
            'conversations_per_month',
            'video_minutes_per_month',
            'messages_per_month',
            'interactive_minutes_per_month',
            'max_concurrent_sessions',
            'features',
            'is_active',
            'is_featured',
            'display_order',
            'stripe_price_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UsageLimitSerializer(serializers.ModelSerializer):
    """Serializer for displaying user's usage statistics"""
    
    conversations_limit = serializers.SerializerMethodField()
    video_minutes_limit = serializers.SerializerMethodField()
    messages_limit = serializers.SerializerMethodField()
    interactive_minutes_limit = serializers.SerializerMethodField()
    
    conversations_remaining = serializers.SerializerMethodField()
    video_minutes_remaining = serializers.SerializerMethodField()
    messages_remaining = serializers.SerializerMethodField()
    interactive_minutes_remaining = serializers.SerializerMethodField()
    
    conversations_percentage = serializers.SerializerMethodField()
    video_minutes_percentage = serializers.SerializerMethodField()
    messages_percentage = serializers.SerializerMethodField()
    interactive_minutes_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = UsageLimit
        fields = [
            # Conversations
            'conversations_used',
            'conversations_limit',
            'conversations_remaining',
            'conversations_percentage',
            # Video Minutes
            'video_minutes_used',
            'video_minutes_limit',
            'video_minutes_remaining',
            'video_minutes_percentage',
            # Messages
            'messages_sent',
            'messages_limit',
            'messages_remaining',
            'messages_percentage',
            # Interactive Minutes
            'interactive_minutes_used',
            'interactive_minutes_limit',
            'interactive_minutes_remaining',
            'interactive_minutes_percentage',
            # Period
            'period_start',
            'period_end',
        ]
        read_only_fields = fields
    
    # ============ CONVERSATIONS ============
    def get_conversations_limit(self, obj):
        return obj.conversations_limit
    
    def get_conversations_remaining(self, obj):
        return obj.conversations_remaining
    
    def get_conversations_percentage(self, obj):
        return round(obj.conversations_percentage, 1)
    
    # ============ VIDEO MINUTES ============
    def get_video_minutes_limit(self, obj):
        return obj.video_minutes_limit
    
    def get_video_minutes_remaining(self, obj):
        remaining = obj.video_minutes_remaining
        return None if remaining == float('inf') else remaining
    
    def get_video_minutes_percentage(self, obj):
        percentage = obj.video_minutes_percentage
        return None if percentage == 0 and obj.video_minutes_limit == 0 else round(percentage, 1)
    
    # ============ MESSAGES ============
    def get_messages_limit(self, obj):
        return obj.messages_limit
    
    def get_messages_remaining(self, obj):
        remaining = obj.messages_remaining
        return None if remaining == float('inf') else remaining
    
    def get_messages_percentage(self, obj):
        percentage = obj.messages_percentage
        return None if percentage == 0 and obj.messages_limit == 0 else round(percentage, 1)
    
    # ============ INTERACTIVE MINUTES ============
    def get_interactive_minutes_limit(self, obj):
        return obj.interactive_minutes_limit
    
    def get_interactive_minutes_remaining(self, obj):
        remaining = obj.interactive_minutes_remaining
        return None if remaining == float('inf') else remaining
    
    def get_interactive_minutes_percentage(self, obj):
        percentage = obj.interactive_minutes_percentage
        return None if percentage == 0 and obj.interactive_minutes_limit == 0 else round(percentage, 1)


class SubscriptionDetailSerializer(serializers.ModelSerializer):
    """Serializer for displaying user's current subscription"""
    
    tier = SubscriptionTierSerializer(read_only=True)
    usage = serializers.SerializerMethodField()
    days_until_renewal = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscription
        fields = [
            'id',
            'user',
            'tier',
            'status',
            'current_period_start',
            'current_period_end',
            'cancel_at_period_end',
            'usage',
            'days_until_renewal',
            'created_at',
        ]
        read_only_fields = fields
    
    def get_usage(self, obj):
        if hasattr(obj, 'usage_limit'):
            return UsageLimitSerializer(obj.usage_limit).data
        return None
    
    def get_days_until_renewal(self, obj):
        return obj.days_until_renewal


class SubscriptionCreateSerializer(serializers.Serializer):
    """Serializer for creating/upgrading subscriptions"""
    
    tier_id = serializers.UUIDField(required=True, help_text="Target subscription tier ID")
    discount_code = serializers.CharField(required=False, allow_blank=True, help_text="Optional discount code")
    
    def validate_tier_id(self, value):
        from .models import SubscriptionTier
        try:
            tier = SubscriptionTier.objects.get(id=value, is_active=True)
        except SubscriptionTier.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive subscription tier")
        return value
    
    def validate_discount_code(self, value):
        if value:
            from payments.models import Discount
            try:
                discount = Discount.objects.get(code=value.upper())
                if not discount.is_valid:
                    raise serializers.ValidationError("Discount code is not valid or has expired")
            except Discount.DoesNotExist:
                raise serializers.ValidationError("Discount code not found")
        return value.upper() if value else None
