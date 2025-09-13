from django.contrib import admin
from .models import Avatar


@admin.register(Avatar)
class AvatarAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'user_id', 'quality', 'is_active', 'created_at']
    list_filter = ['category', 'quality', 'is_active', 'transparent_background', 'created_at']
    search_fields = ['name', 'category', 'avatar_id', 'user_id__username']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user_id', 'name', 'category', 'avatar_id')
        }),
        ('Media & URLs', {
            'fields': ('embed_url', 'preview_image')
        }),
        ('Configuration', {
            'fields': ('quality', 'transparent_background', 'is_active')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user_id')
