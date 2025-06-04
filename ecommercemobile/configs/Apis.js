import axios from "axios";

const BASE_URL = 'http://192.168.1.112:8000/';
export const endpoints  = {
    'categories' : '/categories/',
    'products' : '/products/',
    'product_detail': (productId) => `/products/${productId}/`,
    'shops': '/shops/',
    'myShop': '/shops/my-shop/',
    'shopDetail': (userId) => `/shops/${userId}`,
    'shopProducts': (shopId) => `/shops/${shopId}/products/`,
    'register': (userRole) => `/users/register-${userRole}/`,
    'login': '/o/token/',
    'current_user': '/users/current-user/',
    'addProduct': (shopId) => `/shops/${shopId}/add-product/`,
    'cart': '/cart/',
    'addToCart': '/cart/add-to-cart/',
    'cartItem': '/cartitems/',
    "comment": (productId) => `/products/${productId}/comment/`,
    "deleteComment": (commentId) => `/comments/${commentId}/`,
    'order': '/orders/',
    'orderDetail': (orderId) => `/orderdetail/${orderId}`,
    'users': '/users/',
    'verifySeller': (userId) => `/users/${userId}/verify-seller/`,
    'cancelSeller': (userId) => `/users/${userId}/cancel-seller/`,
};

export const authAPI = (accessToken) => {
    return axios.create({
        'baseURL': BASE_URL,
        'headers': {
            'Authorization': `Bearer ${accessToken}`
        }
    });
};

export default axios.create({
    'baseURL': BASE_URL
});