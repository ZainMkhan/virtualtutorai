from django.contrib import admin
from .models import Payment, Invoice


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'amount', 'status', 'created_at')
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
            'fields': ('amount', 'currency')
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
    list_display = ('invoice_number', 'user_email', 'amount', 'status', 'issue_date', 'paid_at')
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
            'fields': ('amount', 'currency')
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
