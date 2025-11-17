from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventLogViewSet, basename='event-log')
router.register(r'daily-metrics', views.DailyMetricsViewSet, basename='daily-metrics')
router.register(r'hourly-metrics', views.HourlyMetricsViewSet, basename='hourly-metrics')
router.register(r'user-statistics', views.UserStatisticsViewSet, basename='user-statistics')

urlpatterns = [
    # Analytics endpoints
    path('users/stats/', views.UserStatsAPIView.as_view(), name='user-stats'),
    path('conversations/stats/', views.ConversationStatsAPIView.as_view(), name='conversation-stats'),
    path('revenue/', views.RevenueStatsAPIView.as_view(), name='revenue-stats'),
    path('system-health/', views.SystemHealthAPIView.as_view(), name='system-health'),
    
    # Include router URLs
    path('', include(router.urls)),
]
