from rest_framework import serializers
from .models import Discount, DiscountUsage, Payment, Invoice


class DiscountSerializer(serializers.ModelSerializer):
    """Serializer for displaying discounts to users"""
    
    class Meta:
        model = Discount
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
        ]
        read_only_fields = fields


class DiscountAdminSerializer(serializers.ModelSerializer):
    """Serializer for admins to manage discounts"""
    
    from subscriptions.models import SubscriptionTier
    applicable_tier_ids = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionTier.objects.all(),
        many=True,
        source='applicable_tiers',
        required=False,
    )
    uses_remaining = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Discount
        fields = [
            'id',
            'code',
            'description',
            'discount_type',
            'discount_value',
            'max_uses',
            'current_uses',
            'uses_remaining',
            'max_uses_per_user',
            'applicable_tier_ids',
            'valid_from',
            'valid_until',
            'is_valid',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'current_uses', 'created_at', 'updated_at']
    
    def get_uses_remaining(self, obj):
        if obj.max_uses is None:
            return None
        return max(0, obj.max_uses - obj.current_uses)
    
    def get_is_valid(self, obj):
        return obj.is_valid


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for displaying payment records"""
    
    discount_code = serializers.CharField(source='discount.code', read_only=True, allow_null=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'stripe_payment_intent_id',
            'original_amount',
            'discount_amount',
            'final_amount',
            'currency',
            'discount_code',
            'status',
            'created_at',
        ]
        read_only_fields = fields


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for displaying invoices"""
    
    discount_code = serializers.CharField(source='payment.discount.code', read_only=True, allow_null=True)
    tier_name = serializers.CharField(source='subscription.tier.display_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'original_amount',
            'discount_amount',
            'total_amount',
            'currency',
            'discount_code',
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
            'original_amount',
            'discount_amount',
            'total_amount',
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
    discount_code = serializers.CharField(required=False, allow_blank=True)
    
    def validate_tier_id(self, value):
        from subscriptions.models import SubscriptionTier
        try:
            tier = SubscriptionTier.objects.get(id=value, is_active=True)
        except SubscriptionTier.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive tier")
        return value
    
    def validate_discount_code(self, value):
        if value:
            try:
                discount = Discount.objects.get(code=value.upper())
                if not discount.is_valid:
                    raise serializers.ValidationError("Discount code is not valid or expired")
            except Discount.DoesNotExist:
                raise serializers.ValidationError("Discount code not found")
        return value.upper() if value else None
