# Generated migration for adding tier field to SubscriptionTier

from django.db import migrations, models


def populate_tier_field(apps, schema_editor):
    """Populate tier field based on name field"""
    SubscriptionTier = apps.get_model('subscriptions', 'SubscriptionTier')
    tier_mapping = {
        'free': 'free',
        'basic': 'basic',
        'pro': 'pro',
        'enterprise': 'enterprise',
    }
    
    for tier in SubscriptionTier.objects.all():
        # Map name to tier, defaulting to the name itself
        tier.tier = tier_mapping.get(tier.name.lower(), 'free')
        tier.save()


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0002_subscriptiontier_interactive_minutes_per_month_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscriptiontier',
            name='tier',
            field=models.CharField(
                choices=[('free', 'Free'), ('basic', 'Basic'), ('pro', 'Pro'), ('enterprise', 'Enterprise')],
                default='free',
                help_text='Subscription tier level: free, basic, pro, enterprise',
                max_length=20,
            ),
        ),
        # Populate tier field
        migrations.RunPython(populate_tier_field, migrations.RunPython.noop),
        # Remove old default
        migrations.AlterField(
            model_name='subscriptiontier',
            name='tier',
            field=models.CharField(
                choices=[('free', 'Free'), ('basic', 'Basic'), ('pro', 'Pro'), ('enterprise', 'Enterprise')],
                help_text='Subscription tier level: free, basic, pro, enterprise',
                max_length=20,
            ),
        ),
    ]
