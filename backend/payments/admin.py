from django.contrib import admin
from .models import Discount, DiscountUsage, Payment, Invoice


@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_display', 'current_uses', 'max_uses', 'valid_from', 'valid_until', 'status')
    list_filter = ('status', 'discount_type', 'valid_until', 'created_at')
    search_fields = ('code', 'description')
    readonly_fields = ('id', 'current_uses', 'created_at', 'updated_at')
    filter_horizontal = ('applicable_tiers',)
    
    fieldsets = (
        ('Code & Description', {
            'fields': ('code', 'description', 'id')
        }),
        ('Discount Details (Admins Can Edit)', {
            'fields': ('discount_type', 'discount_value')
        }),
        ('Usage Limits', {
            'fields': ('max_uses', 'current_uses', 'max_uses_per_user')
        }),
        ('Applicable Tiers (Leave empty for all)', {
            'fields': ('applicable_tiers',)
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until', 'status')
        }),
        ('Created By', {
            'fields': ('created_by',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def discount_display(self, obj):
        return f"{obj.discount_value}{'%' if obj.discount_type == 'percentage' else '$'}"
    discount_display.short_description = 'Discount'
    
    def save_model(self, request, obj, form, change):
        if not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'original_amount', 'discount_amount', 'final_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'stripe_payment_intent_id')
    readonly_fields = ('id', 'stripe_payment_intent_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User & Subscription', {
            'fields': ('user', 'subscription')
        }),
        ('Stripe Information', {
            'fields': ('stripe_payment_intent_id', 'id')
        }),
        ('Amount', {
            'fields': ('original_amount', 'discount_amount', 'final_amount', 'currency')
        }),
        ('Discount', {
            'fields': ('discount',)
        }),
        ('Status', {
            'fields': ('status',)
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
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'user_email', 'total_amount', 'status', 'issue_date', 'paid_at')
    list_filter = ('status', 'issue_date', 'paid_at')
    search_fields = ('invoice_number', 'user__email', 'stripe_invoice_id')
    readonly_fields = ('id', 'stripe_invoice_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User & Subscription', {
            'fields': ('user', 'subscription', 'payment')
        }),
        ('Invoice Details', {
            'fields': ('invoice_number', 'stripe_invoice_id', 'id')
        }),
        ('Amount', {
            'fields': ('original_amount', 'discount_amount', 'total_amount', 'currency')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date', 'paid_at')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('PDF', {
            'fields': ('pdf_url',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User'
