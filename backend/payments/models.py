from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
from users.models import User
from subscriptions.models import Subscription


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
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount charged"
    )
    
    currency = models.CharField(
        max_length=3,
        default='USD',
        help_text="Currency code"
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
        return f"{self.user.email} - ${self.amount:.2f}"


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
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Invoice amount due"
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
