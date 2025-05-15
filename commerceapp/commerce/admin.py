from collections import Counter

from django.db.models import Count
from django.utils.html import mark_safe
from django.contrib import admin
from .models import Product, User, Category, Shop, Order, OrderDetail, Payment, Comment, Like, ChatMessage, Conversation, ShopProduct
from django.template.response import TemplateResponse
from django.urls import path
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget

class ProductForm(forms.ModelForm):
    description = forms.CharField(widget=CKEditorUploadingWidget)
    class Meta:
        model = Product
        fields = '__all__'




class MyProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category']
    search_fields = ['name']
    list_filter = ['id']
    list_editable = ['name']
    readonly_fields = ['image_view']
    form = ProductForm

    def image_view(self, product):
        if product:
            return mark_safe(f'<img src="{product.image.url}" width="200"/>')

    class Media:
        css = {
            'all' : ('/static/css/style.css',)
        }

class MyRoleAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']
    list_filter = ['id']
    list_editable = ['name']

    class Media:
        css = {
            'all' : ('/static/css/style.css',)
        }

class MyAdminSite(admin.AdminSite):
    site_header = 'E-Commerce-NM'

    def get_urls(self):
        return [path('product-stats', self.product_stats),] + super().get_urls()
    def product_stats(self, request):
        stats = Category.objects.annotate(c = Count('products')).values('id', 'name', 'c')
        return TemplateResponse(request, 'admin/stats.html', {
            'stats' : stats
        })


admin_site = MyAdminSite(name='eCommerce')

# Register your models here.
admin_site.register(Product, MyProductAdmin)
admin_site.register(User)
admin_site.register(Category)
admin_site.register(Shop)
admin_site.register(Order)
admin_site.register(OrderDetail)
admin_site.register(Payment)
admin_site.register(Comment)
admin_site.register(Like)
admin_site.register(Conversation)
admin_site.register(ChatMessage)
admin_site.register(ShopProduct)
