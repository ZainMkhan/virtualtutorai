from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Avatar
from .serializers import (
    AvatarReadSerializer,
    AvatarCreateSerializer,
    AvatarUpdateSerializer,
    AvatarListSerializer
)


class AvatarPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class AvatarCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Create New Avatar",
        operation_description="Create a new avatar. Only admins can create avatars.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'avatar_id', 'embed_url', 'category'],
            properties={
                'category': openapi.Schema(type=openapi.TYPE_STRING, description='Avatar category'),
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='Avatar display name'),
                'avatar_id': openapi.Schema(type=openapi.TYPE_STRING, description='External avatar ID from HeyGen'),
                'embed_url': openapi.Schema(type=openapi.TYPE_STRING, description='Full iframe/share URL'),
                'preview_image': openapi.Schema(type=openapi.TYPE_STRING, description='Preview image URL'),
                'quality': openapi.Schema(type=openapi.TYPE_STRING, enum=['low', 'medium', 'high'], description='Avatar quality'),
                'transparent_background': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Has transparent background'),
                'metadata': openapi.Schema(type=openapi.TYPE_OBJECT, description='Additional metadata'),
                'is_active': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='Is avatar active'),
            }
        ),
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description="Bearer JWT token", type=openapi.TYPE_STRING, required=True)
        ],
        responses={
            201: openapi.Response(description="Avatar created successfully"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def post(self, request):
        # Only admins can create avatars
        if request.user.role != request.user.Role.ADMIN:
            return Response({
                'success': False,
                'message': 'Admin access required to create avatars'
            }, status=status.HTTP_403_FORBIDDEN)
            
        serializer = AvatarCreateSerializer(data=request.data)
        if serializer.is_valid():
            avatar = serializer.save(user_id=request.user)
            read_serializer = AvatarReadSerializer(avatar)
            return Response({
                'success': True,
                'message': 'Avatar created successfully',
                'data': read_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AvatarListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get All Avatars (Paginated)",
        operation_description="Retrieve all avatars with pagination support. All users can see all avatars (managed by admin).",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description="Bearer JWT token", type=openapi.TYPE_STRING, required=True),
            openapi.Parameter('page', openapi.IN_QUERY, description="Page number", type=openapi.TYPE_INTEGER, default=1),
            openapi.Parameter('page_size', openapi.IN_QUERY, description="Number of avatars per page", type=openapi.TYPE_INTEGER, default=10),
            openapi.Parameter('category', openapi.IN_QUERY, description="Filter by category", type=openapi.TYPE_STRING),
            openapi.Parameter('is_active', openapi.IN_QUERY, description="Filter by active status", type=openapi.TYPE_BOOLEAN),
        ],
        responses={
            200: openapi.Response(description="Avatars retrieved successfully"),
            401: openapi.Response(description="Authentication required")
        }
    )
    def get(self, request):
        # All users can see all avatars (avatars are managed by admin but visible to all)
        avatars = Avatar.objects.all()
        
        # Applyingg filters
        category = request.query_params.get('category')
        is_active = request.query_params.get('is_active')
        
        if category:
            avatars = avatars.filter(category__icontains=category)
        if is_active is not None:
            avatars = avatars.filter(is_active=is_active.lower() == 'true')
        
        avatars = avatars.order_by('-created_at')
        
        paginator = AvatarPagination()
        page = paginator.paginate_queryset(avatars, request)
        
        if page is not None:
            serializer = AvatarListSerializer(page, many=True)
            paginated_response = paginator.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Avatars retrieved successfully',
                'data': paginated_response.data
            })
        
        serializer = AvatarListSerializer(avatars, many=True)
        return Response({
            'success': True,
            'message': 'Avatars retrieved successfully',
            'data': serializer.data
        })


class AvatarDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Get Avatar by ID",
        operation_description="Retrieve a specific avatar by ID. All users can view any avatar details.",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description="Bearer JWT token", type=openapi.TYPE_STRING, required=True)
        ],
        responses={
            200: openapi.Response(description="Avatar retrieved successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="Avatar not found")
        }
    )
    def get(self, request, pk):
        try:
            # All userss can view any avatar detailss
            avatar = get_object_or_404(Avatar, pk=pk)
            
            serializer = AvatarReadSerializer(avatar)
            return Response({
                'success': True,
                'message': 'Avatar retrieved successfully',
                'data': serializer.data
            })
        except:
            return Response({
                'success': False,
                'message': 'Avatar not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AvatarUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Update Avatar",
        operation_description="Update an avatar. Only admins can update avatars.",
        request_body=AvatarUpdateSerializer,
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description="Bearer JWT token", type=openapi.TYPE_STRING, required=True)
        ],
        responses={
            200: openapi.Response(description="Avatar updated successfully"),
            400: openapi.Response(description="Validation failed"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="Avatar not found")
        }
    )
    def put(self, request, pk):
        try:
            # Only admins scan update avatars
            if request.user.role != request.user.Role.ADMIN:
                return Response({
                    'success': False,
                    'message': 'Admin access required to update avatars'
                }, status=status.HTTP_403_FORBIDDEN)
                
            avatar = get_object_or_404(Avatar, pk=pk)
            
            serializer = AvatarUpdateSerializer(avatar, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                read_serializer = AvatarReadSerializer(avatar)
                return Response({
                    'success': True,
                    'message': 'Avatar updated successfully',
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
                'message': 'Avatar not found'
            }, status=status.HTTP_404_NOT_FOUND)


class AvatarDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        operation_summary="Delete Avatar",
        operation_description="Delete an avatar. Only admins can delete avatars.",
        manual_parameters=[
            openapi.Parameter('Authorization', openapi.IN_HEADER, description="Bearer JWT token", type=openapi.TYPE_STRING, required=True)
        ],
        responses={
            200: openapi.Response(description="Avatar deleted successfully"),
            401: openapi.Response(description="Authentication required"),
            403: openapi.Response(description="Permission denied"),
            404: openapi.Response(description="Avatar not found")
        }
    )
    def delete(self, request, pk):
        try:
            # Only admins can delete Avatars
            if request.user.role != request.user.Role.ADMIN:
                return Response({
                    'success': False,
                    'message': 'Admin access required to delete avatars'
                }, status=status.HTTP_403_FORBIDDEN)
                
            avatar = get_object_or_404(Avatar, pk=pk)
            
            avatar.delete()
            return Response({
                'success': True,
                'message': 'Avatar deleted successfully'
            })
            
        except:
            return Response({
                'success': False,
                'message': 'Avatar not found'
            }, status=status.HTTP_404_NOT_FOUND)
