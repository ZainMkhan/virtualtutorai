from django.urls import path
from . import views

app_name = 'avatars'

urlpatterns = [
    path('create/', views.AvatarCreateAPIView.as_view(), name='avatar-create'),
    path('list/', views.AvatarListAPIView.as_view(), name='avatar-list'),
    path('<uuid:pk>/', views.AvatarDetailAPIView.as_view(), name='avatar-detail'),
    path('<uuid:pk>/update/', views.AvatarUpdateAPIView.as_view(), name='avatar-update'),
    path('<uuid:pk>/delete/', views.AvatarDeleteAPIView.as_view(), name='avatar-delete'),
]
