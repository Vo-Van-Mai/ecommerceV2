from django.urls import path, include
from . import views, admin
from . import webhooks
from rest_framework import routers

r = routers.DefaultRouter()
r.register('categories', views.CategoryViewSet)
r.register('products', views.ProductViewSet, basename='products')
r.register('users', views.UserViewSet, basename='users')
r.register('shops', views.ShopViewSet, basename='shops')
r.register('comments', views.CommentViewSet, basename='comments')
r.register('likes', views.likeViewSet, basename='likes')
r.register('payments', views.PaymentViewSet)
r.register('cart', views.CartViewSet, basename='cart')
r.register('cartitems', views.CartItemViewSet, basename='cartitems')
r.register("orders", views.OrderViewSet, basename='orders')
r.register("orderdetail", views.OrderDetailViewSet, basename='orderdetail')
r.register('compare', views.ProductComparisonViewSet, basename='product-comparison')
r.register('seller-statistics', views.RevenueStatisticsViewSet, basename='seller-revenue-stats')
r.register('admin-statistics', views.RevenueStatisticsViewSet, basename='admin-revenue-stats')

# URL patterns for payment API
urlpatterns = [
    path('', include(r.urls))
]
