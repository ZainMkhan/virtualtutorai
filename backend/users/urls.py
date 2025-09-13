from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Login API - No token required
    path('login/', views.LoginAPIView.as_view(), name='login'),
    
    # User Creation API - No token required
    path('users/create/', views.UserCreateAPIView.as_view(), name='user_create'),  # POST create new user
    
    # User APIs - JWT token required
    path('users/', views.UserListAPIView.as_view(), name='user_list'),  # GET all users (paginated)
    path('users/<int:pk>/', views.UserDetailAPIView.as_view(), name='user_detail'),  # GET user by ID
    path('users/<int:pk>/update/', views.UserUpdateAPIView.as_view(), name='user_update'),  # PUT update user
    path('users/<int:pk>/delete/', views.UserDeleteAPIView.as_view(), name='user_delete'),  # DELETE manage user
]
