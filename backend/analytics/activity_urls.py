from django.urls import path
from . import activity_views

app_name = 'activity'

urlpatterns = [
    # User activity logs
    path('my-logs/', activity_views.UserActivityLogsAPIView.as_view(), name='user-activity-logs'),
    path('my-logs/<uuid:log_id>/', activity_views.ActivityLogDetailAPIView.as_view(), name='activity-log-detail'),
    path('my-summary/', activity_views.UserActivitySummaryAPIView.as_view(), name='activity-summary'),
    
    # Admin activity logs
    path('admin/logs/', activity_views.AdminActivityLogsAPIView.as_view(), name='admin-activity-logs'),
    path('admin/logs/create/', activity_views.AdminActivityLogCreateAPIView.as_view(), name='admin-activity-log-create'),
]
