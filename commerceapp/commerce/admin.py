from collections import Counter
from datetime import timedelta, datetime
from django.utils import timezone
from django.db.models import Count, Sum
from django.utils.html import mark_safe
from django.contrib import admin
from .models import Product, User, Category, Shop, Order, OrderDetail, Payment, Comment, Like, ChatMessage, Conversation
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
        urls = super().get_urls()
        custom_urls = [
            path('stats/', self.admin_view(self.product_stats), name='stats')
        ]
        return custom_urls + urls

    def product_stats(self, request):

        # Hiển thị thống kê số lượng sản phẩm và doanh thu theo danh mục trong admin.
        # Hỗ trợ lọc theo khoảng thời gian (start_date, end_date).

        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        error = None

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)

        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                if start_date > end_date:
                    error = 'start_date phải nhỏ hơn hoặc bằng end_date'
            except ValueError:
                error = 'Sai định dạng ngày. Dùng YYYY-MM-DD'

        # Thống kê số lượng sản phẩm theo danh mục
        product_stats = Category.objects.annotate(
            product_count=Count('products')
        ).values('name', 'product_count')

        # Thống kê doanh thu theo danh mục
        revenue_stats = Category.objects.annotate(
            total_revenue=Sum(
                'products__order_details__order__total_price',
                filter=Payment.objects.filter(
                    status='1',
                    created_date__date__range=(start_date, end_date)
                ).values('order')
            )
        ).values('name', 'total_revenue')

        # Thống kê số lượng đơn hàng theo danh mục
        order_stats = Category.objects.annotate(
            order_count=Count(
                'products__order_details__order',
                filter=Payment.objects.filter(
                    status='1',
                    created_date__date__range=(start_date, end_date)
                ).values('order'),
                distinct=True
            )
        ).values('name', 'order_count')

        # Chuẩn bị dữ liệu cho biểu đồ
        labels = [s['name'] for s in product_stats]
        product_data = [s['product_count'] for s in product_stats]
        revenue_data = [float(s['total_revenue'] or 0.0) for s in revenue_stats]
        order_data = [s['order_count'] or 0 for s in order_stats]  # Sửa 'order_order' thành 'order_count'

        if not labels:
            labels = ['Không có dữ liệu']
            product_data = [0]
            revenue_data = [0]
            order_data = [0]
            error = error or 'Không có dữ liệu danh mục hoặc sản phẩm'

        return TemplateResponse(request, 'admin/stats.html', {
            'labels': labels,
            'product_data': product_data,
            'revenue_data': revenue_data,
            'order_data': order_data,
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'error': error,
            'site_header': self.site_header,
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
