from random import choices

import cloudinary
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from ckeditor.fields import RichTextField
from unicodedata import category
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    avatar = CloudinaryField(
        'image'
    )
    class GenderUser(models.TextChoices):
        MALE = "Male", "Nam"
        FEMALE = "Female", "Nữ"
        OTHER = "Other", "Khác"

    gender = models.CharField(
        max_length=10,
        choices=GenderUser.choices,
        default=GenderUser.OTHER,
        null = True
    )

    is_verified_seller = models.BooleanField(default=False)

    class RoleType(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        STAFF = 'staff', 'Nhân viên'
        SELLER = 'seller', 'Người bán'
        BUYER = 'buyer', 'Người mua'

    role = models.CharField(choices=RoleType.choices, default=RoleType.BUYER, max_length=20)
    address = models.TextField(max_length=255, null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-id'] #sap xep giam theo id (cai nao moi thi len truoc nao cu thi o sau

class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(default="No description provided")

    def __str__(self):
        return self.name


class Product(BaseModel):
    name = models.CharField(max_length=100, verbose_name="Tên sản phẩm")
    description = RichTextField()
    price = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Giá")
    quantity = models.IntegerField(default=0)
    product_status = models.BooleanField(default=True)
    stock = models.IntegerField(default=0)
    sold = models.IntegerField(default=0)
    created_by = models.CharField(max_length=10, null=True, blank=True)
    category = models.ForeignKey(Category,on_delete=models.PROTECT, related_name='products')
    shop = models.ForeignKey('Shop', on_delete=models.CASCADE, related_name='products')

    def save(self, *args, **kwargs):
        if self._state.adding:  # Chỉ khi tạo mới còn khi câp nhật thì không
            self.stock = self.quantity
            self.sold = 0

        self.product_status = self.quantity > 0
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ImageProduct(BaseModel):
    pathImg = CloudinaryField('image', blank=True, null=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE,related_name='imageproduct')
    def __str__(self):
        return str(self.pathImg)



class Shop(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField()
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="shop")
    avatar = CloudinaryField('image', null=True)

    def __str__(self):
        return self.name


class Order(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=10, decimal_places=0)
    address = models.TextField(max_length=255, null=True)
    class PaymenMethod(models.IntegerChoices):
        CASH = 1, "Thanh toán bằng tiền mặt"
        BANKING = 2, "Thanh toán bằng ví điện tử"

    payment_method = models.IntegerField(choices=PaymenMethod.choices)

    class OrderStatus(models.IntegerChoices):
        PENDING = 1, "Chờ xác nhận"
        CONFIRMED = 2, "Đã xác nhận"
        CANCELLED = 3, "Đã bị hủy"
        SHIPPED = 4, "Đang được giao"
        FAILED = 5, "Bị hủy do thanh toán thất bại"
        DELIVERED = 6, "Đơn hàng đã được giao"

    status = models.IntegerField(choices=OrderStatus.choices, default=OrderStatus.PENDING)



    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"


class OrderDetail(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_details')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_details')
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=0)

    def __str__(self):
        return f"{self.product.name} x{self.quantity} for Order #{self.order.id}"

    class Meta:
        ordering = ['-created_date']



class Payment(BaseModel):
    PAYMENT_METHOD_CASH = 0
    PAYMENT_METHOD_MOMO = 1
    payment_method_choices = [
        (PAYMENT_METHOD_CASH, 'Cash On Delivery'),
        (PAYMENT_METHOD_MOMO, 'MoMo')
    ]

    STATUS_PENDING = 0
    STATUS_COMPLETED = 1
    STATUS_FAILED = 2
    payment_status_choices = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed')
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True)
    payment_method = models.IntegerField(choices=payment_method_choices, default=PAYMENT_METHOD_CASH)
    status = models.IntegerField(choices=payment_status_choices, default=STATUS_PENDING)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    request_id = models.CharField(max_length=100, blank=True, null=True)
    created_date = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')

    def __str__(self):
        return f"{self.get_payment_method_display()} payment for order {self.order.id}"



class Review(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        abstract = True

class Comment(Review):
    content = models.TextField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.content

# Rating ( do đặt nhầm thành like like => favourite)
class Like(Review):
    star = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'product'], name='unique_user_product_like')
        ]
    def __str__(self):
        return str(self.star)

class Favourite(Review):
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'product'], name='unique_user_product_favourite')
        ]


class Conversation(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    shop = models.ForeignKey(Shop, on_delete=models.CASCADE, related_name='conversations')
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'shop'], name='unique_user_shop_conversation')
        ]

class ChatMessage(BaseModel):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_messages')
    sender_shop = models.ForeignKey(Shop, null=True, blank=True, on_delete=models.SET_NULL, related_name='sent_shop_messages')
    is_system = models.BooleanField(default=False)  # True nếu hệ thống gửi tự động
    message = models.TextField()

    def __str__(self):
        return f"{self.message[:30]}..."

class Cart(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')

    def __str__(self):
        return f"Cart of {self.user.username}"

class CartItem(BaseModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['cart', 'product'], name='unique_cart_product')
        ]


