from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.db import transaction
from django.utils import timezone

from .models import Conversation, Message
from .serializers import (
    ConversationDetailSerializer,
    ConversationListSerializer,
    ConversationCreateSerializer,
    MessageSerializer
)
from analytics.activity_utils import (
    log_conversation_created,
    log_message_sent,
    log_user_activity,
)
from subscriptions.models import Subscription, UsageLimit


class ConversationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ConversationListCreateAPIView(APIView):
    """
    List all conversations for the current user or create a new conversation.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="List User Conversations",
        operation_description="Get all conversations for the current user (paginated)",
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
                description="Number of conversations per page",
                type=openapi.TYPE_INTEGER,
                default=10
            ),
        ],
        responses={
            200: openapi.Response(
                description="Conversations retrieved successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "Conversations retrieved successfully",
                        "data": {
                            "count": 5,
                            "next": None,
                            "previous": None,
                            "results": []
                        }
                    }
                }
            ),
            401: openapi.Response(description="Authentication required")
        }
    )
    def get(self, request):
        """Get all conversations for the current user"""
        conversations = Conversation.objects.filter(
            user=request.user,
            is_active=True
        ).order_by('-updated_at')
        
        paginator = ConversationPagination()
        page = paginator.paginate_queryset(conversations, request)
        
        if page is not None:
            serializer = ConversationListSerializer(page, many=True)
            paginated_response = paginator.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Conversations retrieved successfully',
                'data': paginated_response.data
            })
        
        serializer = ConversationListSerializer(conversations, many=True)
        return Response({
            'success': True,
            'message': 'Conversations retrieved successfully',
            'data': serializer.data
        })
    
    @swagger_auto_schema(
        operation_summary="Create New Conversation",
        operation_description="Create a new conversation session",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'avatar_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format='uuid',
                    description='Avatar ID (optional, for text-only conversations leave blank)'
                ),
                'title': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Conversation title (optional, auto-generated if blank)'
                ),
            }
        ),
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
            201: openapi.Response(
                description="Conversation created successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "Conversation created successfully",
                        "data": {
                            "id": "conv-uuid-123",
                            "user": 1,
                            "avatar": None,
                            "title": "",
                            "is_active": True,
                            "message_count": 0,
                            "last_message": None,
                            "created_at": "2025-11-09T10:30:00Z",
                            "updated_at": "2025-11-09T10:30:00Z"
                        }
                    }
                }
            ),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def post(self, request):
        """Create a new conversation"""
        serializer = ConversationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            conversation = serializer.save()
            read_serializer = ConversationListSerializer(conversation)
            
            # Log conversation creation
            try:
                log_conversation_created(
                    request,
                    conversation,
                    description=f'Conversation created'
                )
            except:
                pass
            
            return Response({
                'success': True,
                'message': 'Conversation created successfully',
                'data': read_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ConversationDetailAPIView(APIView):
    """
    Retrieve a conversation with all its messages.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get Conversation with Messages",
        operation_description="Retrieve a specific conversation and all its messages",
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
            200: openapi.Response(description="Conversation retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="Conversation not found")
        }
    )
    def get(self, request, conversation_id):
        """Get conversation with all messages"""
        try:
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                user=request.user,
                is_active=True
            )
            
            serializer = ConversationDetailSerializer(conversation)
            return Response({
                'success': True,
                'message': 'Conversation retrieved successfully',
                'data': serializer.data
            })
        except Conversation.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        operation_summary="Archive Conversation",
        operation_description="Soft delete/archive a conversation",
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
            200: openapi.Response(description="Conversation archived successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="Conversation not found")
        }
    )
    def delete(self, request, conversation_id):
        """Archive a conversation"""
        try:
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                user=request.user
            )
            
            conversation.archive()
            
            return Response({
                'success': True,
                'message': 'Conversation archived successfully',
                'data': {
                    'id': str(conversation.id),
                    'is_active': conversation.is_active
                }
            })
        except Conversation.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)


