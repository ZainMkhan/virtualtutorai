from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import User
from .serializers import (
    LoginSerializer,
    UserProfileReadSerializer,
    UserUpdateSerializer,
    UserCreateSerializer,
    UserDeleteSerializer
)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_summary="User Login",
        operation_description="Authenticate user and get JWT tokens",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'password'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Email address'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='Password', format='password'),
            }
        ),
        responses={
            200: openapi.Response(
                description="Login successful",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "Login successful",
                        "data": {
                            "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                            "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                            "access_token_expiry": "2025-09-11T15:30:00Z",
                            "refresh_token_expiry": "2025-09-18T14:30:00Z",
                            "user_id": 1,
                            "email": "john.doe@example.com",
                            "role": "user"
                        }
                    }
                }
            ),
            400: openapi.Response(description="Invalid credentials")
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'access_token': serializer.validated_data['access_token'],
                    'refresh_token': serializer.validated_data['refresh_token'],
                    'access_token_expiry': serializer.validated_data['access_token_expiry'],
                    'refresh_token_expiry': serializer.validated_data['refresh_token_expiry'],
                    'user_id': serializer.validated_data['user_id'],
                    'email': serializer.validated_data['user'].email,
                    'role': serializer.validated_data['role']
                }
            })
        return Response({
            'success': False,
            'message': 'Invalid credentials',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_summary="Create New User",
        operation_description="Register a new user account",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'email', 'password', 'password_confirm'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='Unique username'),
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Email address'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format='password', description='Password (min 8 characters)'),
                'password_confirm': openapi.Schema(type=openapi.TYPE_STRING, format='password', description='Confirm password'),
                'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='First name'),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Last name'),
                'dob': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Date of birth (YYYY-MM-DD)'),
                'preferred_language': openapi.Schema(type=openapi.TYPE_STRING, description='Preferred language code'),
                'additional_information': openapi.Schema(
                    type=openapi.TYPE_OBJECT, 
                    description='Additional user information (JSON object)',
                    example={"bio": "Software Developer"}
                ),
            }
        ),
        responses={
            201: openapi.Response(
                description="User created successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "User created successfully",
                        "data": {
                            "id": 4,
                            "username": "newuser",
                            "email": "newuser@example.com",
                            "first_name": "New",
                            "last_name": "User",
                            "full_name": "New User",
                            "dob": "1990-01-01",
                            "role": "user",
                            "status": "active",
                            "is_admin": False,
                            "date_joined": "2025-09-10T10:00:00Z",
                            "additional_information": {}
                        }
                    }
                }
            ),
            400: openapi.Response(description="Validation failed")
        }
    )
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            read_serializer = UserProfileReadSerializer(user)
            return Response({
                'success': True,
                'message': 'User created successfully',
                'data': read_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get User by ID",
        operation_description="Retrieve a specific user's profile information by ID",
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
            200: openapi.Response(
                description="User retrieved successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "User retrieved successfully",
                        "data": {
                            "id": 1,
                            "username": "johndoe",
                            "email": "john@example.com",
                            "first_name": "John",
                            "last_name": "Doe",
                            "full_name": "John Doe",
                            "dob": "1990-01-15",
                            "role": "user",
                            "status": "active",
                            "is_admin": False,
                            "date_joined": "2025-09-09T10:00:00Z",
                            "additional_information": {}
                        }
                    }
                }
            ),
            401: openapi.Response(description="Authentication required"),
            404: openapi.Response(description="User not found")
        }
    )
    def get(self, request, pk):
        try:
            user = get_object_or_404(User, pk=pk, is_active=True)
            serializer = UserProfileReadSerializer(user)
            return Response({
                'success': True,
                'message': 'User retrieved successfully',
                'data': serializer.data
            })
        except:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class UserListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get All Users (Paginated)",
        operation_description="Retrieve all active users with pagination support",
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
                description="Number of users per page (max 100)",
                type=openapi.TYPE_INTEGER,
                default=10
            )
        ],
        responses={
            200: openapi.Response(
                description="Users retrieved successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "Users retrieved successfully",
                        "data": {
                            "count": 25,
                            "next": "http://127.0.0.1:8000/api/users/?page=2",
                            "previous": None,
                            "results": [
                                {
                                    "id": 1,
                                    "username": "johndoe",
                                    "email": "john@example.com",
                                    "first_name": "John",
                                    "last_name": "Doe",
                                    "full_name": "John Doe",
                                    "dob": "1990-01-15",
                                    "role": "user",
                                    "status": "active",
                                    "is_admin": False,
                                    "date_joined": "2025-09-09T10:00:00Z",
                                    "additional_information": {}
                                }
                            ]
                        }
                    }
                }
            ),
            401: openapi.Response(description="Authentication required")
        }
    )
    def get(self, request):
        users = User.objects.filter(is_active=True).order_by('-date_joined')
        paginator = UserPagination()
        page = paginator.paginate_queryset(users, request)
        
        if page is not None:
            serializer = UserProfileReadSerializer(page, many=True)
            paginated_response = paginator.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Users retrieved successfully',
                'data': paginated_response.data
            })
        
        serializer = UserProfileReadSerializer(users, many=True)
        return Response({
            'success': True,
            'message': 'Users retrieved successfully',
            'data': serializer.data
        })


class UserUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Update User Profile",
        operation_description="Update user profile information. Users can only update their own profile unless they are admin.",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'first_name': openapi.Schema(type=openapi.TYPE_STRING, description='First name'),
                'last_name': openapi.Schema(type=openapi.TYPE_STRING, description='Last name'),
                'email': openapi.Schema(type=openapi.TYPE_STRING, format='email', description='Email address'),
                'dob': openapi.Schema(type=openapi.TYPE_STRING, format='date', description='Date of birth (YYYY-MM-DD)'),
                'additional_information': openapi.Schema(
                    type=openapi.TYPE_OBJECT, 
                    description='Additional user information (JSON object)',
                    example={"bio": "Software Developer", "interests": ["programming", "AI"]}
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="User updated successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "User updated successfully",
                        "data": {
                            "id": 1,
                            "username": "johndoe",
                            "email": "john.updated@example.com",
                            "first_name": "John Updated",
                            "last_name": "Doe",
                            "full_name": "John Updated Doe",
                            "dob": "1990-01-15",
                            "role": "user",
                            "status": "active",
                            "is_admin": False,
                            "date_joined": "2025-09-09T10:00:00Z",
                            "additional_information": {
                                "bio": "Software Developer",
                                "interests": ["programming", "AI"]
                            }
                        }
                    }
                }
            ),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="User not found")
        }
    )
    def put(self, request, pk):
        try:
            user = get_object_or_404(User, pk=pk, is_active=True)
            
            if request.user != user and request.user.role != request.user.Role.ADMIN:
                return Response({
                    'success': False,
                    'message': 'You can only update your own profile'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                read_serializer = UserProfileReadSerializer(user)
                return Response({
                    'success': True,
                    'message': 'User updated successfully',
                    'data': read_serializer.data
                })
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class UserDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Delete/Manage User",
        operation_description="Soft delete user, change user status, or restore user. Only admins can perform these actions.",
        manual_parameters=[
            openapi.Parameter(
                'Authorization',
                openapi.IN_HEADER,
                description="Bearer JWT token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['action'],
            properties={
                'action': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['soft_delete', 'change_status', 'restore'],
                    description='Action to perform on the user'
                ),
                'status': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    enum=['active', 'inactive', 'suspended'],
                    description='New status for the user (required when action is change_status)'
                ),
                'reason': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='Optional reason for the action'
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description="Action performed successfully",
                examples={
                    "application/json": {
                        "success": True,
                        "message": "User soft deleted successfully",
                        "data": {
                            "user_id": 1,
                            "action": "soft_delete",
                            "reason": "Account violation",
                            "performed_by": "admin@example.com",
                            "timestamp": "2025-09-12T10:30:00Z"
                        }
                    }
                }
            ),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Admin access required"),
            404: openapi.Response(description="User not found")
        }
    )
    def delete(self, request, pk):
        try:
            # Check if user is admin
            if request.user.role != request.user.Role.ADMIN:
                return Response({
                    'success': False,
                    'message': 'Admin access required to perform this action'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get the user to be deleted/modified
            user_to_modify = get_object_or_404(User, pk=pk)
            
            # Prevent admin from deleting themselves
            if user_to_modify == request.user:
                return Response({
                    'success': False,
                    'message': 'You cannot perform delete actions on your own account'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = UserDeleteSerializer(data=request.data)
            if serializer.is_valid():
                action = serializer.validated_data['action']
                new_status = serializer.validated_data.get('status')
                reason = serializer.validated_data.get('reason', '')
                
                response_data = {
                    'user_id': user_to_modify.id,
                    'action': action,
                    'reason': reason,
                    'performed_by': request.user.email,
                    'timestamp': timezone.now()
                }
                
                if action == 'soft_delete':
                    user_to_modify.soft_delete()
                    message = 'User soft deleted successfully'
                    
                elif action == 'change_status':
                    old_status = user_to_modify.status
                    user_to_modify.status = new_status
                    user_to_modify.save()
                    message = f'User status changed from {old_status} to {new_status}'
                    response_data['old_status'] = old_status
                    response_data['new_status'] = new_status
                    
                elif action == 'restore':
                    if not user_to_modify.is_deleted:
                        return Response({
                            'success': False,
                            'message': 'User is not deleted and cannot be restored'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    user_to_modify.restore()
                    message = 'User restored successfully'
                
                return Response({
                    'success': True,
                    'message': message,
                    'data': response_data
                })
            
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'An error occurred while processing the request'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
