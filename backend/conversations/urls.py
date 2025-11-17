from django.urls import path
from . import views

app_name = 'conversations'

urlpatterns = [
    # Conversation endpoints
    path('', views.ConversationListCreateAPIView.as_view(), name='conversation-list-create'),
    path('<uuid:conversation_id>/', views.ConversationDetailAPIView.as_view(), name='conversation-detail'),
    
    # Message endpoints
    path('<uuid:conversation_id>/messages/', views.MessageCreateAPIView.as_view(), name='message-create'),
]
