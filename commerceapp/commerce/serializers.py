from itertools import product

from django.utils.translation.trans_null import activate
from rest_framework import serializers, validators
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import Category, Product, Comment, User, Shop, Like, Cart, CartItem, Payment, ImageProduct, Order, OrderDetail, Favourite

class CategorySerializer(ModelSerializer):

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_date']

class CategoryDetailSerializer(CategorySerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['products'] = [
            {
                'id': product.id,
                'name': product.name,
                'price': product.price
            }
            for product in instance.products.filter(active=True)
        ]
        return data
    class Meta:
        model = CategorySerializer.Meta.model
        fields = CategorySerializer.Meta.fields + ['products']


class ImageProductSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['pathImg'] = instance.pathImg.url if instance.pathImg else None
        return data
    class Meta:
        model = ImageProduct
        fields = ['id', 'pathImg']

class ProductSerializer(ModelSerializer):
    images = ImageProductSerializer(source='imageproduct',many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'quantity', 'product_status', 'shop', 'category','images']
        extra_kwargs = {
            'shop': {'read_only': True}
        }
    def create(self, validated_data):
        request = self.context.get('request')  # lấy request từ context
        product = Product.objects.create(**validated_data)

        if request and request.FILES:
            # Lấy danh sách file ảnh
            files = request.FILES.getlist('images')
            for file in files:
                ImageProduct.objects.create(product=product, pathImg=file)

        return product

    def update(self, instance, validated_data):
        request = self.context.get('request')

        # Cập nhật các field cơ bản
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Xử lý ảnh mới nếu có upload
        if request and request.FILES:
            files = request.FILES.getlist('images')
            # Xóa ảnh cũ trước khi thêm mới
            instance.imageproduct.all().delete()

            for file in files:
                ImageProduct.objects.create(product=instance, pathImg=file)

        return instance


class LikeSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user']={
            'id': instance.user.id,
            'name': instance.user.username
        }
        data['product']={
            'id': instance.product.id,
            'name': instance.product.name,
            'shop': instance.product.shop_id
        }
        return data
    class Meta:
        model = Like
        fields = ['id', 'star', 'product', 'user']
        extra_kwargs = {
            'star': {
                'error_messages': {
                    'min_value': 'Số sao phải từ 1 trở lên.',
                    'max_value': 'Số sao tối đa là 5.'
                }
            }
        }



class ProductDetailSerializer(ProductSerializer):
    like = SerializerMethodField()

    def get_like(self, product):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return product.favourite_set.filter(user=request.user, active=True).exists()


    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['images'] = ImageProductSerializer(instance.imageproduct.all(), many=True).data
        data['shop'] = {
            'id': instance.shop.id,
            'name': instance.shop.name,
            'avatar': instance.shop.avatar.url if instance.shop.avatar else None
        }
        data['category'] = {
            'id': instance.category.id,
            'name': instance.category.name
        }
        return data

    class Meta:
        model = ProductSerializer.Meta.model
        fields = ProductSerializer.Meta.fields + ['like']
        extra_kwargs = ProductSerializer.Meta.extra_kwargs


class CommentSerializer(ModelSerializer):
    def to_representation(self, comment):
        req = super().to_representation(comment)
        req['user'] = {
            'id': comment.user.id,
            'username': comment.user.username,
            'avatar': comment.user.avatar.url if comment.user.avatar else None
        }
        return req
    class Meta:
        model = Comment
        fields = ["id","content", "user", "parent", "created_date", "updated_date", "product"]
        extra_kwargs={
            'product': {
                'write_only': True
            }
        }


class UserSerializer(ModelSerializer):
    def create(self, validated_data):
        u = User(**validated_data)
        u.set_password(u.password)
        u.save()
        return u

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return value

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Nếu avatar là FileField/ImageField với Cloudinary
        data['avatar'] = instance.avatar.url if instance.avatar else None

        return data

    class Meta:
        model = User
        fields = ['id','first_name', 'last_name', 'email', 'username', 'password', 'gender' ,'phone', 'avatar', 'role', 'created_date', 'updated_date', 'is_verified_seller']
        read_only_fields = ['id', 'is_verified_user']
        extra_kwargs ={
            'password' : {
                "write_only": True
            },
            'avatar': {
               'error_messages': {
                   'required' : 'vui lòng upload avatar (ảnh đại diện) của bạn!!'
               }
           },
            'email': {
                'validators': [validators.UniqueValidator(queryset=User.objects.all(), message="Email đã được sử dụng.")]
            },
            'username': {
                'validators': [validators.UniqueValidator(queryset=User.objects.all(), message="Tên đăng nhập đã được sử dụng.")]
            },
            'phone': {
                'validators': [validators.UniqueValidator(queryset=User.objects.all(), message="Số điện thoại đã được sử dụng.")]
            }

        }


