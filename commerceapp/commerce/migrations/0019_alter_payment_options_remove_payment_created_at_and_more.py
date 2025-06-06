from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commerce', '0018_order_address'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='payment',
            options={'verbose_name': 'Payment', 'verbose_name_plural': 'Payments'},
        ),
        migrations.RemoveField(
            model_name='payment',
            name='created_at',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='payment_details',
        ),
        migrations.RemoveField(
            model_name='payment',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='payment',
            name='method',
            field=models.CharField(choices=[('cod', 'Cash On Delivery'), ('momo', 'MoMo')], max_length=20),
        ),
    ]
