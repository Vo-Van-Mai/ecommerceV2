import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/";
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