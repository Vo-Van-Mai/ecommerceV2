import axios from "axios";

const BASE_URL = 'http://192.168.100.229:8000/';
export const endpoints  = {
    'categories' : '/categories/',
    'products' : '/products/',
    'product_detail': (productId) => `/products/${productId}/`,

    //shop
    'shops': '/shops/',
    'shop-detail': (shopId) => `/shops/${shopId}/`,
    'myShop': '/shops/my-shop/',
    'shopDetail': (userId) => `/shops/${userId}`,
    'shopProducts': (shopId) => `/shops/${shopId}/products/`,

    //Login, register, user
    'users': '/users/',
    'register': (userRole) => `/users/register-${userRole}/`,
    'login': '/o/token/',
    'current_user': '/users/current-user/',
    'addProduct': (shopId) => `/shops/${shopId}/add-product/`,
    'verifySeller': (userId) => `/users/${userId}/verify-seller/`,
    'cancelSeller': (userId) => `/users/${userId}/cancel-seller/`,

    //cart
    'cart': '/cart/',
    'addToCart': '/cart/add-to-cart/',
    'cartItem': '/cartitems/',

    //comment
    "comment": (productId) => `/products/${productId}/comment/`,
    "deleteComment": (commentId) => `/comments/${commentId}/`,
    
    //Like
    "like": '/favourites/',

    //order
    'order': '/orders/',
    'orderOfBuyer': '/orders/get-order-buyer/',
    'orderOfShop': '/orders/get-order-shop/',
    'orderDetail': (orderId) => `/orderdetail/${orderId}`,
    'orderVerify': (orderId) => `/orders/${orderId}/confirm/`,
    'orderVrifyShipping': (orderId) => `/orders/${orderId}/confirm-shipping/`,
    'confirmReceived': (orderId) => `/orders/${orderId}/confirm-received/`,
    'cancelOrder': (orderId) => `/orders/${orderId}/cancel/`,

    //staff
    "createStaff": "/users/register-staff/",

    //payment
    'momo_payment': '/payments/momo_payment/',
    'paymentDetail': (paymentId) => `/payments/${paymentId}/`,
    'momo_return': '/payments/momo_return/',
    'payment-cash': (orderId) => `/payments/${orderId}/payment-cash/`,

    //statistics
    'revenue-stats': (shopId, periodType) => `/seller-statistics/${shopId}/revenue-stats/${periodType}/`,
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