import axios from "axios";

const BASE_URL = 'http://192.168.100.229:8000/';
export const endpoinds = {
    'categories' : '/categories/',
    'products' : '/products/',
    'shops': '/shops/'
};

export const authAPI = (accessToken) => {
    return axios.create({
        'baseURL': BASE_URL,
        'headers': {
            Authorization: `Bearer ${accessToken}`
        }
    });
};

export default axios.create({
    'baseURL': BASE_URL
});