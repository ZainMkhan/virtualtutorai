"""
URL configuration for virtualtutor project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Complete API documentation
schema_view = get_schema_view(
   openapi.Info(
      title="Virtual Tutor AI API",
      default_version='v1',
      description="Complete API documentation with User Management and Avatar Management endpoints",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

def api_root(request):
    """
    API root endpoint showing all available APIs
    """
    return JsonResponse({
        'message': 'Virtual Tutor AI API',
        'version': '1.0.0',
        'user_apis': {
            '1_login': '/api/login/',
            '2_create_user': '/api/users/create/',
            '3_get_user_by_id': '/api/users/{id}/',
            '4_get_all_users': '/api/users/',
            '5_update_user': '/api/users/{id}/update/',
        },
        'avatar_apis': {
            '1_create_avatar': '/api/avatars/create/',
            '2_get_avatars': '/api/avatars/list/',
            '3_get_avatar_by_id': '/api/avatars/{id}/',
            '4_update_avatar': '/api/avatars/{id}/update/',
            '5_delete_avatar': '/api/avatars/{id}/delete/',
        },
        'conversation_apis': {
            '1_list_conversations': '/api/conversations/',
            '2_create_conversation': '/api/conversations/',
            '3_get_conversation': '/api/conversations/{id}/',
            '4_add_message': '/api/conversations/{id}/messages/',
            '5_archive_conversation': '/api/conversations/{id}/',
        },
        'subscription_apis': {
            '1_list_tiers': '/api/subscriptions/tiers/',
            '2_current_subscription': '/api/subscriptions/current/',
            '3_usage_statistics': '/api/subscriptions/usage/',
            '4_upgrade_tier': '/api/subscriptions/upgrade/',
            '5_cancel_subscription': '/api/subscriptions/cancel/',
        },
        'payment_apis': {
            '1_create_payment_intent': '/api/payments/create-intent/',
            '2_list_payments': '/api/payments/list/',
            '3_list_invoices': '/api/invoices/',
            '4_stripe_webhook': '/api/webhooks/stripe/',
        },
        'admin_analytics_apis': {
            '1_user_statistics': '/api/admin/analytics/users/stats/',
            '2_conversation_analytics': '/api/admin/analytics/conversations/stats/',
            '3_revenue_analytics': '/api/admin/analytics/revenue/',
            '4_system_health': '/api/admin/analytics/system-health/',
            '5_event_logs': '/api/admin/analytics/events/',
            '6_daily_metrics': '/api/admin/analytics/daily-metrics/',
            '7_hourly_metrics': '/api/admin/analytics/hourly-metrics/',
            '8_user_statistics_list': '/api/admin/analytics/user-statistics/',
        },
        'documentation': {
            'swagger': '/swagger/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/avatars/', include('avatars.urls')),
    path('api/conversations/', include('conversations.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/admin/analytics/', include('analytics.urls')),
    path('api/activity/', include('analytics.activity_urls')),
    path('', api_root, name='api_root'),
    
    # Simple Swagger UI
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
