from venv import create

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.db.models import Sum
from django.shortcuts import get_object_or_404
# from tarfile import TruncatedHeaderError

from django.http import HttpResponse
from paypal.standard.ipn.signals import valid_ipn_received
from rest_framework import viewsets, permissions, generics, status, parsers
from rest_framework.decorators import action, api_view
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from .models import Category, Product, Comment, User, Shop,Payment, Like, Cart, CartItem, Favourite, OrderDetail, Order
from .permission import IsSeller, IsOwnerShop, IsBuyer, IsAdmin
from .serializers import (CategorySerializer, ProductSerializer, CommentSerializer, UserSerializer,FavouriteSerializer,
                          ProductDetailSerializer,ShopSerializer, PaymentSerializer, OrderSerializer, OrderDetailSerializer,
                          LikeSerializer, CartSerializer, CartItemSerializer, CategoryDetailSerializer,
                          ProductComparisonSerializer, RevenueStatisticsSerializer,)
from . import serializers, paginator
from . import permission
from decimal import Decimal
from datetime import datetime
import calendar
import time
import hmac
import hashlib
import requests
from django.conf import settings
from django.shortcuts import redirect
from django.http import JsonResponse


def index(request):
    return HttpResponse("E-commerce")

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(active=True)
    def get_serializer_class(self):
        if self.action == 'get_products':
            return CategoryDetailSerializer
        return CategorySerializer


    def get_permissions(self):
        if self.action in ["create", "update", "destroy", "update", "partial_update"]:
            return [permission.IsAdminOrStaff()]
        return [permissions.AllowAny()]

    @action(methods=['get'], url_path='products', detail=True)
    def get_products(self, request, pk=None):
        product = self.get_object().products.filter(active=True)
        p = paginator.ProductPaginator()
        page = p.paginate_queryset(product, request)
        if page:
            s = ProductSerializer(page, many=True)
            return p.get_paginated_response(s.data)
        else:
            return Response(ProductSerializer(product, many=True).data, status.HTTP_200_OK )

class ProductViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = Product.objects.filter(active=True)
    serializer_class = ProductDetailSerializer
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = paginator.ItemPaginator


    def get_permissions(self):
        if self.action in ['get_comments', 'get_rating', 'like'] and self.request.method.__eq__('POST'):
            return [permissions.IsAuthenticated()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permission.IsSeller()]
        return [AllowAny()]

    def permission_denied(self, request, message=None, code=None):
        raise PermissionDenied(detail="Bạn chưa đăng nhập vui lòng đăng nhập để tiếp tục.")


    def get_queryset(self):
        query = self.queryset
        #tim san pham theo ten
        name = self.request.query_params.get('name')
        if name:
            query = query.filter(name__icontains=name)

        #tim san pham theo danh muc
        cate_id = self.request.query_params.get('cate_id')
        if cate_id:
            query = query.filter(category__id = cate_id)

        #Lọc sản phẩm theo giá
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            query = query.filter(price__gte=min_price)
        if max_price:
            query = query.filter(price__lte=max_price)

        #Lọc theo shop
        shop = self.request.query_params.get('shop')
        if shop:
            query = query.filter(shop__id=shop)

        #sắp xếp theo giá
        ordering = self.request.query_params.get('ordering')
        if ordering == 'price':
            query = query.order_by('price')
        elif ordering == '-price':
            query = query.order_by('-price')

        return query

    def perform_create(self, serializer):
        user = self.request.user
        # Kiểm tra user có shop không (là seller, có shop)
        if not hasattr(user, 'shop'):
            raise PermissionDenied("Bạn không có quyền tạo sản phẩm vì không có cửa hàng.")
        # Gán shop là shop của user
        serializer.save(created_by=user, shop=user.shop)


    @action(methods=['get', 'post'], url_path="comment", detail=True)
    def get_comments(self, request, pk):
        if request.method.__eq__('POST'):
            c = CommentSerializer(data={
                "content": request.data.get('content'),
                "product": pk,
                "user": request.user.pk,
                "parent": request.data.get("parent")
            })

            c.is_valid(raise_exception=True)
            comment = c.save()
            return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        else:
            comments = self.get_object().comment_set.select_related('user').filter(active=True).order_by('-id')
            p = paginator.ProductPaginator()
            page = p.paginate_queryset(comments, request)
            c = CommentSerializer(page, many=True)
            return p.get_paginated_response(c.data)


    @action(methods=['post'], detail=True, url_path='like')
    def like(self, request, pk):
        li, created = Favourite.objects.get_or_create(user=request.user, product_id = pk)
        if not created:
            li.active = not li.active
        return Response(ProductDetailSerializer(self.get_object(), context={'request': request}).data, status=status.HTTP_200_OK)




    @action(methods=['get'], detail=True, url_path='rating')
    def get_rating(self, request, pk):
        product = self.get_object()
        star = product.like_set.select_related('user').filter(active=True).order_by('-id')
        p = paginator.ProductPaginator()
        page = p.paginate_queryset(star, self.request)
        if page:
            s = LikeSerializer(page, many=True)
            return p.get_paginated_response(s.data)
        else:
            return Response(LikeSerializer(star, many=True).data, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ViewSet):
    # queryset = User.objects.filter(is_active=True)
    # serializer_class = UserSerializer
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request, *args, **kwargs):
        if not permission.IsAdminOrStaff().has_permission(request, self):
            return Response(
                {"Lỗi": "Bạn không phải là Admin hay Nhân viên hệ thống!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        role = request.query_params.get('role', None)


        try:
            if role == 'seller':
                status_seller = request.query_params.get("is_verified_seller", None)
                if status_seller == "true":
                    users = User.objects.filter(is_active=True, role="seller",is_verified_seller=1)
                elif status_seller == "false":
                    users = User.objects.filter(is_active=True, role="seller",is_verified_seller=0)
                else:
                    users = User.objects.filter(is_active=True, role="seller")
            elif role == 'buyer':
                users = User.objects.filter(is_active=True, role='buyer')
            elif role == 'staff':
                users = User.objects.filter(is_active=True, role='staff')
            else:
                users = User.objects.filter(is_active=True)
        except User.DoesNotExist:
            return Response({"Chi tiết": "Không có người dùng nào!"})

        users = users.order_by('-id')
        p = paginator.UserPaginator()
        page = p.paginate_queryset(users, request)
        if page:
            u = UserSerializer(page, many=True)
            return p.get_paginated_response(u.data)
        else:
            return Response(UserSerializer(users, many=True).data, status=status.HTTP_200_OK)

    def register_user(self, request, role_name, is_staff=False):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.role = role_name
            user.is_staff= is_staff
            user.save()

            #Tao gio hang cho nguoi mua
            if role_name.__eq__('buyer'):
                Cart.objects.create(user=user)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    #Đăng kí người mua
    @action(methods=['post'], detail=False, url_path='register-buyer' )
    def register_buyer(self, request):
        return self.register_user(request, role_name="buyer")


    #Đăng kí người bán
    @action(methods=['post'], detail=False, url_path='register-seller')
    def register_seller(self, request):
        return self.register_user(request, role_name="seller")


    #đăng kí thêm tài khoảng cho nhân viên
    @action(methods=['post'], detail=False, url_path='register-staff', permission_classes=[permission.IsAdmin])
    def register_staff(self, request):
        return self.register_user(request, role_name="staff", is_staff=True )


    #Đăng kí tài khoản là admin của hệ thống
    @action(methods=['post'], detail=False, url_path='register-admin', permission_classes=[permission.IsSuperUser])
    def register_admin(self, request):
        return self.register_user(request, role_name="admin", is_staff=True)


    #Lấy danh sách người dùng là seller đang chờ duyệt
    @action(methods=['get'], url_path='pending-seller', detail=False, permission_classes=[permission.IsAdminOrStaff])
    def get_pending_seller(self, request):
        role = 'seller'
        pending_user = User.objects.filter(is_verified_seller=False, role=role)
        return Response(UserSerializer(pending_user, many=True).data, status=status.HTTP_200_OK)

    # Duyệt / hủy quyền người bán
    @action(methods=['patch'], detail=True, url_path="verify-seller",
            permission_classes=[permission.IsAdminOrStaff])
    def verify_seller(self, request, pk):
        try:
            user = User.objects.get(pk=pk)  # Lấy user từ pk
            user.is_verified_seller = True
            user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        except:
            return Response({'Lỗi': 'Không tìm thấy nguười dùng này!'}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['patch'], detail=True, url_path="cancel-seller",
            permission_classes=[permission.IsAdminOrStaff])
    def cancel_seller(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_verified_seller = False
            user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        except:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


    # Lấy người dùng hiện tại
    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        if request.method.__eq__("PATCH"):
            u = request.user
            for key in request.data:
                if key in ['email','first_name', 'last_name', 'avatar', 'phone', 'gender']:
                    setattr(u, key, request.data[key])
                elif key.__eq__('password'):
                    u.set_password(request.data[key])
            u.save()
            return Response(UserSerializer(u).data, status=status.HTTP_200_OK)
        else:
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ShopViewSet(viewsets.ViewSet):

    def list(self, request):
        shops = Shop.objects.filter(active=True)
        serializer = ShopSerializer(shops, many=True, context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, pk):
        try:
            shop =Shop.objects.get(active=True, pk=pk)
        except Shop.DoesNotExist:
            return Response({"detail": "Shop không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        return Response(ShopSerializer(shop).data, status=status.HTTP_200_OK)

    def create(self, request):

        if request.user.role != "seller":
            raise PermissionDenied("Bạn không phải người bán nên không thể tạo cửa hàng!")
        if Shop.objects.filter(user_id = request.user).exists():
            raise PermissionDenied("Bạn đã có cửa hàng!")
        serializer = ShopSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'detail': "Cửa hàng không tồn tại!"}, status=status.HTTP_404_NOT_FOUND)
        if not IsOwnerShop().has_object_permission(request, self, shop):
            raise PermissionDenied("Bạn không phải là chủ sở hữu của shop này!")
        serializer = ShopSerializer(shop, data=request.data, partial=False)  # PUT: require full data
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'detail': "Cửa hàng không tồn tại!"}, status=status.HTTP_404_NOT_FOUND)
        if not IsOwnerShop().has_object_permission(request, self, shop):
            raise PermissionDenied("Bạn không phải là chủ sở hữu của shop này!")
        serializer = ShopSerializer(shop, data=request.data, partial=True)  # PATCH: partial update
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'Lỗi' : 'Cửa hàng không tồn tại!'}, status=status.HTTP_404_NOT_FOUND)
        if not IsOwnerShop().has_object_permission(request, self, shop):
            raise PermissionDenied("Bạn không phải chủ shop này nên không có quyền xóa!")
        shop.delete()
        return Response({'detail': 'xóa cửa hàng thành công!'}, status=status.HTTP_204_NO_CONTENT)


    @action(methods=['post'], detail=True, url_path='add-product')
    def add_product(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'Lỗi': 'Shop không tồn tại!'}, status=status.HTTP_404_NOT_FOUND)
        if not IsOwnerShop().has_object_permission(request, self, shop):
            raise PermissionDenied("Bạn không phải chủ shop nên không thể tạo thêm sản phẩm!")
        product = ProductSerializer(data=request.data, context={'request': request})
        if product.is_valid():
            product.save(shop=shop, created_by=request.user)
            return Response(product.data, status=status.HTTP_201_CREATED)
        else:
            return Response(product.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], url_path="products")
    def products(self, request, pk=None):
        try:
            shop = Shop.objects.get(pk=pk)
        except Shop.DoesNotExist:
            return Response({'detail': 'Shop không tồn tại!'}, status=status.HTTP_404_NOT_FOUND)
        products = shop.products.all()
        p = paginator.ProductPaginator()
        page = p.paginate_queryset(products, request)
        if page:
            serializer = ProductSerializer(page, many=True)
            return p.get_paginated_response(serializer.data)
        return Response(ProductSerializer(products, many=True).data, status=status.HTTP_200_OK)

    # Lấy shop của ngưi đăng nhập
    @action(detail=False, methods=['get'], url_path='my-shop')
    def my_shop(self, request):
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied({"chi tiết": "Bạn chưa đăng nhập."})
        IsSeller().has_permission(request, self)

        try:
            shop = Shop.objects.get(user=request.user)
            serializer = ShopSerializer(shop, context={'request': request})
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response({"Lỗi": "Bạn chưa có cửa hàng nào!"}, status=status.HTTP_404_NOT_FOUND)


