// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api'; // Backend runs on port 5001

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Auth ---
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);
export const getMe = async () => { // No token argument needed due to interceptor
    try {
        const response = await apiClient.get('/auth/me');
        console.log("User profile data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error.response ? error.response.data : error.message);
        throw error; // Re-throw to be handled by caller, or return null/specific error object
    }
};


// --- Shops ---
export const createShop = (shopData) => apiClient.post('/shops', shopData);
export const getMyShop = () => apiClient.get('/shops/my');
export const getShopsByCity = (cityName) => apiClient.get(`/shops/city/${cityName}`);

// --- Products ---
export const addProduct = (productData) => apiClient.post('/products', productData);
export const updateProduct = (productId, productData) => apiClient.put(`/products/${productId}`, productData);
export const deleteProduct = (productId) => apiClient.delete(`/products/${productId}`);
export const getProductsByShop = (shopId) => apiClient.get(`/shops/${shopId}/products`);
export const getProductsByCity = (cityName) => apiClient.get(`/products/city/${cityName}`);

// --- Orders ---
export const placeOrder = (orderData) => apiClient.post('/orders', orderData);
export const getCustomerOrders = () => apiClient.get('/orders/customer');
export const getShopOrders = () => apiClient.get('/orders/shop'); // Admin getting orders for their shop
export const updateOrderStatus = (orderId, status) => apiClient.put(`/orders/${orderId}/status`, { status });

// --- Analytics ---
export const getShopAnalytics = (days = 30) => apiClient.get(`/admin/analytics?days=${days}`);

export default apiClient;
    