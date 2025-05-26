// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'; // Backend runs on port 5000

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Important for CORS
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error("API Error:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Request setup error:", error.message);
        }
        return Promise.reject(error);
    }
);

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
export const updateUserProfile = (userData) => apiClient.put('/auth/profile', userData);


// --- Shops ---
export const createShop = (shopData) => apiClient.post('/shops', shopData);
export const getMyShop = () => apiClient.get('/shops/my');
export const getShopsByCity = (cityName) => apiClient.get(`/shops/city/${cityName}`);

// --- Products ---
export const addProduct = (productData) => apiClient.post('/products', productData);
export const updateProduct = (productId, productData) => apiClient.put(`/products/${productId}`, productData);
export const deleteProduct = (productId) => apiClient.delete(`/products/${productId}`);
export const getProducts = async () => {
    try {
        return await apiClient.get('/products');
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const getProductsByShop = async (shopId) => {
    try {
        return await apiClient.get(`/shops/${shopId}/products`);
    } catch (error) {
        console.error(`Error fetching products for shop ${shopId}:`, error);
        throw error;
    }
};

export const getProductsByCity = async (cityName) => {
    try {
        return await apiClient.get(`/products/city/${cityName}`);
    } catch (error) {
        console.error(`Error fetching products for city ${cityName}:`, error);
        throw error;
    }
};

// --- Addresses ---
export const getAddresses = () => apiClient.get('/addresses');
export const getDefaultAddress = () => apiClient.get('/addresses/default');
export const addAddress = (addressData) => apiClient.post('/addresses', addressData);
export const updateAddress = (addressId, addressData) => apiClient.put(`/addresses/${addressId}`, addressData);
export const deleteAddress = (addressId) => apiClient.delete(`/addresses/${addressId}`);

// --- Orders ---
export const placeOrder = (orderData) => apiClient.post('/orders', orderData);
export const getCustomerOrders = () => apiClient.get('/orders/customer');
export const getShopOrders = () => apiClient.get('/orders/shop'); // Admin getting orders for their shop
export const updateOrderStatus = (orderId, status) => apiClient.put(`/orders/${orderId}/status`, { status });
export const cancelOrder = (orderId) => apiClient.put(`/orders/${orderId}/cancel`, { status: 'Cancelled' });

// --- Analytics ---
export const getShopAnalytics = (days = 30) => apiClient.get(`/admin/analytics?days=${days}`);

export default apiClient;
    