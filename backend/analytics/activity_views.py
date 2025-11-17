from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q, Count
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from datetime import timedelta

from .activity_models import ActivityLog
from .activity_serializers import (
    ActivityLogSerializer,
    ActivityLogListSerializer,
    ActivityLogCreateSerializer,
    UserActivitySummarySerializer,
)


class IsAdmin(permissions.BasePermission):
    """Check if user is admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class ActivityLogPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserActivityLogsAPIView(APIView):
    """
    Get current user's activity logs.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get My Activity Logs",
        operation_description="Retrieve current user's activity logs with pagination and filtering",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Page number",
                type=openapi.TYPE_INTEGER,
                default=1
            ),
            openapi.Parameter(
                'page_size',
                openapi.IN_QUERY,
                description="Number of logs per page (max 100)",
                type=openapi.TYPE_INTEGER,
                default=20
            ),
            openapi.Parameter(
                'action',
                openapi.IN_QUERY,
                description="Filter by action (e.g., login, payment_succeeded)",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'days',
                openapi.IN_QUERY,
                description="Filter logs from last N days",
                type=openapi.TYPE_INTEGER
            ),
        ],
        responses={
            200: openapi.Response(description="Activity logs retrieved successfully"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def get(self, request):
        """Get user's activity logs"""
        
        # Get filter parameters
        action = request.query_params.get('action')
        days = request.query_params.get('days')
        
        # Start with user's logs
        logs = ActivityLog.objects.filter(user=request.user)
        
        # Apply filters
        if action:
            logs = logs.filter(action=action)
        
        if days:
            try:
                days = int(days)
                since = timezone.now() - timedelta(days=days)
                logs = logs.filter(created_at__gte=since)
            except ValueError:
                pass
        
        # Paginate
        paginator = ActivityLogPagination()
        page = paginator.paginate_queryset(logs, request)
        
        if page is not None:
            serializer = ActivityLogListSerializer(page, many=True)
            paginated_response = paginator.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Activity logs retrieved successfully',
                'data': paginated_response.data
            })
        
        serializer = ActivityLogListSerializer(logs, many=True)
        return Response({
            'success': True,
            'message': 'Activity logs retrieved successfully',
            'data': serializer.data
        })


