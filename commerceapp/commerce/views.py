from venv import create

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.shortcuts import get_object_or_404
# from tarfile import TruncatedHeaderError

from django.http import HttpResponse
from paypal.standard.ipn.signals import valid_ipn_received
from rest_framework import viewsets, permissions, generics, status, parsers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.pagination import PageNumberPagination
from .models import Category, Product, Comment, User, Shop,Payment, Like, Cart, CartItem, Favourite, OrderDetail, Order
from .permission import IsSeller, IsOwnerShop, IsBuyer
from .serializers import (CategorySerializer, ProductSerializer, CommentSerializer, UserSerializer, ProductDetailSerializer,
                          ShopSerializer, PaymentSerializer, PaymentInitSerializer, PaymentVerifySerializer, OrderSerializer, OrderDetailSerializer,
                          LikeSerializer, CartSerializer, CartItemSerializer, CategoryDetailSerializer)
from .services import PaymentFactory
from . import serializers, paginator
from . import permission


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

    @action(methods=['get','post'], detail=True, url_path="rating")
    def get_rating(self, request, pk):
        product = self.get_object()

        if request.method.__eq__('POST'):
            star = request.data.get('star')
            if not star:
                return Response({'error': 'Thiếu dữ liệu đánh giá (star)'}, status=status.HTTP_400_BAD_REQUEST)

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

        else:
            star = product.like_set.select_related('user').filter(active=True).order_by('-id')
            p = paginator.ProductPaginator()
            page = p.paginate_queryset(star, self.request)
            if page:
                s = LikeSerializer(page, many=True)
                return p.get_paginated_response(s.data)
            else:
                return Response(LikeSerializer(star, many=True).data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, url_path='like')
    def like(self, request, pk):
        li, created = Favourite.objects.get_or_create(user=request.user, product_id = pk)
        if not created:
            li.active = not li.active
        li.save()

        return Response(ProductDetailSerializer(self.get_object(), context={'request': request}).data, status=status.HTTP_200_OK)

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

        if not IsOwnerShop().has_object_permission(request, self, shop):
            raise PermissionDenied("bạn không phải chủ của hàng này!")
        return Response(ShopSerializer(shop).data, status=status.HTTP_200_OK)

    def create(self, request):
        if not IsSeller().has_permission(request, self):
            if request.user.role != "seller":
                raise PermissionDenied("Bạn không phải người bán nên không thể tạo cửa hàng!")
            raise PermissionDenied("Bạn chưa có quyền tạo shop!")
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
        try:
            shop = Shop.objects.get(user=request.user)
            serializer = ShopSerializer(shop, context={'request': request})
            return Response(serializer.data)
        except Shop.DoesNotExist:
            return Response({"Lỗi": "Bạn chưa có cửa hàng nào!"}, status=status.HTTP_404_NOT_FOUND)


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and editing Payment instances"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all payments
        for the currently authenticated user.
        """
        user = self.request.user

        if not user or user.is_anonymous:
            return Payment.objects.none()
        # If staff, return all payments
        if user.is_staff:
            return Payment.objects.all()

        # Otherwise, return only user's payments
        return Payment.objects.filter(order__user=user)

    @action(detail=False, methods=['post'])
    def initialize(self, request):
        """
        Initialize a payment
        """
        serializer = PaymentInitSerializer(data=request.data)

        if serializer.is_valid():
            order_id = serializer.validated_data['order_id']
            method = serializer.validated_data['method']
            return_url = serializer.validated_data.get('return_url')

            # Get the order
            try:
                from models import Order
                order = Order.objects.get(id=order_id, user=request.user)
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found or does not belong to user'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Create payment
            payment = Payment.objects.create(
                order=order,
                amount=order.total_amount,  # Assuming Order model has total_amount field
                method=method
            )

            # Process payment
            processor = PaymentFactory.get_processor(method)
            result = processor.process_payment(payment, return_url)

            if result['success']:
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': result.get('message', 'Payment initialization failed')
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def verify(self, request):
        """
        Verify a payment
        """
        serializer = PaymentVerifySerializer(data=request.data)

        if serializer.is_valid():
            payment_id = serializer.validated_data['payment_id']
            transaction_id = serializer.validated_data.get('transaction_id')
            payment_data = serializer.validated_data.get('payment_data')

            # Get the payment
            payment = get_object_or_404(Payment, id=payment_id)

            # Check if the payment belongs to the user if not staff
            if not request.user.is_staff and payment.order.user != request.user:
                return Response(
                    {'error': 'Payment does not belong to user'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Verify payment
            processor = PaymentFactory.get_processor(payment.method)
            result = processor.verify_payment(payment, transaction_id, payment_data)

            if result['success']:
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': result.get('message', 'Payment verification failed')
                }, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def methods(self, request):
        """
        Get available payment methods
        """
        return Response({
            'methods': [{'value': k, 'label': v} for k, v in Payment.PAYMENT_METHOD_CHOICES]
        })



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
        shop_products = {}  # {shop_id: [product_info, ...]}
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


class OrderDetailViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permission.IsOwnerOrder]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False) or not self.request.user.is_authenticated:
            return OrderDetail.objects.none()
        return OrderDetail.objects.filter(active=True, order__user=self.request.user)

    def retrieve(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"Chi tiết": "Không tìm thấy đơn hàng!"}, status=status.HTTP_404_NOT_FOUND)

        details = OrderDetail.objects.select_related('product', 'order__shop', 'order').filter(order=order)
        serializer = OrderDetailSerializer(details, many=True)
        return Response(serializer.data)






