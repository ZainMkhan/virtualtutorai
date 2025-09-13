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
        'documentation': {
            'swagger': '/swagger/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/avatars/', include('avatars.urls')),
    path('', api_root, name='api_root'),
    
    # Simple Swagger UI
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
