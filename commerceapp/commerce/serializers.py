from itertools import product
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Category, Product, Comment, User, Shop, Like, Cart, CartItem, Payment, ImageProduct

class CategorySerializer(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_date']


class ImageProductSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['pathImg'] = instance.pathImg.url if instance.pathImg else None
        return data
    class Meta:
        model = ImageProduct
        fields = ['id', 'pathImg']

class ProductSerializer(ModelSerializer):
    images = ImageProductSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'quantity', 'product_status', 'shop', 'category', 'images']
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # data['image'] = instance.image.url if instance.image else ''
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


    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Giá sản phẩm phải >= 0.")
        return value


class CommentSerializer(ModelSerializer):
    def to_representation(self, comment):
        req = super().to_representation(comment)
        req['user'] = {
            'username': comment.user.username,
            'avatar': comment.user.avatar.url if comment.user.avatar else None
        }
        return req
    class Meta:
        model = Comment
        fields = ["content", "user", "parent", "created_date", "updated_date", "product"]
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

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'username', 'password', 'gender' ,'phone', 'avatar', 'role']
        extra_kwargs ={
            'password' : {
                "write_only": True
            },
            'avatar': {
               'error_messages': {
                   'required' : 'vui lòng upload avatar (ảnh đại diện) của bạn!!'
               }
           }
        }


class ShopSerializer(ModelSerializer):

    class Meta:
        model = Shop
        fields = ['id', 'name', 'user', 'avatar']
        extra_kwargs={
            'user': {'read_only': True},
            'avatar': {
                'error_messages': {
                    'required': 'vui lòng upload avatar (ảnh đại diện) của shop!!'
                }
            }
        }


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'method', 'status',
                  'transaction_id', 'payment_details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'transaction_id', 'status', 'created_at', 'updated_at']


class PaymentInitSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=Payment.payment_method_choices)
    return_url = serializers.URLField(required=False)


class PaymentVerifySerializer(serializers.Serializer):
    payment_id = serializers.IntegerField()
    transaction_id = serializers.CharField(required=False)
    payment_data = serializers.JSONField(required=False)


class LikeSerializer(ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'star']





class CartItemSerializer(ModelSerializer):

    def to_representation(self, cart_item ):
        rep = super().to_representation(cart_item)
        first_image = cart_item.product.imageproduct.first()
        rep['product'] = {
            'mã sản phẩm': cart_item.product.id,
            'tên sản phẩm': cart_item.product.name,
            'Ảnh sản phẩm' : first_image.pathImg.url if first_image and first_image.pathImg else None
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
