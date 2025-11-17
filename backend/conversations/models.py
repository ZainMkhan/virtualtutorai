from django.db import models
from django.utils import timezone
import uuid
from users.models import User
from avatars.models import Avatar


class Conversation(models.Model):
    """
    Model to store a conversation session between a user and AI avatar(s).
    Supports both Gemini API and HeyGen Realtime Interactive Avatar.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the conversation"
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations',
        help_text="User who initiated this conversation"
    )
    
    avatar = models.ForeignKey(
        Avatar,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations',
        help_text="Avatar used in this conversation (optional, can be text-only)"
    )
    
    title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Conversation title (auto-generated from first message if blank)"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether conversation is active or archived"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when conversation was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when conversation was last updated"
    )
    
    class Meta:
        db_table = 'conversations'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['is_active', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.title or 'Conversation'} - {self.user.username}"
    
    def get_message_count(self):
        """Get total number of messages in this conversation"""
        return self.messages.count()
    
    def get_last_message(self):
        """Get the most recent message in this conversation"""
        return self.messages.last()
    
    def archive(self):
        """Archive the conversation (soft delete)"""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])
    
    def restore(self):
        """Restore an archived conversation"""
        self.is_active = True
        self.save(update_fields=['is_active', 'updated_at'])


class Message(models.Model):
    """
    Model to store individual messages in a conversation.
    Supports messages from user, Gemini API, and HeyGen Realtime Interactive Avatar.
    """
    
    ROLE_CHOICES = [
        ('user', 'User'),           # User input
        ('assistant', 'Assistant'),  # AI response
    ]
    
    SENDER_TYPE_CHOICES = [
        ('user_input', 'User Input'),      # Direct user message
        ('gemini', 'Gemini API'),          # Response from Gemini
        ('heygen', 'HeyGen Avatar'),       # Response from HeyGen
        ('system', 'System'),              # System messages
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier for the message"
    )
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        help_text="Conversation this message belongs to"
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        help_text="Role of who is speaking (user or assistant)"
    )
    
    sender_type = models.CharField(
        max_length=20,
        choices=SENDER_TYPE_CHOICES,
        help_text="Which system/source generated this message"
    )
    
    content = models.TextField(
        help_text="The actual message content"
    )
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Flexible JSON field for storing system-specific data (tokens, video_url, etc.)"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when message was created"
    )
    
    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['sender_type']),
        ]
    
    def __str__(self):
        return f"{self.sender_type}: {self.content[:50]}..."