class MessageCreateAPIView(APIView):
    """
    Create a new message in a conversation.
    Supports messages from user, Gemini, and HeyGen.
    Automatically tracks usage and deducts from message quota.
    """
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Add Message to Conversation",
        operation_description="Create a new message in a conversation (user, Gemini, or HeyGen response). Automatically deducts from message quota for user messages.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['role', 'sender_type', 'content'],
            properties={
                'role': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['user', 'assistant'],
                    description='Who is speaking'
                ),
                'sender_type': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['user_input', 'gemini', 'heygen', 'system'],
                    description='Which system generated the message'
                ),
                'content': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Message content'
                ),
                'metadata': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='Optional metadata (tokens, video_url, etc.)'
                ),
            }
        ),
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
            201: openapi.Response(description="Message created successfully"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Message limit exceeded"),
            404: openapi.Response(description="Conversation not found")
        }
    )
    @transaction.atomic
    def post(self, request, conversation_id):
        """
        Create a new message in the conversation.
        
        For user-sent messages (sender_type='user_input'):
        - Checks if user has message quota remaining
        - Deducts 1 from messages_sent if quota available
        - Returns 403 if limit exceeded
        
        For assistant messages (sender_type='gemini', 'heygen', 'system'):
        - Created without quota deduction (only user messages count)
        
        Response includes updated usage information.
        """
        try:
            # Get the conversation and verify ownership
            conversation = get_object_or_404(
                Conversation,
                id=conversation_id,
                user=request.user,
                is_active=True
            )
            
            sender_type = request.data.get('sender_type', 'user_input')
            
            # ============ CHECK USAGE LIMIT FOR USER MESSAGES ============
            if sender_type == 'user_input':
                usage_check = self._check_and_deduct_message_quota(request.user)
                
                if not usage_check['allowed']:
                    return Response({
                        'success': False,
                        'error': usage_check['reason'],
                        'error_code': 'MESSAGE_LIMIT_EXCEEDED',
                        'usage': usage_check.get('usage', {})
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # ============ CREATE MESSAGE ============
            # Prepare data for serializer
            message_data = request.data.copy()
            message_data['conversation'] = str(conversation.id)
            
            # Create the message
            serializer = MessageSerializer(data=message_data)
            
            if serializer.is_valid():
                message = serializer.save(conversation=conversation)
                
                # Log message sent
                try:
                    log_message_sent(
                        request,
                        message,
                        description=f'Message sent in conversation ({sender_type})'
                    )
                except:
                    pass
                
                # Auto-generate conversation title if it's the first message and no title set
                if conversation.messages.count() == 1 and not conversation.title:
                    title = message.content[:50]
                    conversation.title = title
                    conversation.save(update_fields=['title', 'updated_at'])
                else:
                    # Just update the updated_at timestamp
                    conversation.save(update_fields=['updated_at'])
                
                # Get updated usage for response
                usage = self._get_usage_summary(request.user)
                
                return Response({
                    'success': True,
                    'message': 'Message created successfully',
                    'data': MessageSerializer(message).data,
                    'usage': usage,  # Include updated usage
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Conversation.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Conversation not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e),
                'error_code': 'INTERNAL_ERROR'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # ============ HELPER METHODS ============
    
    def _check_and_deduct_message_quota(self, user):
        """
        Check if user can send a message and deduct from quota.
        
        Returns:
        {
            'allowed': bool,
            'reason': str,
            'usage': dict (if deducted)
        }
        """
        try:
            subscription = user.subscription
            usage_limit = subscription.usage_limit
            
            # Check subscription status
            if subscription.status != 'active':
                return {
                    'allowed': False,
                    'reason': f'Subscription is {subscription.status}'
                }
            
            # Check period not expired
            if timezone.now() > usage_limit.period_end:
                return {
                    'allowed': False,
                    'reason': 'Billing period has ended. Please renew your subscription.'
                }
            
            # Check message limit
            if usage_limit.messages_limit > 0:  # 0 = unlimited
                if usage_limit.messages_sent >= usage_limit.messages_limit:
                    remaining = usage_limit.messages_remaining
                    return {
                        'allowed': False,
                        'reason': (
                            f'You have reached your message limit '
                            f'({usage_limit.messages_sent}/{usage_limit.messages_limit}). '
                            f'Upgrade your plan or wait until next billing period.'
                        ),
                        'usage': self._get_usage_summary(user)
                    }
            
            # ✅ DEDUCT MESSAGE QUOTA
            usage_limit.increment_messages(1)
            
            return {
                'allowed': True,
                'reason': '',
                'usage': self._get_usage_summary(user)
            }
        
        except Subscription.DoesNotExist:
            return {
                'allowed': False,
                'reason': 'No active subscription found'
            }
        except UsageLimit.DoesNotExist:
            return {
                'allowed': False,
                'reason': 'Usage limit not configured'
            }
        except Exception as e:
            return {
                'allowed': False,
                'reason': f'Error checking quota: {str(e)}'
            }
    
    def _get_usage_summary(self, user):
        """Get current usage summary for response"""
        try:
            subscription = user.subscription
            usage_limit = subscription.usage_limit
            return usage_limit.get_usage_summary()
        except:
            return {}
