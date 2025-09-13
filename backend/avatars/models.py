from django.db import models
from django.utils import timezone
import uuid
from users.models import User


class Avatar(models.Model):
    """
    Avatar model for storing HeyGen avatar information
    """
    
    QUALITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        help_text="Unique identifier for the avatar"
    )
    
    user_id = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='avatars',
        help_text="The user who owns/created this avatar"
    )
    
    category = models.CharField(
        max_length=100,
        help_text="Avatar category (e.g., 'professional', 'casual', 'animated')"
    )
    
    name = models.CharField(
        max_length=255,
        help_text="Display name for the avatar"
    )
    
    avatar_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="External avatar ID from HeyGen or similar service"
    )
    
    embed_url = models.TextField(
        help_text="Full iframe/share URL for embedding the avatar"
    )
    
    preview_image = models.TextField(
        help_text="Link to HeyGen's preview image"
    )
    
    quality = models.CharField(
        max_length=10,
        choices=QUALITY_CHOICES,
        default='medium',
        help_text="Avatar quality setting"
    )
    
    transparent_background = models.BooleanField(
        default=False,
        help_text="Whether avatar has transparent background"
    )
    
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Extra arbitrary details (tags, description, settings from HeyGen, etc.)"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this avatar can be used right now"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when avatar was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when avatar was last updated"
    )
    
    class Meta:
        db_table = 'avatars'
        verbose_name = 'Avatar'
        verbose_name_plural = 'Avatars'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', 'is_active']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.category}) - {self.user_id.username}"
    
    def get_metadata_value(self, key, default=None):
        """Helper method to get a specific metadata value"""
        return self.metadata.get(key, default)
    
    def set_metadata_value(self, key, value):
        """Helper method to set a specific metadata value"""
        self.metadata[key] = value
        self.save(update_fields=['metadata', 'updated_at'])
    
    def deactivate(self):
        """Deactivate the avatar"""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])
    
    def activate(self):
        """Activate the avatar"""
        self.is_active = True
        self.save(update_fields=['is_active', 'updated_at'])
