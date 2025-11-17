from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    path('create-intent/', views.PaymentIntentCreateAPIView.as_view(), name='create-intent'),
    path('list/', views.PaymentListAPIView.as_view(), name='payment-list'),
    path('invoices/', views.InvoiceListAPIView.as_view(), name='invoice-list'),
    path('webhook/stripe/', views.StripeWebhookAPIView.as_view(), name='stripe-webhook'),
]
