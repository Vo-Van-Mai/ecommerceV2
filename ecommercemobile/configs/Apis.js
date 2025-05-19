import axios from "axios";

const BASE_URL = 'http://192.168.100.229:8000/';
export const endpoinds = {
    'categories' : '/categories/',
    'products' : '/products/',
    'product_detail': (productId) => `/products/${productId}/`,
    'shops': '/shops/',
    'register': (userRole) => `/users/register-${userRole}/`,
    'login': '/o/token/'
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