class PaymentViewSet(viewsets.GenericViewSet, generics.RetrieveAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user or user.is_anonymous:
            return Payment.objects.none()
        # If staff, return all payments
        if user.is_staff:
            return Payment.objects.all()

        # Otherwise, return only user's payments
        return Payment.objects.filter(order__user=user)

    def perform_create(self, serializer):
        order = get_object_or_404(Order, user=self.request.user, status=0)
        serializer.save(order=order)

    @action(detail=False, methods=['post'], url_path='momo_payment')
    def momo_payment(self, request):
        # 1. Lấy đơn hàng của user
        order_id = request.data.get("order_id")

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                return Response({"error": "Order không tồn tại."}, status=404)
        else:
            # Nếu không truyền thì lấy theo request.user
            order = Order.objects.filter(user=request.user, status=0).last()
            if not order:
                return Response({"error": "Không có đơn hàng nào để thanh toán."}, status=404)


        # 2. Tạo mã order_id và request_id MoMo
        order_id = str(int(time.time()))
        request_id = str(int(time.time() * 1000))
        amount = str(order.total_price)  # hoặc tính lại dựa vào order detail
        order_info = f"Thanh toán đơn hàng #{order.id}"
        extra_data = ""

        # 3. Tạo Payment trước
        payment = Payment.objects.create(
            order=order,
            order_id=order_id,  # gắn order_id với bên MoMo
            status=0,
        )

        # 4. Ký signature
        raw_signature = f"accessKey={settings.MOMO_ACCESS_KEY}&amount={amount}&extraData={extra_data}&ipnUrl={settings.MOMO_IPN_URL}&orderId={order_id}&orderInfo={order_info}&partnerCode={settings.MOMO_PARTNER_CODE}&redirectUrl={settings.MOMO_REDIRECT_URL}&requestId={request_id}&requestType=captureWallet"
        signature = hmac.new(
            bytes(settings.MOMO_SECRET_KEY, 'utf-8'),
            bytes(raw_signature, 'utf-8'),
            hashlib.sha256
        ).hexdigest()

        # 5. Dữ liệu gửi MoMo
        data = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "accessKey": settings.MOMO_ACCESS_KEY,
            "requestId": request_id,
            "amount": amount,
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": settings.MOMO_REDIRECT_URL,
            "ipnUrl": settings.MOMO_IPN_URL,
            "extraData": extra_data,
            "requestType": "captureWallet",
            "signature": signature,
            "lang": "vi"
        }

        response = requests.post(settings.MOMO_ENDPOINT, json=data)
        res_data = response.json()

        if res_data.get("payUrl"):
            return Response({"payUrl": res_data["payUrl"]})
        else:
            return Response({"error": "Giao dịch thất bại", "detail": res_data}, status=400)

    @action(detail=False, methods=['get'])
    def momo_return(self, request):
        result_code = request.GET.get('resultCode')
        order_id = request.GET.get('orderId')

        try:
            payment = Payment.objects.get(order_id=order_id)
        except Payment.DoesNotExist:
            return HttpResponse("Không tìm thấy thông tin giao dịch")

        if result_code == '0':
            payment.status = 'completed'
            payment.transaction_id = request.GET.get('transId')
            payment.updated_date = datetime.now()
            payment.save()

            # Lấy chi tiết đơn hàng
            order_details = payment.order.orderdetail_set.all()
            detail_data = OrderDetailSerializer(order_details, many=True).data

            return JsonResponse({
                "message": "Thanh toán thành công!",
                "payment_id": payment.id,
                "order_details": detail_data
            }, status=200)
        else:
            return JsonResponse({"message": f"Thanh toán thất bại: {request.GET.get('message')}"}, status=400)

    @action(detail=False, methods=['post'])
    def momo_ipn(self, request):
        data = request.data
        order_id = data.get('orderId')
        result_code = int(data.get('resultCode', -1))

        try:
            payment = Payment.objects.get(order_id=order_id)
        except Payment.DoesNotExist:
            return JsonResponse({'message': 'Không tìm thấy giao dịch'}, status=404)

        if result_code == 0:
            payment.status = 1
            payment.transaction_id = data.get('transId')
            payment.updated_date = datetime.now()
            payment.save()
            return JsonResponse({'message': 'IPN: Thanh toán thành công'}, status=200)
        else:
            payment.status = 2
            payment.save()
            return JsonResponse({'message': 'IPN: Thanh toán thất bại'}, status=400)