class ActivityLogDetailAPIView(APIView):
    """
    Get details of a specific activity log.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get Activity Log Detail",
        operation_description="Get detailed information about a specific activity log",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(description="Activity log retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="Activity log not found")
        }
    )
    def get(self, request, log_id):
        """Get specific activity log"""
        try:
            log = ActivityLog.objects.get(id=log_id)
            
            # Users can only see their own logs, unless they're admin
            if log.user != request.user and not request.user.is_staff:
                return Response({
                    'success': False,
                    'message': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = ActivityLogSerializer(log)
            return Response({
                'success': True,
                'message': 'Activity log retrieved successfully',
                'data': serializer.data
            })
        except ActivityLog.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Activity log not found'
            }, status=status.HTTP_404_NOT_FOUND)


class UserActivitySummaryAPIView(APIView):
    """
    Get current user's activity summary statistics.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get Activity Summary",
        operation_description="Get summary statistics of current user's activities",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'days',
                openapi.IN_QUERY,
                description="Filter summary from last N days (default: 30)",
                type=openapi.TYPE_INTEGER,
                default=30
            ),
        ],
        responses={
            200: openapi.Response(description="Activity summary retrieved successfully"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def get(self, request):
        """Get user activity summary"""
        
        days = request.query_params.get('days', 30)
        try:
            days = int(days)
        except ValueError:
            days = 30
        
        since = timezone.now() - timedelta(days=days)
        
        logs = ActivityLog.objects.filter(
            user=request.user,
            created_at__gte=since
        )
        
        # Calculate summary stats
        total_activities = logs.count()
        last_activity = logs.first()
        
        activities_by_action = dict(
            logs.values('action').annotate(count=Count('id')).values_list('action', 'count')
        )
        
        activities_by_resource = dict(
            logs.values('resource_type').annotate(count=Count('id')).values_list('resource_type', 'count')
        )
        
        login_count = logs.filter(action='login').count()
        last_login = logs.filter(action='login').first()
        failed_activities = logs.filter(status='failure').count()
        
        summary_data = {
            'total_activities': total_activities,
            'last_activity': last_activity.created_at if last_activity else None,
            'activities_by_action': activities_by_action,
            'activities_by_resource': activities_by_resource,
            'login_count': login_count,
            'last_login': last_login.created_at if last_login else None,
            'failed_activities': failed_activities,
        }
        
        serializer = UserActivitySummarySerializer(summary_data)
        return Response({
            'success': True,
            'message': 'Activity summary retrieved successfully',
            'data': serializer.data
        })


class AdminActivityLogsAPIView(APIView):
    """
    Get all activity logs (admin only).
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_summary="Get All Activity Logs (Admin)",
        operation_description="Retrieve all activity logs in the system (admin only)",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token (Admin only)",
                type=openapi.TYPE_STRING,
                required=True
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="Page number",
                type=openapi.TYPE_INTEGER,
                default=1
            ),
            openapi.Parameter(
                'user_id',
                openapi.IN_QUERY,
                description="Filter by user ID",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'action',
                openapi.IN_QUERY,
                description="Filter by action",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'status',
                openapi.IN_QUERY,
                description="Filter by status (success, failure, pending)",
                type=openapi.TYPE_STRING
            ),
        ],
        responses={
            200: openapi.Response(description="Activity logs retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Admin access required")
        }
    )
    def get(self, request):
        """Get all activity logs"""
        
        # Get filter parameters
        user_id = request.query_params.get('user_id')
        action = request.query_params.get('action')
        log_status = request.query_params.get('status')
        
        # Start with all logs
        logs = ActivityLog.objects.all()
        
        # Apply filters
        if user_id:
            logs = logs.filter(user_id=user_id)
        
        if action:
            logs = logs.filter(action=action)
        
        if log_status:
            logs = logs.filter(status=log_status)
        
        # Paginate
        paginator = ActivityLogPagination()
        page = paginator.paginate_queryset(logs, request)
        
        if page is not None:
            serializer = ActivityLogListSerializer(page, many=True)
            paginated_response = paginator.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Activity logs retrieved successfully',
                'data': paginated_response.data
            })
        
        serializer = ActivityLogListSerializer(logs, many=True)
        return Response({
            'success': True,
            'message': 'Activity logs retrieved successfully',
            'data': serializer.data
        })


class AdminActivityLogCreateAPIView(APIView):
    """
    Manually create an activity log (admin only).
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @swagger_auto_schema(
        operation_summary="Create Activity Log (Admin)",
        operation_description="Manually create an activity log entry (admin only)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['user_id', 'action', 'resource_type'],
            properties={
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='User ID'),
                'action': openapi.Schema(type=openapi.TYPE_STRING, description='Action type'),
                'resource_type': openapi.Schema(type=openapi.TYPE_STRING, description='Resource type'),
                'resource_id': openapi.Schema(type=openapi.TYPE_STRING, description='Resource ID'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='Description'),
                'metadata': openapi.Schema(type=openapi.TYPE_OBJECT, description='Additional metadata'),
                'status': openapi.Schema(type=openapi.TYPE_STRING, enum=['success', 'failure', 'pending']),
                'error_message': openapi.Schema(type=openapi.TYPE_STRING),
            }
        ),
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token (Admin only)",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            201: openapi.Response(description="Activity log created successfully"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Admin access required")
        }
    )
    def post(self, request):
        """Create activity log"""
        
        serializer = ActivityLogCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                from users.models import User
                
                user_id = request.data.get('user_id')
                user = User.objects.get(id=user_id)
                
                log = ActivityLog.objects.create(
                    user=user,
                    action=serializer.validated_data['action'],
                    resource_type=serializer.validated_data['resource_type'],
                    resource_id=serializer.validated_data.get('resource_id'),
                    description=serializer.validated_data.get('description'),
                    metadata=serializer.validated_data.get('metadata', {}),
                    status=serializer.validated_data.get('status', 'success'),
                    error_message=serializer.validated_data.get('error_message'),
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT'),
                )
                
                return Response({
                    'success': True,
                    'message': 'Activity log created successfully',
                    'data': ActivityLogSerializer(log).data
                }, status=status.HTTP_201_CREATED)
            
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
