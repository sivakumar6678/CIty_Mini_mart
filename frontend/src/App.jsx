// frontend/src/App.jsx
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import CustomerDashboard from './pages/CustomerDashboard';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage'; // Customer orders
import ShopOrdersPage from './pages/ShopOrdersPage'; // Admin shop orders
import CreateShopPage from './pages/CreateShopPage'; // Admin create shop
import AddProductPage from './pages/AddProductPage'; // Admin add product

// Services
import { getMe } from './services/api';

// Styles
import './App.css';

// Create AuthContext
export const AuthContext = createContext(null);

function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        city: localStorage.getItem('city'),
        name: localStorage.getItem('name'),
        isAuthenticated: !!localStorage.getItem('token'),
        userId: localStorage.getItem('userId'),
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !auth.role) { // If token exists but context not fully populated, try to fetch user data
            const fetchUser = async () => {
                try {
                    console.log("Fetching user data with token:", token);
                    const userData = await getMe(); // No need to pass token, interceptor will handle it
                    console.log("User data fetched:", userData);
                    if (userData) {
                       setAuth({
                           token: token,
                           role: userData.role,
                           city: userData.city,
                           name: userData.name,
                           isAuthenticated: true,
                           userId: userData.id,
                       });
                       console.log("Auth state updated with user data");
                    } else { // Token might be invalid or expired
                        console.log("No user data returned, logging out");
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Failed to fetch user data on load:", error);
                    handleLogout(); // Clear invalid auth state
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        } else {
            console.log("No token or auth already populated, skipping fetch");
            setIsLoading(false);
        }
    }, []);


    const handleLogin = (loginData) => {
        localStorage.setItem('token', loginData.access_token);
        localStorage.setItem('role', loginData.role);
        localStorage.setItem('city', loginData.city);
        localStorage.setItem('name', loginData.name);
        localStorage.setItem('userId', loginData.user_id);
        setAuth({
            token: loginData.access_token,
            role: loginData.role,
            city: loginData.city,
            name: loginData.name,
            isAuthenticated: true,
            userId: loginData.user_id,
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('city');
        localStorage.removeItem('name');
        localStorage.removeItem('cart'); // Clear cart on logout
        localStorage.removeItem('userId');
        setAuth({
            token: null,
            role: null,
            city: null,
            name: null,
            isAuthenticated: false,
            userId: null,
        });
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="loading-spinner mb-4 mx-auto"></div>
                    <p className="text-xl font-semibold text-primary">Loading Mini Mart...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we prepare your experience</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ auth, handleLogin, handleLogout, setAuth }}>
            <Router>
                <AnimatePresence mode="wait">
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to={auth.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} />} />
                        <Route path="/register" element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to={auth.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} />} />
                        
                        {/* Main Layout Routes */}
                        <Route element={<MainLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products/city/:cityName" element={<ProductsPage />} />
                            
                            {/* Customer Routes */}
                            <Route path="/customer/dashboard" element={
                                auth.isAuthenticated && auth.role === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" />
                            } />
                            <Route path="/cart" element={
                                auth.isAuthenticated && auth.role === 'customer' ? <CartPage /> : <Navigate to="/login" />
                            } />
                            <Route path="/orders" element={
                                auth.isAuthenticated && auth.role === 'customer' ? <OrdersPage /> : <Navigate to="/login" />
                            } />
                        </Route>
                        
                        {/* Admin Layout Routes */}
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/dashboard" element={
                                auth.isAuthenticated && auth.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
                            } />
                            <Route path="/admin/analytics" element={
                                auth.isAuthenticated && auth.role === 'admin' ? <AdminAnalyticsPage /> : <Navigate to="/login" />
                            } />
                            <Route path="/admin/create-shop" element={
                                auth.isAuthenticated && auth.role === 'admin' ? <CreateShopPage /> : <Navigate to="/login" />
                            } />
                            <Route path="/admin/add-product" element={
                                auth.isAuthenticated && auth.role === 'admin' ? <AddProductPage /> : <Navigate to="/login" />
                            } />
                            <Route path="/admin/shop-orders" element={
                                auth.isAuthenticated && auth.role === 'admin' ? <ShopOrdersPage /> : <Navigate to="/login" />
                            } />
                        </Route>

                        {/* Fallback Route */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </AnimatePresence>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
    