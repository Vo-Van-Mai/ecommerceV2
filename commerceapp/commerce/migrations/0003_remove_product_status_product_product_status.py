# Generated by Django 4.2.21 on 2025-05-15 16:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commerce', '0002_product_created_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='status',
        ),
        migrations.AddField(
            model_name='product',
            name='product_status',
            field=models.BooleanField(default=True),
        ),
    ]
