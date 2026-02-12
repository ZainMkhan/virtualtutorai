# Generated migration for removing discount-related tables and fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        # First, add the new 'amount' field with a default
        migrations.AddField(
            model_name='payment',
            name='amount_temp',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                default=0,
                help_text='Amount charged',
            ),
        ),
        migrations.AddField(
            model_name='invoice',
            name='amount_temp',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                default=0,
                help_text='Invoice amount due',
            ),
        ),
        # Populate the new fields with data from old fields
        migrations.RunPython(
            lambda apps, schema_editor: (
                [p.update(amount_temp=p.final_amount) for p in apps.get_model('payments', 'Payment').objects.all()],
                [i.update(amount_temp=i.total_amount) for i in apps.get_model('payments', 'Invoice').objects.all()]
            ),
            migrations.RunPython.noop,
        ),
        # Remove discount-related fields from Payment model
        migrations.RemoveField(
            model_name='payment',
            name='original_amount',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='discount_amount',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='final_amount',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='discount',
        ),
        # Remove discount-related fields from Invoice model
        migrations.RemoveField(
            model_name='invoice',
            name='original_amount',
        ),
        migrations.RemoveField(
            model_name='invoice',
            name='discount_amount',
        ),
        migrations.RemoveField(
            model_name='invoice',
            name='total_amount',
        ),
        # Rename temp fields to final names
        migrations.RenameField(
            model_name='payment',
            old_name='amount_temp',
            new_name='amount',
        ),
        migrations.RenameField(
            model_name='invoice',
            old_name='amount_temp',
            new_name='amount',
        ),
        # Delete discount-related models
        migrations.DeleteModel(
            name='DiscountUsage',
        ),
        migrations.DeleteModel(
            name='Discount',
        ),
    ]
