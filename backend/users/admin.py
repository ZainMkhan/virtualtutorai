from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User Admin interface
    """
    
    # Fields to display in the admin list view
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status', 'is_deleted', 'created_at')
    
    # Fields to filter by in the admin
    list_filter = ('role', 'status', 'is_deleted', 'is_staff', 'is_active', 'created_at')
    
    # Fields to search by
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Fields to order by (default)
    ordering = ('-created_at',)
    
    # Add custom fields to the user form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('dob', 'additional_information', 'preferred_language', 'status', 'role', 'is_deleted')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Fields that are read-only
    readonly_fields = ('created_at', 'updated_at')
    
    # Custom actions
    actions = ['soft_delete_users', 'restore_users', 'activate_users', 'deactivate_users']
    
    def soft_delete_users(self, request, queryset):
        """Soft delete selected users"""
        count = queryset.update(is_deleted=True, is_active=False)
        self.message_user(request, f'{count} user(s) were soft deleted.')
    soft_delete_users.short_description = "Soft delete selected users"
    
    def restore_users(self, request, queryset):
        """Restore soft-deleted users"""
        count = queryset.update(is_deleted=False, is_active=True)
        self.message_user(request, f'{count} user(s) were restored.')
    restore_users.short_description = "Restore selected users"
    
    def activate_users(self, request, queryset):
        """Activate selected users"""
        count = queryset.update(status='active', is_active=True)
        self.message_user(request, f'{count} user(s) were activated.')
    activate_users.short_description = "Activate selected users"
    
    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        count = queryset.update(status='inactive', is_active=False)
        self.message_user(request, f'{count} user(s) were deactivated.')
    deactivate_users.short_description = "Deactivate selected users"
