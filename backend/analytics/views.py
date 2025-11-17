from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Avg, Count, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.models import User
from conversations.models import Conversation, Message
from subscriptions.models import Subscription
from payments.models import Payment, Invoice

from .models import (
    UserStatistic, ConversationAnalytic, RevenueAnalytic,
    SystemHealth, DailyMetric, HourlyMetric, EventLog
)
from .serializers import (
    UserStatisticSerializer, ConversationAnalyticSerializer,
    RevenueAnalyticSerializer, SystemHealthSerializer,
    DailyMetricSerializer, HourlyMetricSerializer, EventLogSerializer
)


class IsAdmin(permissions.BasePermission):
    """Check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class UserStatsAPIView(APIView):
    """
    GET /api/admin/users/stats/
    Admin-only endpoint for user statistics
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="Get comprehensive user statistics",
        responses={200: openapi.Response('User statistics')}
    )
    def get(self, request):
        """Get comprehensive user statistics"""
        try:
            total_users = User.objects.count()
            active_users = User.objects.filter(
                last_login__gte=timezone.now() - timedelta(days=30)
            ).count()
            
            # Signup trends
            new_users_today = User.objects.filter(
                date_joined__date=timezone.now().date()
            ).count()
            new_users_week = User.objects.filter(
                date_joined__gte=timezone.now() - timedelta(days=7)
            ).count()
            new_users_month = User.objects.filter(
                date_joined__gte=timezone.now() - timedelta(days=30)
            ).count()
            
            # Subscription breakdown
            subscription_stats = Subscription.objects.values('tier__display_name').annotate(
                count=Count('id')
            )
            
            # Activity metrics
            total_conversations = Conversation.objects.count()
            total_messages = Message.objects.count()
            
            return Response({
                'total_users': total_users,
                'active_users': active_users,
                'new_users': {
                    'today': new_users_today,
                    'week': new_users_week,
                    'month': new_users_month,
                },
                'subscription_breakdown': list(subscription_stats),
                'total_conversations': total_conversations,
                'total_messages': total_messages,
                'avg_messages_per_user': (
                    total_messages / total_users if total_users > 0 else 0
                ),
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ConversationStatsAPIView(APIView):
    """
    GET /api/admin/conversations/stats/
    Admin-only endpoint for conversation metrics
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="Get comprehensive conversation analytics",
        responses={200: openapi.Response('Conversation statistics')}
    )
    def get(self, request):
        """Get comprehensive conversation statistics"""
        try:
            # Overall metrics
            total_conversations = Conversation.objects.count()
            active_conversations = Conversation.objects.filter(is_active=True).count()
            archived_conversations = Conversation.objects.filter(is_active=False).count()
            
            # Message analytics
            total_messages = Message.objects.count()
            gemini_messages = Message.objects.filter(sender_type='gemini').count()
            heygen_messages = Message.objects.filter(sender_type='heygen').count()
            user_messages = Message.objects.filter(sender_type='user_input').count()
            
            # Time-based metrics
            conversations_today = Conversation.objects.filter(
                created_at__date=timezone.now().date()
            ).count()
            conversations_week = Conversation.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            # Per-user metrics
            user_conversation_stats = User.objects.annotate(
                conversation_count=Count('conversations'),
                message_count=Count('conversations__messages')
            ).aggregate(
                avg_conversations=Avg('conversation_count'),
                max_conversations=Count('conversation_count')
            )
            
            return Response({
                'total_conversations': total_conversations,
                'active_conversations': active_conversations,
                'archived_conversations': archived_conversations,
                'total_messages': total_messages,
                'message_breakdown': {
                    'gemini': gemini_messages,
                    'heygen': heygen_messages,
                    'user_input': user_messages,
                },
                'time_metrics': {
                    'conversations_today': conversations_today,
                    'conversations_week': conversations_week,
                },
                'user_metrics': user_conversation_stats,
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RevenueStatsAPIView(APIView):
    """
    GET /api/admin/revenue/
    Admin-only endpoint for revenue tracking
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="Get comprehensive revenue analytics",
        responses={200: openapi.Response('Revenue statistics')}
    )
    def get(self, request):
        """Get comprehensive revenue statistics"""
        try:
            # Total revenue
            total_revenue = Payment.objects.filter(
                status='succeeded'
            ).aggregate(total=Sum('final_amount'))['total'] or 0
            
            # Revenue by period
            revenue_today = Payment.objects.filter(
                status='succeeded',
                created_at__date=timezone.now().date()
            ).aggregate(total=Sum('final_amount'))['total'] or 0
            
            revenue_month = Payment.objects.filter(
                status='succeeded',
                created_at__gte=timezone.now() - timedelta(days=30)
            ).aggregate(total=Sum('final_amount'))['total'] or 0
            
            # Subscription metrics
            active_subscriptions = Subscription.objects.filter(
                status='active'
            ).count()
            
            # Revenue breakdown by tier
            revenue_by_tier = Subscription.objects.values(
                'tier__display_name'
            ).annotate(
                count=Count('id'),
                monthly_revenue=Sum('tier__price')
            )
            
            # Discount impact
            total_discounts = Payment.objects.filter(
                status='succeeded'
            ).aggregate(total=Sum('discount_amount'))['total'] or 0
            
            # MRR (Monthly Recurring Revenue)
            mrr = Subscription.objects.filter(
                status='active'
            ).aggregate(mrr=Sum('tier__price'))['mrr'] or 0
            
            return Response({
                'total_revenue': float(total_revenue),
                'revenue_today': float(revenue_today),
                'revenue_month': float(revenue_month),
                'active_subscriptions': active_subscriptions,
                'mrr': float(mrr),
                'total_discounts': float(total_discounts),
                'revenue_by_tier': list(revenue_by_tier),
                'average_transaction': (
                    float(total_revenue / Payment.objects.filter(status='succeeded').count())
                    if Payment.objects.filter(status='succeeded').count() > 0 else 0
                ),
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SystemHealthAPIView(APIView):
    """
    GET /api/admin/system-health/
    Admin-only endpoint for system health monitoring
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_description="Get system health status",
        responses={200: openapi.Response('System health')}
    )
    def get(self, request):
        """Get system health status"""
        try:
            # Get latest system health record
            latest_health = SystemHealth.objects.latest('recorded_at')
            
            # Calculate health score (0-100)
            health_score = 100
            if latest_health.error_rate_percent > 5:
                health_score -= 20
            elif latest_health.error_rate_percent > 2:
                health_score -= 10
            
            if latest_health.avg_response_time_ms > 2000:
                health_score -= 20
            elif latest_health.avg_response_time_ms > 1000:
                health_score -= 10
            
            if latest_health.critical_errors > 0:
                health_score -= 30
            
            return Response({
                'health_score': max(0, health_score),
                'status': 'healthy' if health_score >= 80 else 'warning' if health_score >= 50 else 'critical',
                'timestamp': latest_health.recorded_at,
                'metrics': SystemHealthSerializer(latest_health).data,
            })
        except SystemHealth.DoesNotExist:
            return Response({
                'health_score': 0,
                'status': 'no_data',
                'message': 'No health data recorded yet'
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EventLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/admin/events/
    Retrieve event logs with filtering
    """
    queryset = EventLog.objects.all()
    serializer_class = EventLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = EventLog.objects.all()
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by severity
        severity = self.request.query_params.get('severity')
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by date range
        days = self.request.query_params.get('days', '7')
        try:
            days = int(days)
            queryset = queryset.filter(
                timestamp__gte=timezone.now() - timedelta(days=days)
            )
        except ValueError:
            pass
        
        return queryset.order_by('-timestamp')


class DailyMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/admin/daily-metrics/
    Retrieve daily aggregate metrics
    """
    queryset = DailyMetric.objects.all()
    serializer_class = DailyMetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = DailyMetric.objects.all()
        
        # Filter by date range
        days = self.request.query_params.get('days', '30')
        try:
            days = int(days)
            queryset = queryset.filter(
                date__gte=timezone.now().date() - timedelta(days=days)
            )
        except ValueError:
            pass
        
        return queryset.order_by('-date')


class HourlyMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/admin/hourly-metrics/
    Retrieve hourly metrics for real-time monitoring
    """
    queryset = HourlyMetric.objects.all()
    serializer_class = HourlyMetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = HourlyMetric.objects.all()
        
        # Filter by hours
        hours = self.request.query_params.get('hours', '24')
        try:
            hours = int(hours)
            queryset = queryset.filter(
                timestamp__gte=timezone.now() - timedelta(hours=hours)
            )
        except ValueError:
            pass
        
        return queryset.order_by('-timestamp')


class UserStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/admin/user-statistics/
    Retrieve user statistics
    """
    queryset = UserStatistic.objects.all()
    serializer_class = UserStatisticSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = UserStatistic.objects.all()
        
        # Filter by subscription tier
        tier = self.request.query_params.get('tier')
        if tier:
            queryset = queryset.filter(subscription_tier=tier)
        
        # Filter by active status
        active = self.request.query_params.get('active')
        if active:
            queryset = queryset.filter(
                last_active_at__isnull=False if active == 'true' else True
            )
        
        return queryset.order_by('-last_active_at')
