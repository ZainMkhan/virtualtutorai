from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from .activity_models import ActivityLog
from .models import (
    UserStatistic, ConversationAnalytic, RevenueAnalytic,
    SystemHealth, DailyMetric, HourlyMetric, EventLog
)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin interface for activity logs"""
    list_display = (
        'user', 'action_badge', 'resource_type', 'status_badge',
        'description_preview', 'ip_address', 'created_at'
    )
    search_fields = ('user__email', 'action', 'description', 'ip_address')
    list_filter = ('action', 'resource_type', 'status', 'created_at')
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'ip_address', 'user_agent'
    )
    date_hierarchy = 'created_at'
    
    def action_badge(self, obj):
        """Display action as colored badge"""
        colors = {
            'login': '#0dcaf0',
            'logout': '#6c757d',
            'payment_succeeded': '#28a745',
            'payment_failed': '#dc3545',
            'subscription_created': '#28a745',
            'subscription_canceled': '#dc3545',
            'conversation_created': '#0dcaf0',
            'message_sent': '#0dcaf0',
            'user_deleted': '#dc3545',
            'user_suspended': '#ffc107',
        }
        color = colors.get(obj.action, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_action_display()
        )
    action_badge.short_description = "Action"
    
    def description_preview(self, obj):
        """Show preview of description"""
        if obj.description:
            return obj.description[:60] + "..." if len(obj.description) > 60 else obj.description
        return "N/A"
    description_preview.short_description = "Description"
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'success': '#28a745',
            'failure': '#dc3545',
            'pending': '#ffc107',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"


@admin.register(UserStatistic)
class UserStatisticAdmin(admin.ModelAdmin):
    """Admin interface for user statistics"""
    list_display = (
        'user', 'total_conversations', 'total_messages', 'total_video_minutes',
        'subscription_tier', 'subscription_status', 'last_active_display'
    )
    search_fields = ('user__email', 'user__username', 'subscription_tier')
    list_filter = ('subscription_status', 'subscription_tier', 'created_at')
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'user'
    )
    date_hierarchy = 'updated_at'

    def last_active_display(self, obj):
        """Display last active time with color"""
        if obj.last_active_at:
            hours_ago = (timezone.now() - obj.last_active_at).total_seconds() / 3600
            if hours_ago < 24:
                color = 'green'
                status = 'Active'
            elif hours_ago < 168:  # 7 days
                color = 'orange'
                status = 'Inactive'
            else:
                color = 'red'
                status = 'Dormant'
            return format_html(
                '<span style="color: {};">● {}</span>',
                color,
                status
            )
        return "Never"
    last_active_display.short_description = "Status"


@admin.register(ConversationAnalytic)
class ConversationAnalyticAdmin(admin.ModelAdmin):
    """Admin interface for conversation analytics"""
    list_display = (
        'user', 'message_count', 'duration_display', 'sentiment_badge',
        'engagement_display', 'with_gemini', 'with_heygen', 'started_at'
    )
    search_fields = ('user__email', 'conversation__id')
    list_filter = ('with_gemini', 'with_heygen', 'source', 'started_at')
    readonly_fields = (
        'id', 'started_at', 'ended_at', 'conversation', 'user'
    )
    date_hierarchy = 'started_at'

    def duration_display(self, obj):
        """Format duration as MM:SS"""
        if obj.duration_minutes:
            minutes = obj.duration_minutes
            seconds = int((obj.duration_minutes % 1) * 60)
            return f"{int(minutes)}m {seconds}s"
        return "0m"
    duration_display.short_description = "Duration"

    def sentiment_badge(self, obj):
        """Display sentiment as colored badge"""
        if obj.sentiment_average >= 0.3:
            color = '#28a745'
            text = 'Positive'
        elif obj.sentiment_average <= -0.3:
            color = '#dc3545'
            text = 'Negative'
        else:
            color = '#ffc107'
            text = 'Neutral'
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            text
        )
    sentiment_badge.short_description = "Sentiment"

    def engagement_display(self, obj):
        """Display engagement score"""
        if obj.engagement_score >= 75:
            color = '#28a745'
        elif obj.engagement_score >= 50:
            color = '#ffc107'
        else:
            color = '#dc3545'
        
        return format_html(
            '<span style="color: {};">{:.0f}/100</span>',
            color,
            obj.engagement_score
        )
    engagement_display.short_description = "Engagement"


@admin.register(RevenueAnalytic)
class RevenueAnalyticAdmin(admin.ModelAdmin):
    """Admin interface for revenue analytics"""
    list_display = (
        'user', 'amount_display', 'discount_display', 'net_revenue_display',
        'status_badge', 'churn_risk_display', 'created_at'
    )
    search_fields = ('user__email', 'discount_code')
    list_filter = ('status', 'churn_risk', 'created_at')
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'subscription', 'user'
    )
    date_hierarchy = 'created_at'

    def amount_display(self, obj):
        """Format amount as currency"""
        return f"${obj.amount:.2f}" if obj.amount else "$0.00"
    amount_display.short_description = "Amount"

    def discount_display(self, obj):
        """Format discount amount"""
        return f"${obj.discount_applied:.2f}" if obj.discount_applied else "$0.00"
    discount_display.short_description = "Discount"

    def net_revenue_display(self, obj):
        """Format net revenue"""
        net = obj.amount - obj.discount_applied
        return f"${net:.2f}"
    net_revenue_display.short_description = "Net Revenue"

    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'pending': '#ffc107',
            'succeeded': '#28a745',
            'failed': '#dc3545',
            'refunded': '#6c757d'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def churn_risk_display(self, obj):
        """Display churn risk"""
        if obj.churn_risk:
            return format_html(
                '<span style="background-color: #dc3545; color: white; padding: 3px 10px; border-radius: 3px;">Risk</span>'
            )
        return format_html(
            '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Safe</span>'
        )
    churn_risk_display.short_description = "Churn Risk"


@admin.register(SystemHealth)
class SystemHealthAdmin(admin.ModelAdmin):
    """Admin interface for system health monitoring"""
    list_display = (
        'recorded_at_display', 'health_status_badge', 'response_time_display',
        'error_rate_display', 'active_users', 'active_conversations'
    )
    list_filter = ('recorded_at',)
    readonly_fields = (
        'id', 'recorded_at'
    )
    date_hierarchy = 'recorded_at'

    def recorded_at_display(self, obj):
        """Display recorded time"""
        return obj.recorded_at.strftime('%Y-%m-%d %H:%M:%S')
    recorded_at_display.short_description = "Recorded At"

    def health_status_badge(self, obj):
        """Display overall health status"""
        errors = obj.error_rate_percent or 0

        if errors > 10:
            color = '#dc3545'
            status = 'Critical'
        elif errors > 5:
            color = '#ffc107'
            status = 'Warning'
        else:
            color = '#28a745'
            status = 'Healthy'

        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            status
        )
    health_status_badge.short_description = "Health Status"

    def response_time_display(self, obj):
        """Format response time"""
        if obj.avg_response_time_ms:
            return f"{obj.avg_response_time_ms:.2f}ms"
        return "N/A"
    response_time_display.short_description = "Avg Response"

    def error_rate_display(self, obj):
        """Format error rate"""
        if obj.error_rate_percent:
            color = '#dc3545' if obj.error_rate_percent > 5 else '#28a745'
            return format_html(
                '<span style="color: {};">{:.2f}%</span>',
                color,
                obj.error_rate_percent
            )
        return "0%"
    error_rate_display.short_description = "Error Rate"


@admin.register(DailyMetric)
class DailyMetricAdmin(admin.ModelAdmin):
    """Admin interface for daily metrics"""
    list_display = (
        'date', 'new_users', 'active_users', 'conversations_created',
        'total_messages', 'subscriptions_created', 'revenue_display',
        'avg_engagement_display'
    )
    search_fields = ('date',)
    list_filter = ('date',)
    readonly_fields = (
        'id', 'date'
    )
    date_hierarchy = 'date'

    def revenue_display(self, obj):
        """Format daily revenue"""
        return f"${obj.revenue:.2f}" if obj.revenue else "$0.00"
    revenue_display.short_description = "Revenue"

    def avg_engagement_display(self, obj):
        """Format average engagement score"""
        if obj.avg_engagement_score >= 75:
            color = '#28a745'
        elif obj.avg_engagement_score >= 50:
            color = '#ffc107'
        else:
            color = '#dc3545'
        
        return format_html(
            '<span style="color: {};">{:.0f}/100</span>',
            color,
            obj.avg_engagement_score
        )
    avg_engagement_display.short_description = "Avg Engagement"


@admin.register(HourlyMetric)
class HourlyMetricAdmin(admin.ModelAdmin):
    """Admin interface for hourly metrics"""
    list_display = (
        'timestamp_display', 'active_users', 'api_requests', 'errors',
        'error_rate_display', 'response_time_display', 'peak_concurrency'
    )
    search_fields = ('timestamp',)
    list_filter = ('timestamp', 'hour')
    readonly_fields = (
        'id', 'timestamp'
    )
    date_hierarchy = 'timestamp'

    def timestamp_display(self, obj):
        """Display timestamp"""
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_display.short_description = "Timestamp"

    def error_rate_display(self, obj):
        """Calculate and display error rate"""
        if obj.api_requests and obj.api_requests > 0:
            error_rate = (obj.errors or 0) / obj.api_requests * 100
            color = '#dc3545' if error_rate > 5 else '#28a745'
            return format_html(
                '<span style="color: {};">{:.2f}%</span>',
                color,
                error_rate
            )
        return "0%"
    error_rate_display.short_description = "Error Rate"

    def response_time_display(self, obj):
        """Format average response time"""
        if obj.avg_response_time:
            return f"{obj.avg_response_time:.2f}ms"
        return "N/A"
    response_time_display.short_description = "Avg Response"


@admin.register(EventLog)
class EventLogAdmin(admin.ModelAdmin):
    """Admin interface for event logs"""
    list_display = (
        'event_type_badge', 'description_preview', 'user_display',
        'severity_badge', 'timestamp'
    )
    search_fields = ('description', 'user__email', 'event_type')
    list_filter = ('event_type', 'severity', 'timestamp')
    readonly_fields = (
        'id', 'timestamp'
    )
    date_hierarchy = 'timestamp'

    def description_preview(self, obj):
        """Show preview of description"""
        if obj.description:
            return obj.description[:80] + "..." if len(obj.description) > 80 else obj.description
        return "No description"
    description_preview.short_description = "Description"

    def event_type_badge(self, obj):
        """Display event type as colored badge"""
        colors = {
            'user_signup': '#0dcaf0',
            'subscription_created': '#28a745',
            'subscription_canceled': '#dc3545',
            'payment_succeeded': '#28a745',
            'payment_failed': '#dc3545',
            'conversation_started': '#0dcaf0',
            'conversation_completed': '#28a745',
            'api_error': '#fd7e14',
            'system_error': '#dc3545',
            'rate_limit_hit': '#ffc107',
        }
        color = colors.get(obj.event_type, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_event_type_display()
        )
    event_type_badge.short_description = "Event Type"

    def user_display(self, obj):
        """Display user if available"""
        if obj.user:
            return f"{obj.user.email}"
        return "System"
    user_display.short_description = "User"

    def severity_badge(self, obj):
        """Display severity as colored badge"""
        colors = {
            'info': '#0dcaf0',
            'warning': '#ffc107',
            'critical': '#dc3545',
        }
        color = colors.get(obj.severity, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_severity_display()
        )
    severity_badge.short_description = "Severity"