class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Comment.objects.filter(active=True)
    serializer_class = CommentSerializer
    permission_classes = [permission.IsCommentOwner]


class likeViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Like.objects.filter(active=True)
    serializer_class = LikeSerializer
    permission_classes = [permission.IsRatingOwner]


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(methods=['post'], detail=False, url_path='add-to-cart')
    def add_to_cart(self, request):
        user = request.user
        cart, _ = Cart.objects.get_or_create(user=user)

        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)

        try:
            quantity = int(quantity)
            if quantity < 1:
                return Response({'Lỗi': 'Số lượng phải >= 1'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'Lỗi': 'Số lượng không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Sản phẩm không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        if product.quantity < quantity:
            return Response({'error': 'Số lượng vượt quá hàng trong kho'}, status=status.HTTP_400_BAD_REQUEST)

        # Tạo hoặc cập nhật CartItem
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if created:
            cart_item.quantity = quantity
        else:
            if cart_item.quantity + quantity > product.quantity:
                return Response({'error': 'Vượt quá số lượng trong kho'}, status=status.HTTP_400_BAD_REQUEST)
            cart_item.quantity += quantity

        cart_item.save()
        return Response({'message': 'Sản phẩm đã được thêm vào giỏ hàng!'})


class CartItemViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.filter(active=True)
    serializer_class = CartItemSerializer
    permission_classes = [permission.IsBuyer]

    def get_queryset(self):
        # Nếu chưa đăng nhập trả về rỗng
        if self.request.user.is_anonymous:
            return CartItem.objects.none()
        # Chỉ lấy cartitem của cart thuộc user hiện tại
        return CartItem.objects.filter(cart__user=self.request.user, active=True)


class OrderViewSet(viewsets.ViewSet):

    # lấy danh sách order
    def list(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Vui lòng đăng nhập"}, status=status.HTTP_401_UNAUTHORIZED)

        orders = Order.objects.select_related('user', 'shop').filter(user=user)
        if not orders.exists():
            return Response({"Chi tiết": "Bạn không có đơn hàng nào!"}, status=status.HTTP_200_OK)

        p = paginator.ItemPaginator()
        page = p.paginate_queryset(orders, request)
        if page:
            o = OrderSerializer(page, many=True)
            return p.get_paginated_response(o.data)
        else:
            return Response(OrderSerializer(orders, many=True).data,status= status.HTTP_200_OK)


    def retrieve(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Vui lòng đăng nhập"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            order = Order.objects.get(pk=kwargs['pk'], user=request.user)
        except Shop.DoesNotExist:
            return Response({"Lỗi": "Không có đơn hàng này!"}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)


    def destroy(self, request, *args, **kwargs):
        try:
            order = Order.objects.get(user=request.user, pk=kwargs['pk'])
        except Order.DoesNotExist:
            return Response({"lỗi": "Không tìm thấy đơn hàng này!"}, status=status.HTTP_404_NOT_FOUND)

        if not permission.IsOwnerOrder().has_object_permission(request, self, order):
            raise PermissionDenied("Bạn không có quyền xóa đơn hàng này")

        if order.status != order.OrderStatus.DELIVERED:
            raise PermissionDenied("Bạn chỉ có thể xóa đơn hàng đã giao!")

        if not permission.IsOwnerShop().has_object_permission(request, self, order.shop):
            raise PermissionDenied("Bạn không phải là chủ cửa hàng của đơn hàng này!")

        order.delete()
        return Response({"thông báo": "Bạn đã xóa đơn hàng thành công!"}, status=status.HTTP_204_NO_CONTENT)


    def create(self, request, *args, **kwargs):
        user = request.user

        # Kiểm tra quyền mua hàng
        if not IsBuyer().has_permission(request, self):
            raise PermissionDenied({"Lỗi": "Vui lòng đăng nhập hoặc đăng kí người mua để đặt hàng!"})

        items = request.data.get("items")
        if not items or not isinstance(items, list):
            return Response({"error": "Bạn phải gửi danh sách sản phẩm"}, status=status.HTTP_400_BAD_REQUEST)

        # Nhóm sản phẩm theo shop_id
        shop_products = {}
        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity", 1)

            try:
                product = Product.objects.get(pk=product_id)
            except Product.DoesNotExist:
                return Response({"error": f"Sản phẩm với id {product_id} không tồn tại."},
                                status=status.HTTP_400_BAD_REQUEST)

            shop_id = product.shop_id
            if shop_id not in shop_products:
                shop_products[shop_id] = []

            shop_products[shop_id].append({
                'product': product,
                'quantity': quantity,
                'price': product.price  # lưu giá tại thời điểm mua
            })

        orders_created = []

        # Tạo đơn hàng cho từng shop
        for shop_id, products in shop_products.items(): #items() trả về từng cặp (shop_id, products) để duyệt từng shop
            total_price = sum([p['price'] * p['quantity'] for p in products])
            shop = Shop.objects.get(pk=shop_id)
            payment_method = request.data.get("payment_method")
            if not payment_method:
                return Response(
                    {"Cảnh báo": "Bạn phải chọn phương thức thanh toán!"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Tạo order
            order = Order.objects.create(user=user, shop=shop, total_price=total_price, payment_method=payment_method)

            # Tạo chi tiết đơn hàng
            for detail in products:
                OrderDetail.objects.create(
                    order=order,
                    product=detail['product'],
                    quantity=detail['quantity'],
                    price=detail['price']
                )

            orders_created.append(order)

        serializer = OrderSerializer(orders_created, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    @action(methods=['patch'], detail=True, url_path="cancel")
    def cancle_order(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"Lỗi": "không tìm thấy đơn hàng!"})
        permission.IsOwnerOrder().has_object_permission(request, self, order)

        #nếu người dùng hợp lệ thì xử lý hủy đơn hàng
        if order.status in[ order.OrderStatus.PENDING, order.OrderStatus.CONFIRMED]:
            order.status = order.OrderStatus.CANCELLED
            order.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
        else:
            return Response({"Chi tiết": "Bạn không thể hủy đơn hàng này!"}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=['patch'], detail=True, url_path="confirm")
    def confirm(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"Chi tiết": "Không tìm thấy đơn hàng!"})
        shop = order.shop
        IsOwnerShop().has_object_permission(request, self, shop)

        if order.status == order.OrderStatus.PENDING:
            order.status = order.OrderStatus.CONFIRMED
            order.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
        return Response({"Chi tiết": "Không thể cập nhật đơn hàng"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['patch'], detail=True, url_path="confirm-shipping")
    def confirm_shipping(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"Chi tiết": "Không tìm thấy đơn hàng!"})
        shop = order.shop
        IsOwnerShop().has_object_permission(request, self, shop)

        if order.status == order.OrderStatus.CONFIRMED:
            order.status = order.OrderStatus.SHIPPED
            order.save()
            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
        return Response({"Chi tiết": "Không thể cập nhật đơn hàng"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path="get-order-shop", detail=False)
    def get_order_shop(self, request):
        # Kiểm tra quyền người bán
        if not IsSeller().has_permission(request, self):
            raise PermissionDenied({"Chi tiết": "Bạn không phải người bán!"})

        # Lấy shop của người bán
        try:
            shop = Shop.objects.get(user=request.user)
        except Shop.DoesNotExist:
            return Response({"detail": "Bạn không có shop!"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra quyền sở hữu shop
        if not IsOwnerShop().has_object_permission(request, self, shop):
            raise PermissionDenied({"detail": "Bạn không có quyền truy cập shop này!"})

        # Lọc đơn hàng theo shop và trạng thái nếu có
        status_params = request.query_params.get("status", None)
        orders = Order.objects.filter(shop=shop)
        if status_params:
            orders = orders.filter(status=status_params)


        if not orders.exists():
            return Response({"detail": "Bạn không có đơn hàng nào!"}, status=status.HTTP_200_OK)

        p = paginator.ItemPaginator()
        page = p.paginate_queryset(orders, request)
        if page:
            o = OrderSerializer(page, many=True)
            return p.get_paginated_response(o.data)
        else:
            return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)


    #lấy danh dách order theo trạng thái đơn hàng
    @action(methods=['get'], detail=False, url_path="get-order-buyer")
    def get_order_buyer(self, request):
        # Kiểm tra quyền người mua
        if not IsBuyer().has_permission(request, self):
            raise PermissionDenied("Bạn không phải là người mua!")

        # Lọc đơn hàng theo người dùng
        orders = Order.objects.filter(user=request.user)

        # Lọc theo trạng thái nếu có
        status_param = request.query_params.get("status")
        if status_param:
            orders = orders.filter(status=status_param)

        if not orders.exists():
            return Response({"detail": "Bạn không có đơn hàng nào!"}, status=status.HTTP_200_OK)

        p = paginator.ItemPaginator()
        page = p.paginate_queryset(orders, request)
        if page:
            o = OrderSerializer(page, many=True)
            return p.get_paginated_response(o.data)
        else:
            return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)


class OrderDetailViewSet(viewsets.ViewSet):

    def retrieve(self, request, *args, **kwargs):
        user = request.user
        if not request.user or not request.user.is_authenticated:
            raise PermissionDenied({"chi tiết": "Bạn chưa đăng nhập."})

        try:
            order = Order.objects.get(pk=kwargs['pk'])
        except Order.DoesNotExist:
            return Response({"Chi tiết": "Không tìm thấy đơn hàng!"}, status=status.HTTP_404_NOT_FOUND)

        if user.role=="buyer":
            permission.IsOwnerOrder().has_object_permission(request, self, order)
        elif user.role=="seller":
            permission.IsShopOrder().has_object_permission(request, self, order)

        details = OrderDetail.objects.select_related('product', 'order__shop', 'order').filter(order=order)
        serializer = OrderDetailSerializer(details, many=True)
        return Response(serializer.data)

    @action(methods=['post'], detail=True, url_path="rating")
    def post_rating(self, request, pk):
        try:
            orderDetail = OrderDetail.objects.get(pk=pk)
        except OrderDetail.DoesNotExist:
            return Response({"Chi tiết": "Không tìm thấy đơn hàng này!"}, status=status.HTTP_404_NOT_FOUND)

        order = Order.objects.get(pk=orderDetail.order_id)
        permission.IsOwnerOrder().has_object_permission(request, self, order)

        product = Product.objects.get(pk=orderDetail.product_id)

        star = request.data.get('star')
        if not star:
            return Response({'Lỗi': 'Thiếu dữ liệu đánh giá (star)'}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem star có hợp lệ không
        try:
            star = int(star)
            if star < 1 or star > 5:
                return Response(
                    {'error': 'Số sao phải từ 1 đến 5.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (TypeError, ValueError):
            return Response(
                {'error': 'Số sao phải là số nguyên.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra đánh giá đã tồn tại chưa
        rating, created = Like.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'star': star}
        )

        if not created:
            # Nếu đã tồn tại thì cập nhật số sao
            rating.star = star
            rating.save()
            return Response(LikeSerializer(rating).data, status=status.HTTP_200_OK)

        return Response(LikeSerializer(rating).data, status=status.HTTP_201_CREATED)




class ProductComparisonViewSet(viewsets.ViewSet):
    """
    ViewSet for comparing products across different stores
    """

    def list(self, request):
        """
        Get all products for comparison
        """
        products = Product.objects.select_related('shop', 'category').order_by('shop__name', 'name')
        serializer = ProductComparisonSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='category/(?P<category_id>[^/.]+)')
    def compare_by_category(self, request, category_id=None):
        """
        Compare products of the same category across different stores
        """
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy loại sản phẩm"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get products from different shops for the same category
        products = Product.objects.filter(
            category_id=category_id
        ).select_related('shop', 'category').order_by('shop__name', 'name')

        if not products.exists():
            return Response({
                "category_name": category.name,
                "category_id": category.id,
                "products": [],
                "total_products": 0,
                "shops_count": 0
            })

        # Count unique shops manually
        unique_shops = set()
        for product in products:
            unique_shops.add(product.shop.id)
        shops_count = len(unique_shops)

        serializer = ProductComparisonSerializer(products, many=True)

        response_data = {
            "category_name": category.name,
            "category_id": category.id,
            "products": serializer.data,
            "total_products": products.count(),
            "shops_count": shops_count
        }

        return Response(response_data)

    @action(detail=False, methods=['get'])
    def compare_by_name(self, request):
        """
        Compare products with similar names across different stores
        """
        product_name = request.query_params.get('name', '')

        if not product_name:
            return Response(
                {"error": "Product name parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Search for products with similar names across different shops
        products = Product.objects.filter(
            name__icontains=product_name
        ).select_related('shop', 'category').order_by('shop__name', 'name')

        if not products.exists():
            return Response({
                "search_term": product_name,
                "products": [],
                "total_products": 0,
                "shops_count": 0
            })

        # Count unique shops manually
        unique_shops = set()
        for product in products:
            unique_shops.add(product.shop.id)
        shops_count = len(unique_shops)

        serializer = ProductComparisonSerializer(products, many=True)

        return Response({
            "search_term": product_name,
            "products": serializer.data,
            "total_products": products.count(),
            "shops_count": shops_count
        })

    @action(detail=False, methods=['get'])
    def categories_with_multiple_shops(self, request):
        """
        Get categories that have products from multiple shops (useful for comparison)
        """
        categories = Category.objects.all()

        category_data = []
        for category in categories:
            # Get products for this category
            products = Product.objects.filter(category=category)

            # Count unique shops manually
            unique_shops = set()
            for product in products:
                unique_shops.add(product.shop.id)

            # Only include categories with products from multiple shops
            if len(unique_shops) > 1:
                category_data.append({
                    'id': category.id,
                    'name': category.name,
                    'description': category.description,
                    'shops_count': len(unique_shops),
                    'products_count': products.count()
                })

        # Sort by shops_count descending
        category_data.sort(key=lambda x: x['shops_count'], reverse=True)

        return Response({
            'categories': category_data,
            'total_categories': len(category_data)
        })


class RevenueStatisticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RevenueStatisticsSerializer

    @action(detail=True, methods=['get'], url_path='revenue-stats/(?P<period_type>month|quarter|year)')
    def get_revenue_statistics(self, request, pk=None, period_type=None):
        # Get query parameters
        period_type = self.kwargs.get('period_type', 'month')  # month, quarter, year
        year = request.query_params.get('year')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Validate shop ownership
        shop = get_object_or_404(Shop, id=pk, user=request.user)

        # Base queryset for completed payments with successful orders
        base_payments = Payment.objects.filter(
            order__order_details__product__shop=shop,
            status=1
        ).distinct()

        # Apply date filters
        if year:
            try:
                year = int(year)
                base_payments = base_payments.filter(created_date__year=year)
            except ValueError:
                return Response(
                    {'error': 'Sai định dạng năm'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if start_date and end_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                base_payments = base_payments.filter(
                    created_date__date__range=[start_date, end_date]
                )
            except ValueError:
                return Response(
                    {'error': 'Sai định dạng ngày. Dùng YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Generate statistics based on period type
        if period_type == 'month':
            statistics = self.get_monthly_stats(base_payments)
        elif period_type == 'quarter':
            statistics = self.get_quarterly_stats(base_payments)
        elif period_type == 'year':
            statistics = self.get_yearly_stats(base_payments)
        else:
            return Response(
                {'error': 'Giai đoạn không hợp lệ! Vui lòng chọn: month, quarter, or year'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate totals manually
        total_revenue = Decimal('0.00')
        total_orders = 0

        # Get all payments for this shop
        for payment in base_payments:
            total_revenue += payment.amount
            total_orders += 1

        # Prepare response data
        response_data = {
            'shop_id': shop.id,
            'shop_name': shop.name,
            'period_type': period_type,
            'statistics': statistics,
            'total_revenue_all_periods': total_revenue,
            'total_orders_all_periods': total_orders
        }

        serializer = RevenueStatisticsSerializer(data=response_data)
        if serializer.is_valid():
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_monthly_stats(self, payments):
        # Get all payments for completed orders
        monthly_stats = {}

        for payment in payments.order_by('created_date'):
            created_date = payment.created_date
            year = created_date.year
            month = created_date.month
            month_key = f"{year}-{month:02d}"

            if month_key not in monthly_stats:
                monthly_stats[month_key] = {
                    'period': month_key,
                    'year': year,
                    'month': month,
                    'month_name': calendar.month_name[month],
                    'total_revenue': Decimal('0.00'),
                    'total_orders': 0,
                    'avg_order_value': Decimal('0.00')
                }

            monthly_stats[month_key]['total_revenue'] += payment.amount
            monthly_stats[month_key]['total_orders'] += 1

        # Calculate average order values
        for stats in monthly_stats.values():
            if stats['total_orders'] > 0:
                stats['avg_order_value'] = stats['total_revenue'] / stats['total_orders']

        return list(monthly_stats.values())

    def get_quarterly_stats(self, payments):
        # Get all payments for completed orders
        quarterly_stats = {}

        for payment in payments.order_by('created_date'):
            created_date = payment.created_date
            year = created_date.year
            quarter = (created_date.month - 1) // 3 + 1
            quarter_key = f"{year}-Q{quarter}"

            if quarter_key not in quarterly_stats:
                quarterly_stats[quarter_key] = {
                    'period': f"Q{quarter} {year}",
                    'year': year,
                    'quarter': quarter,
                    'total_revenue': Decimal('0.00'),
                    'total_orders': 0,
                    'avg_order_value': Decimal('0.00')
                }

            quarterly_stats[quarter_key]['total_revenue'] += payment.amount
            quarterly_stats[quarter_key]['total_orders'] += 1

        # Calculate average order values
        for stats in quarterly_stats.values():
            if stats['total_orders'] > 0:
                stats['avg_order_value'] = stats['total_revenue'] / stats['total_orders']

        return list(quarterly_stats.values())

    def get_yearly_stats(self, payments):
        # Get all payments for completed orders
        yearly_stats = {}

        for payment in payments.order_by('created_date'):
            created_date = payment.created_date
            year = created_date.year
            year_key = str(year)

            if year_key not in yearly_stats:
                yearly_stats[year_key] = {
                    'period': year_key,
                    'year': year,
                    'total_revenue': Decimal('0.00'),
                    'total_orders': 0,
                    'avg_order_value': Decimal('0.00')
                }

            yearly_stats[year_key]['total_revenue'] += payment.amount
            yearly_stats[year_key]['total_orders'] += 1

        # Calculate average order values
        for stats in yearly_stats.values():
            if stats['total_orders'] > 0:
                stats['avg_order_value'] = stats['total_revenue'] / stats['total_orders']

        return list(yearly_stats.values())

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from django.db.models import Sum, Count
from datetime import datetime
from decimal import Decimal
from collections import defaultdict
from .models import Payment, OrderDetail


class AdminRevenueViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    @action(detail=False, methods=['get'], url_path='statistics/(?P<period_type>month|quarter|year)')
    def get_admin_statistics(self, request, period_type=None):
        # Validate and parse dates
        start_date_str = request.query_params.get("start_date")
        end_date_str = request.query_params.get("end_date")

        if not start_date_str or not end_date_str:
            raise ValidationError({"detail": "Cần cung cấp start_date và end_date (YYYY-MM-DD)"})

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            raise ValidationError({"detail": "Sai định dạng ngày. Dùng YYYY-MM-DD"})

        if start_date > end_date:
            raise ValidationError({"detail": "start_date phải nhỏ hơn hoặc bằng end_date"})

        # Lọc Payment
        payments = Payment.objects.filter(status=1, created_date__date__range=(start_date, end_date)).select_related('order')

        # Gom nhóm thống kê
        stats = self.get_grouped_stats(payments, period_type)

        # Tổng hợp
        total = payments.aggregate(
            total_revenue=Sum('amount'),
            total_orders=Count('id')
        )

        total_products = OrderDetail.objects.filter(
            order__in=[p.order_id for p in payments]
        ).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0

        return Response({
            "period_type": period_type,
            "statistics": stats,
            "summary": {
                "total_revenue": str(total['total_revenue'] or Decimal('0.00')),
                "total_orders": total['total_orders'] or 0,
                "total_products_sold": total_products
            }
        }, status=status.HTTP_200_OK)

    def get_grouped_stats(self, payments, period_type):
        grouped = defaultdict(lambda: {"revenue": Decimal('0.00'), "orders": 0, "products_sold": 0})

        for payment in payments:
            dt = payment.created_date
            key = self.get_period_key(dt, period_type)

            grouped[key]["revenue"] += payment.amount
            grouped[key]["orders"] += 1

            # Tính tổng sản phẩm của từng order
            quantity = OrderDetail.objects.filter(order=payment.order).aggregate(qty=Sum('quantity'))['qty'] or 0
            grouped[key]["products_sold"] += quantity

        # Format output
        return [
            {
                "period": key,
                "total_revenue": str(data["revenue"]),
                "total_orders": data["orders"],
                "total_products_sold": data["products_sold"]
            }
            for key, data in sorted(grouped.items())
        ]

    def get_period_key(self, dt, period_type):
        if period_type == "month":
            return f"{dt.year}-{dt.month:02d}"
        elif period_type == "quarter":
            quarter = (dt.month - 1) // 3 + 1
            return f"{dt.year}-Q{quarter}"
        elif period_type == "year":
            return str(dt.year)
        else:
            raise ValidationError({"detail": "Giai đoạn không hợp lệ"})

class FavouriteViewSet(viewsets.ViewSet,generics.ListAPIView):
    queryset = Favourite.objects.filter(active=True)
    serializer_class = FavouriteSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = paginator.ProductPaginator
    def get_queryset(self):
        return Favourite.objects.filter(user=self.request.user)