class ShopSerializer(ModelSerializer):
    avatar = serializers.ImageField(
        required=True,
        error_messages={
            'required': 'Vui lòng upload avatar (ảnh đại diện) của shop!!'
        }
    )

    class Meta:
        model = Shop
        fields = ['id', 'name', 'user', 'avatar']
        extra_kwargs={
            'user': {'read_only': True}
        }


class PaymentSerializer(serializers.ModelSerializer):
    # Fields for payment initialization
    order_id = serializers.IntegerField(write_only=True, required=False)
    return_url = serializers.URLField(write_only=True, required=False)

    # Fields for payment verification
    payment_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'method', 'status',
                  'transaction_id', 'created_date', 'updated_date',
                  'order_id', 'return_url', 'payment_data']
        read_only_fields = ['id', 'transaction_id', 'status', 'created_date', 'updated_date']




class CartItemSerializer(ModelSerializer):

    def to_representation(self, cart_item ):
        rep = super().to_representation(cart_item)
        product = cart_item.product
        first_image = product.imageproduct.first()
        shop = product.shop
        rep['product'] = {
            'id': cart_item.product.id,
            'name': cart_item.product.name,
            'image' : first_image.pathImg.url if first_image and first_image.pathImg else None,
            'price': cart_item.product.price
        }
        rep['shop']={
            'id': shop.id,
            'name': shop.name
        }
        return rep
    class Meta:
        model = CartItem
        fields = '__all__'
        extra_kwargs = {
            'cart': {
                'read_only': True
            }
        }

class CartSerializer(ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = '__all__'
        read_only_fields = ['id', 'user']


class OrderSerializer(ModelSerializer):

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["user"] = {
            "id": instance.user.id,
            "username": instance.user.username,
            "phone": instance.user.phone,
            "email": instance.user.email
        }
        data['shop'] ={
            "id": instance.shop.id,
            "name": instance.shop.name
        }
        return data

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ['id', 'user', 'shop']


class OrderDetailSerializer(ModelSerializer):

    def to_representation(self, instance):
        data = super().to_representation(instance)
        image = instance.product.imageproduct.first()
        data["product"] = {
            "id": instance.product.id,
            "name": instance.product.name,
            "price": instance.product.price,
            "image": image.pathImg.url if image and image.pathImg else None
        }

        data["order"] = {
            "id": instance.order.id,
            "shop": instance.order.shop.id
        }

        data["shop"] = {
        "name": instance.order.shop.name
        }
        return data

    class Meta:
        model = OrderDetail
        fields = "__all__"

class ProductComparisonSerializer(serializers.ModelSerializer):
    shop = ShopSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'shop']


class RevenueStatisticsSerializer(serializers.Serializer):
    shop_id = serializers.IntegerField()
    shop_name = serializers.CharField()
    period_type = serializers.CharField()
    statistics = serializers.ListField()
    total_revenue_all_periods = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_orders_all_periods = serializers.IntegerField()


class AdminRevenueStatisticsSerializer(serializers.Serializer):
    period = serializers.ChoiceField(choices=['month', 'quarter', 'year'])
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_products_sold = serializers.IntegerField()

    stats = serializers.ListField(
        child=serializers.DictField(
            child=serializers.Field()
        )
    )

class FavouriteSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['user'] ={
            'id': instance.user.id,
            'username': instance.user.username
        }
        data['product'] = {
            'id': instance.product_id,
            'name': instance.product.name,
            'shop_id': instance.product.shop_id,
            'shop_name': instance.product.shop.name,
            'price': instance.product.price
        }
        return data
    class Meta:
        model = Favourite
        fields = '__all__'

