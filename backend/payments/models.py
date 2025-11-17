from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
from users.models import User
from subscriptions.models import Subscription, SubscriptionTier


class Discount(models.Model):
    """
    Discount codes/promotions managed by admins.
    Can be percentage-based or fixed amount.
    """
    
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier"
    )
    
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Discount code (e.g., 'SAVE20', 'SUMMER50')"
    )
    
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text="Description of the discount"
    )
    
    # Discount amount
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
        help_text="Type of discount"
    )
    
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Discount value (percentage 0-100 or fixed amount)"
    )
    
    # Limits
    max_uses = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)],
        help_text="Maximum times this code can be used (null = unlimited)"
    )
    
    current_uses = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Current number of times used"
    )
    
    max_uses_per_user = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Maximum times a single user can use this code"
    )
    
    # Applicable tiers (null = all tiers)
    applicable_tiers = models.ManyToManyField(
        SubscriptionTier,
        blank=True,
        related_name='discounts',
        help_text="Tiers this discount applies to (leave empty for all)"
    )
    
    # Date range
    valid_from = models.DateTimeField(
        help_text="When discount becomes active"
    )
    
    valid_until = models.DateTimeField(
        help_text="When discount expires"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text="Discount status"
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_discounts',
        help_text="Admin who created this discount"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'discounts'
        verbose_name = 'Discount'
        verbose_name_plural = 'Discounts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'status']),
            models.Index(fields=['status', 'valid_until']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '$'}"
    
    @property
    def is_valid(self):
        """Check if discount is currently valid"""
        now = timezone.now()
        return (
            self.status == 'active' and
            self.valid_from <= now <= self.valid_until and
            (self.max_uses is None or self.current_uses < self.max_uses)
        )
    
    def can_user_use(self, user):
        """Check if specific user can use this discount"""
        if not self.is_valid:
            return False
        
        # Check per-user limit
        user_usage_count = DiscountUsage.objects.filter(
            discount=self,
            user=user
        ).count()
        
        return user_usage_count < self.max_uses_per_user
    
    def apply_discount(self, original_price):
        """Calculate discounted price"""
        if self.discount_type == 'percentage':
            discount_amount = original_price * (self.discount_value / 100)
        else:  # fixed
            discount_amount = self.discount_value
        
        discounted_price = max(0, original_price - discount_amount)
        return discounted_price, discount_amount


class DiscountUsage(models.Model):
    """
    Track which users have used which discounts.
    """
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    
    discount = models.ForeignKey(
        Discount,
        on_delete=models.CASCADE,
        related_name='usages'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='discount_usages'
    )
    
    used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'discount_usages'
        unique_together = ('discount', 'user')
        verbose_name = 'Discount Usage'
        verbose_name_plural = 'Discount Usages'


class Payment(models.Model):
    """
    Payment attempt record.
    Tracks payment intents and their status.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier"
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="User making payment"
    )
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        help_text="Associated subscription"
    )
    
    # Stripe reference
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="Stripe PaymentIntent ID"
    )
    
    # Amount
    original_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Original amount before discount"
    )
    
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Discount applied"
    )
    
    final_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Final amount charged (original - discount)"
    )
    
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency code"
    )
    
    # Applied discount
    discount = models.ForeignKey(
        Discount,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
        help_text="Discount code used"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Payment status"
    )
    
    # Metadata
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional payment data"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['stripe_payment_intent_id']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - ${self.final_amount:.2f}"


class Invoice(models.Model):
    """
    Invoice record for billing.
    Created after successful payment.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('uncollectible', 'Uncollectible'),
        ('void', 'Void'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text="Unique identifier"
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='invoices',
        help_text="User invoice is for"
    )
    
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        help_text="Associated subscription"
    )
    
    payment = models.OneToOneField(
        Payment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoice',
        help_text="Associated payment"
    )
    
    # Stripe reference
    stripe_invoice_id = models.CharField(
        max_length=255,
        unique=True,
        help_text="Stripe Invoice ID"
    )
    
    # Invoice details
    invoice_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Invoice number for display"
    )
    
    # Amount
    original_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Original amount"
    )
    
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Discount applied"
    )
    
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Total amount due"
    )
    
    currency = models.CharField(
        max_length=3,
        default='USD'
    )
    
    # Dates
    issue_date = models.DateField(
        help_text="When invoice was issued"
    )
    
    due_date = models.DateField(
        help_text="When payment is due"
    )
    
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When payment was received"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        help_text="Invoice status"
    )
    
    # PDF storage
    pdf_url = models.URLField(
        null=True,
        blank=True,
        help_text="URL to invoice PDF"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['stripe_invoice_id']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"
