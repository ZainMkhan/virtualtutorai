from django.contrib import admin
from .models import SubscriptionTier, Subscription, UsageLimit


@admin.register(SubscriptionTier)
class SubscriptionTierAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'price', 'billing_interval', 'conversations_per_month', 'is_active', 'is_featured', 'display_order')
    list_filter = ('is_active', 'is_featured', 'billing_interval')
    search_fields = ('name', 'display_name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'display_name', 'description')
        }),
        ('Pricing (Admins Can Edit)', {
            'fields': ('price', 'billing_interval', 'stripe_price_id')
        }),
        ('Usage Limits (Admins Can Edit)', {
            'fields': ('conversations_per_month', 'video_minutes_per_month', 'max_concurrent_sessions')
        }),
        ('Features', {
            'fields': ('features',)
        }),
        ('Display Options', {
            'fields': ('is_active', 'is_featured', 'display_order')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'tier_name', 'status', 'current_period_end', 'cancel_at_period_end', 'created_at')
    list_filter = ('status', 'tier', 'created_at', 'cancel_at_period_end')
    search_fields = ('user__email', 'user__username', 'stripe_customer_id')
    readonly_fields = ('id', 'stripe_customer_id', 'stripe_subscription_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User & Tier', {
            'fields': ('user', 'tier')
        }),
        ('Stripe Information', {
            'fields': ('stripe_customer_id', 'stripe_subscription_id')
        }),
        ('Status', {
            'fields': ('status', 'cancel_at_period_end', 'canceled_at')
        }),
        ('Billing Cycle', {
            'fields': ('current_period_start', 'current_period_end')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
    
    def tier_name(self, obj):
        return obj.tier.display_name
    tier_name.short_description = 'Tier'


@admin.register(UsageLimit)
class UsageLimitAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'messages_sent', 'messages_limit', 'period_end')
    list_filter = ('period_end',)
    search_fields = ('subscription__user__email',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Subscription', {
            'fields': ('subscription',)
        }),
        ('Messages Usage', {
            'fields': ('messages_sent', 'messages_remaining', 'messages_percentage')
        }),
        ('Interactive Minutes Usage', {
            'fields': ('interactive_minutes_used', 'interactive_minutes_remaining', 'interactive_minutes_percentage')
        }),
        ('Period', {
            'fields': ('period_start', 'period_end')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.subscription.user.email
    user_email.short_description = 'User'
    
    def messages_limit(self, obj):
        return obj.subscription.tier.messages_per_month
    messages_limit.short_description = 'Messages Limit'
