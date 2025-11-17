"""
Management command to resync message usage from actual messages in database.
This syncs the usage_limit.messages_sent to match actual user_input messages.
"""

from django.core.management.base import BaseCommand
from subscriptions.models import Subscription
from conversations.models import Message
from django.db import transaction


class Command(BaseCommand):
    help = 'Resync message usage from actual messages in database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('RESYNCING MESSAGE USAGE'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write('')

        total_updated = 0

        with transaction.atomic():
            for subscription in Subscription.objects.select_related('user'):
                user = subscription.user
                usage_limit = subscription.usage_limit

                # Count actual user_input messages
                actual_user_messages = Message.objects.filter(
                    conversation__user=user,
                    sender_type='user_input'
                ).count()

                old_count = usage_limit.messages_sent

                # Update to match actual count
                if actual_user_messages != old_count:
                    usage_limit.messages_sent = actual_user_messages
                    usage_limit.save(update_fields=['messages_sent'])

                    self.stdout.write(f"\n✓ {user.email}")
                    self.stdout.write(f"  Old: {old_count} → New: {actual_user_messages}")
                    self.stdout.write(f"  Remaining: {usage_limit.messages_remaining}")
                    total_updated += 1
                else:
                    self.stdout.write(f"✓ {user.email} (no change needed)")

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS(f'✅ Updated {total_updated} users'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
