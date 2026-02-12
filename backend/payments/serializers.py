from rest_framework import serializers
from .models import Payment, Invoice


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for displaying payment records"""
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'stripe_payment_intent_id',
            'amount',
            'currency',
            'status',
            'created_at',
        ]
        read_only_fields = fields


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for displaying invoices"""
    
    tier_name = serializers.CharField(source='subscription.tier.display_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'amount',
            'currency',
            'tier_name',
            'issue_date',
            'due_date',
            'paid_at',
            'status',
            'pdf_url',
        ]
        read_only_fields = fields


class InvoiceAdminSerializer(serializers.ModelSerializer):
    """Serializer for admin invoice management"""
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'user',
            'subscription',
            'payment',
            'stripe_invoice_id',
            'amount',
            'currency',
            'issue_date',
            'due_date',
            'paid_at',
            'status',
            'pdf_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentIntentCreateSerializer(serializers.Serializer):
    """Serializer for creating payment intents"""
    
    tier_id = serializers.UUIDField(required=True)
    
    def validate_tier_id(self, value):
        from subscriptions.models import SubscriptionTier
        try:
            tier = SubscriptionTier.objects.get(id=value, is_active=True)
        except SubscriptionTier.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive tier")
        return value
