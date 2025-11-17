from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import (
    AdminAllUsersWithSubscriptionsAPIView,
    AdminAllBillingDetailsAPIView,
    AdminInvoicesAPIView,
    AdminSubscriptionSummaryAPIView,
)
from .usage_views import UsageViewSet

app_name = 'subscriptions'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'usage', UsageViewSet, basename='usage')

urlpatterns = [
    path('tiers/', views.SubscriptionTierListAPIView.as_view(), name='tier-list'),
    path('tiers/<uuid:tier_id>/', views.SubscriptionTierDetailAPIView.as_view(), name='tier-detail'),
    path('current/', views.CurrentSubscriptionAPIView.as_view(), name='current-subscription'),
    path('upgrade/', views.SubscriptionUpgradeAPIView.as_view(), name='subscription-upgrade'),
    path('cancel/', views.SubscriptionCancelAPIView.as_view(), name='subscription-cancel'),
    
    # Admin endpoints
    path('admin/users-subscriptions/', AdminAllUsersWithSubscriptionsAPIView.as_view(), name='admin-users-subscriptions'),
    path('admin/billing-details/', AdminAllBillingDetailsAPIView.as_view(), name='admin-billing-details'),
    path('admin/invoices/', AdminInvoicesAPIView.as_view(), name='admin-invoices'),
    path('admin/subscription-summary/', AdminSubscriptionSummaryAPIView.as_view(), name='admin-subscription-summary'),
] + router.urls
