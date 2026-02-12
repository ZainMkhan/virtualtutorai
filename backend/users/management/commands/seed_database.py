"""
Seeder command to populate database with initial data:
- Admin user
- Regular user
- Subscription tiers (free, basic, pro, enterprise)

Usage: python manage.py seed_database
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from users.models import User
from subscriptions.models import SubscriptionTier, Subscription, UsageLimit


class Command(BaseCommand):
    help = 'Seed database with initial admin user, regular user, and subscription tiers'

    def handle(self, *args, **options):
        self.stdout.write('Starting database seeding...')
        
        # Create subscription tiers
        self.stdout.write('Creating subscription tiers...')
        self._create_tiers()
        
        # Create admin user
        self.stdout.write('Creating admin user...')
        self._create_admin_user()
        
        # Create regular user
        self.stdout.write('Creating regular user...')
        self._create_regular_user()
        
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
    
    def _create_tiers(self):
        """Create subscription tiers"""
        tiers_data = [
            {
                'tier': 'free',
                'name': 'free',
                'display_name': 'Free',
                'description': 'Perfect for getting started',
                'price': 0,
                'billing_interval': 'month',
                'conversations_per_month': 3,
                'video_minutes_per_month': 0,
                'messages_per_month': 50,
                'interactive_minutes_per_month': 10,
                'max_concurrent_sessions': 1,
                'is_active': True,
                'is_featured': False,
                'display_order': 1,
                'features': {
                    'basic_support': True,
                    'priority_support': False,
                }
            },
            {
                'tier': 'basic',
                'name': 'basic',
                'display_name': 'Basic',
                'description': 'Great for casual learners',
                'price': 9.99,
                'billing_interval': 'month',
                'conversations_per_month': 15,
                'video_minutes_per_month': 0,
                'messages_per_month': 300,
                'interactive_minutes_per_month': 60,
                'max_concurrent_sessions': 2,
                'is_active': True,
                'is_featured': False,
                'display_order': 2,
                'features': {
                    'basic_support': True,
                    'priority_support': False,
                }
            },
            {
                'tier': 'pro',
                'name': 'pro',
                'display_name': 'Pro',
                'description': 'For serious learners',
                'price': 29.99,
                'billing_interval': 'month',
                'conversations_per_month': 50,
                'video_minutes_per_month': 0,
                'messages_per_month': 1000,
                'interactive_minutes_per_month': 200,
                'max_concurrent_sessions': 5,
                'is_active': True,
                'is_featured': True,
                'display_order': 3,
                'features': {
                    'basic_support': True,
                    'priority_support': True,
                }
            },
            {
                'tier': 'enterprise',
                'name': 'enterprise',
                'display_name': 'Enterprise',
                'description': 'Unlimited access with dedicated support',
                'price': 99.99,
                'billing_interval': 'month',
                'conversations_per_month': 0,  # unlimited
                'video_minutes_per_month': 0,
                'messages_per_month': 0,  # unlimited
                'interactive_minutes_per_month': 0,  # unlimited
                'max_concurrent_sessions': 20,
                'is_active': True,
                'is_featured': False,
                'display_order': 4,
                'features': {
                    'basic_support': True,
                    'priority_support': True,
                    'custom_avatars': True,
                    'api_access': True,
                }
            },
        ]
        
        for tier_data in tiers_data:
            tier, created = SubscriptionTier.objects.get_or_create(
                name=tier_data['name'],
                defaults=tier_data
            )
            if created:
                self.stdout.write(f"  ✓ Created tier: {tier.display_name}")
            else:
                self.stdout.write(f"  - Tier already exists: {tier.display_name}")
    
    def _create_admin_user(self):
        """Create admin user"""
        admin_email = 'admin@virtualtutror.ai'
        
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(f"  - Admin user already exists: {admin_email}")
            return
        
        admin = User.objects.create_superuser(
            username='admin',
            email=admin_email,
            password='admin123456',
            first_name='Admin',
            last_name='User',
            role=User.Role.ADMIN,
            status=User.Status.ACTIVE,
        )
        
        # Create free tier subscription for admin
        free_tier = SubscriptionTier.objects.get(name='free')
        subscription = Subscription.objects.create(
            user=admin,
            tier=free_tier,
            stripe_customer_id='admin_free_user',
            status='active',
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=30),
        )
        
        # Create usage limit
        UsageLimit.objects.create(
            subscription=subscription,
            conversations_limit=free_tier.conversations_per_month,
            video_minutes_limit=free_tier.video_minutes_per_month,
            messages_limit=free_tier.messages_per_month,
            interactive_minutes_limit=free_tier.interactive_minutes_per_month,
            max_concurrent_sessions=free_tier.max_concurrent_sessions,
            period_start=subscription.current_period_start,
            period_end=subscription.current_period_end,
        )
        
        self.stdout.write(f"  ✓ Created admin user: {admin_email}")
    
    def _create_regular_user(self):
        """Create regular user with free tier"""
        user_email = 'user@example.com'
        
        if User.objects.filter(email=user_email).exists():
            self.stdout.write(f"  - Regular user already exists: {user_email}")
            return
        
        user = User.objects.create_user(
            username='testuser',
            email=user_email,
            password='user123456',
            first_name='Test',
            last_name='User',
            role=User.Role.USER,
            status=User.Status.ACTIVE,
        )
        
        # Create free tier subscription for user
        free_tier = SubscriptionTier.objects.get(name='free')
        subscription = Subscription.objects.create(
            user=user,
            tier=free_tier,
            stripe_customer_id='user_free_user',
            status='active',
            current_period_start=timezone.now(),
            current_period_end=timezone.now() + timedelta(days=30),
        )
        
        # Create usage limit
        UsageLimit.objects.create(
            subscription=subscription,
            conversations_limit=free_tier.conversations_per_month,
            video_minutes_limit=free_tier.video_minutes_per_month,
            messages_limit=free_tier.messages_per_month,
            interactive_minutes_limit=free_tier.interactive_minutes_per_month,
            max_concurrent_sessions=free_tier.max_concurrent_sessions,
            period_start=subscription.current_period_start,
            period_end=subscription.current_period_end,
        )
        
        self.stdout.write(f"  ✓ Created regular user: {user_email}")
