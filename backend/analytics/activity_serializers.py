from rest_framework import serializers
from .activity_models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for displaying activity logs"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'user_email',
            'action',
            'action_display',
            'resource_type',
            'resource_type_display',
            'resource_id',
            'ip_address',
            'description',
            'metadata',
            'status',
            'status_display',
            'error_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class ActivityLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user_email',
            'action',
            'action_display',
            'resource_type',
            'resource_id',
            'description',
            'status',
            'created_at',
        ]
        read_only_fields = fields


class ActivityLogCreateSerializer(serializers.Serializer):
    """Serializer for manually creating activity logs (admin only)"""
    
    action = serializers.ChoiceField(choices=ActivityLog.ACTION_CHOICES)
    resource_type = serializers.ChoiceField(choices=ActivityLog.RESOURCE_TYPE_CHOICES)
    resource_id = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False)
    status = serializers.ChoiceField(
        choices=[('success', 'Success'), ('failure', 'Failure'), ('pending', 'Pending')],
        default='success'
    )
    error_message = serializers.CharField(required=False, allow_blank=True)


class UserActivitySummarySerializer(serializers.Serializer):
    """Serializer for user activity summary statistics"""
    
    total_activities = serializers.IntegerField()
    last_activity = serializers.DateTimeField()
    activities_by_action = serializers.DictField()
    activities_by_resource = serializers.DictField()
    login_count = serializers.IntegerField()
    last_login = serializers.DateTimeField()
    failed_activities = serializers.IntegerField()
