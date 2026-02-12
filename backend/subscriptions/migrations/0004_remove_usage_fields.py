# Generated migration for removing conversations_used, video_minutes_used fields

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0003_subscriptiontier_tier'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usagelimit',
            name='conversations_used',
        ),
        migrations.RemoveField(
            model_name='usagelimit',
            name='video_minutes_used',
        ),
    ]
