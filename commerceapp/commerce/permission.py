from django.contrib.auth import authenticate
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, IsAuthenticated


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            raise PermissionDenied("Bạn chưa đăng nhập!")
        if not request.user.is_verified_seller:
            raise PermissionDenied('Bạn không phải là người bán!')
        return True


class IsBuyer(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            raise PermissionDenied("Bạn phải đăng nhập!")
        if not request.user.role=='buyer':
            raise PermissionDenied( "Bạn không phải là người mua!")
        return True


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            raise PermissionDenied("Bạn phải đăng nhập!")
        if not request.user.role=='staff':
            raise PermissionDenied("Bạn không phải là nhân viên!")
        return True


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser


class IsAdminOrStaff(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'staff']
        )


class IsAdminOrSeller(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'seller']
        )


class IsCommentOwner(IsAuthenticated):
    def has_object_permission(self, request, view, comment):
        if request.user != comment.user:
            raise PermissionDenied("Bạn không phải chủ sở hữu của bình luận này!")
        return super().has_permission(request, view) and request.user == comment.user


class IsRatingOwner(IsAuthenticated):
    def has_object_permission(self, request, view, like):
        if request.user != like.user:
            raise PermissionDenied("Bạn không phải chủ sở hữu của lượt đánh giá này!")
        return super().has_permission(request, view) and request.user == like.user

class IsOwnerShop(IsAuthenticated):
    def has_object_permission(self, request, view, shop):
        if shop.user != request.user:
            raise PermissionDenied("Bạn không phải là chủ sở hữu của shop này!")
        return True

class IsOwnerOrder(IsAuthenticated):
    def has_object_permission(self, request, view, order):
        if request.user != order.user:
            raise PermissionDenied("Bạn không phải là chủ sở hữu của đơn hàng này!")
        return True

