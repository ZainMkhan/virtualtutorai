from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils import timezone


class CustomUserManager(UserManager):
    """
    Custom User Manager to handle superuser creation with proper role assignment
    """
    
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """
        Create and save a superuser with the given username, email, and password.
        Automatically sets role to 'admin' for superusers.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)  # Set admin role for superusers
        extra_fields.setdefault('status', User.Status.ACTIVE)  # Ensure active status
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        if extra_fields.get('role') != User.Role.ADMIN:
            raise ValueError('Superuser must have role="admin".')
            
        return self.create_user(username, email, password, **extra_fields)
    
    def create_user(self, username, email=None, password=None, **extra_fields):
        """
        Create and save a regular user with the given username, email, and password.
        """
        extra_fields.setdefault('role', User.Role.USER)  # Default role for regular users
        extra_fields.setdefault('status', User.Status.ACTIVE)  # Default status
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        return super().create_user(username, email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    
    # Status choices
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    # Role choices
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    class Role(models.TextChoices):
        USER = 'user', 'User'
        ADMIN = 'admin', 'Admin'
    
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        SUSPENDED = 'suspended', 'Suspended'
    
    # Additional fields beyond Django's AbstractUser
    # Note: first_name, last_name, email are inherited from AbstractUser
    dob = models.DateField(
        verbose_name="Date of Birth",
        null=True, 
        blank=True,
        help_text="User's date of birth"
    )
    
    additional_information = models.JSONField(
        default=dict,
        blank=True,
        help_text="Flexible JSONB field for storing additional user data"
    )
    
    preferred_language = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text="User's preferred language code (e.g., 'en', 'es', 'fr')"
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        help_text="User account status"
    )
    
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.USER,
        help_text="User role in the system"
    )
    
    is_deleted = models.BooleanField(
        default=False,
        help_text="Soft delete flag - marks user as deleted without removing from database"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when user was created"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp when user was last updated"
    )
    
    # Use custom manager
    objects = CustomUserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def get_full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def soft_delete(self):
        """Soft delete the user by setting is_deleted=True"""
        self.is_deleted = True
        self.is_active = False
        self.save()
    
    def restore(self):
        """Restore a soft-deleted user"""
        self.is_deleted = False
        self.is_active = True
        self.save()
    
    def is_admin_user(self):
        """Check if user has admin role"""
        return self.role == User.Role.ADMIN
