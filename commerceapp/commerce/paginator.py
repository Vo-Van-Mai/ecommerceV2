from rest_framework.pagination import PageNumberPagination

class ItemPaginator(PageNumberPagination):
    page_size = 6


class ProductPaginator(PageNumberPagination):
    page_size = 6

class UserPaginator(PageNumberPagination):
    page_size = 5