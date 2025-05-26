// frontend/src/pages/CustomerDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { getProductsByCity, getShopsByCity, getCustomerOrders } from '../services/api';

function CustomerDashboard() {
    const { auth } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingShops, setLoadingShops] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        if (auth.isAuthenticated) {
            if (auth.city) {
                fetchProducts(auth.city);
                fetchShops(auth.city);
            }
            fetchRecentOrders();
        }
    }, [auth.city, auth.isAuthenticated]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);
    
    const fetchRecentOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await getCustomerOrders();
            // Get only the 3 most recent orders
            setRecentOrders((response.data || []).slice(0, 3));
        } catch (err) {
            console.error("Failed to fetch recent orders:", err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchProducts = async (cityName) => {
        setLoadingProducts(true);
        try {
            const response = await getProductsByCity(cityName);
            setProducts(response.data || []);
            setError('');
        } catch (err) {
            setError(`Failed to fetch products: ${err.response?.data?.message || err.message}`);
            setProducts([]); // Clear products on error
        } finally {
            setLoadingProducts(false);
        }
    };
    
    const fetchShops = async (cityName) => {
        setLoadingShops(true);
        try {
            const response = await getShopsByCity(cityName);
            setShops(response.data || []);
        } catch (err) {
            // Silently fail for shops or show a less prominent error
            console.error(`Failed to fetch shops: ${err.response?.data?.message || err.message}`);
            setShops([]);
        } finally {
            setLoadingShops(false);
        }
    };

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item.id === product.id);
            if (existingProduct) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };
    
    // Format date for recent orders
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    return (
        <motion.div 
            className="container mx-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Hero Section */}
            <motion.div 
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 shadow-sm"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome, {auth.name}!</h1>
                        <p className="text-lg mb-4 text-gray-600">Browsing fresh produce in <span className="font-semibold text-green-600">{auth.city || 'your area'}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                        <Link to="/cart" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                        </Link>
                        <Link to="/orders" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                            </svg>
                            My Orders
                        </Link>
                    </div>
                </div>
            </motion.div>

            {error && (
                <motion.div 
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                </motion.div>
            )}

            {/* Recent Orders Section */}
            <motion.section 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Recent Orders</h2>
                    <Link to="/orders" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
                
                {loadingOrders ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                        </div>
                        <p className="text-gray-500 mt-4">Loading your recent orders...</p>
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
                        <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start exploring our fresh produce!</p>
                        <Link to="/products" className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentOrders.map((order, index) => (
                            <motion.div 
                                key={order.id} 
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`p-5 ${
                                    order.status === 'Delivered' ? 'bg-gradient-to-r from-green-50 to-green-100' : 
                                    order.status === 'Cancelled' ? 'bg-gradient-to-r from-red-50 to-red-100' : 
                                    order.status === 'Shipped' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                                    order.status === 'Processing' ? 'bg-gradient-to-r from-purple-50 to-purple-100' :
                                    'bg-gradient-to-r from-yellow-50 to-yellow-100'
                                }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                            {order.status === 'Delivered' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            ) : order.status === 'Cancelled' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            ) : order.status === 'Shipped' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 10.414V5a1 1 0 10-2 0v7.414l3.293 3.293a1 1 0 001.414-1.414L11 12.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <h3 className="font-bold text-gray-800">Order #{order.id}</h3>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' : 
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' : 
                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                            order.status === 'Processing' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                                </div>
                                
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-lg font-bold text-gray-800">{formatCurrency(order.total_amount)}</p>
                                            <p className="text-sm text-gray-500">
                                                {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-gray-600">Delivery</span>
                                        </div>
                                    </div>
                                    
                                    {/* Order Items Preview */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-500 mb-2">Items:</h4>
                                            <div className="space-y-2">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <div key={idx} className="flex items-center">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                                            {item.category === 'Fruits' ? '🍎' : 
                                                             item.category === 'Vegetables' ? '🥦' : 
                                                             item.category === 'Dairy' ? '🥛' : '🌱'}
                                                        </div>
                                                        <div className="flex-1 truncate">
                                                            <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="text-xs text-gray-500 italic">+{order.items.length - 2} more items</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center">
                                        <Link 
                                            to="/orders" 
                                            className="text-primary hover:text-primary-dark font-medium text-sm flex items-center transition-colors duration-200"
                                        >
                                            View Details
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </Link>
                                        
                                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                            <Link 
                                                to={`/orders?highlight=${order.id}`}
                                                className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center transition-colors duration-200"
                                            >
                                                Cancel Order
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.section>

            {/* Shop by Category Section */}
            <motion.section 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Shop by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    <Link to="/products/category/Fruits" className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🍎</div>
                        <div className="font-medium">Fruits</div>
                    </Link>
                    <Link to="/products/category/Vegetables" className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🥦</div>
                        <div className="font-medium">Vegetables</div>
                    </Link>
                    <Link to="/products/category/Leafy Greens" className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🥬</div>
                        <div className="font-medium">Leafy Greens</div>
                    </Link>
                    <Link to="/products/category/Dairy" className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🥛</div>
                        <div className="font-medium">Dairy</div>
                    </Link>
                    <Link to="/products/category/Organic" className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🌱</div>
                        <div className="font-medium">Organic</div>
                    </Link>
                    <Link to="/products/category/Seasonal" className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🍓</div>
                        <div className="font-medium">Seasonal</div>
                    </Link>
                </div>
            </motion.section>
            
            {/* Local Shops Section */}
            <motion.section 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Local Shops in {auth.city || 'Your Area'}</h2>
                    <Link to="/shops" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
                
                {loadingShops ? (
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-gray-500">Loading shops...</p>
                    </div>
                ) : shops.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-600">No shops found in your area yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {shops.slice(0, 3).map(shop => (
                            <div key={shop.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-green-700 mb-2">{shop.name}</h3>
                                    <div className="flex items-center text-gray-600 mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{shop.city}</span>
                                    </div>
                                    <Link to={`/shops/${shop.id}`} className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
                                        View Products
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.section>
            
            {/* Featured Products Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-700">Featured Products</h2>
                    <Link to="/products" className="text-primary hover:text-primary-dark font-medium text-sm flex items-center">
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
                
                {loadingProducts ? (
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <p className="text-gray-500">Loading products...</p>
                    </div>
                ) : products.length === 0 && !error ? (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-600 mb-4">No products found in your area currently.</p>
                        <p className="text-gray-500">Check back later for fresh produce!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {products.slice(0, 4).map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow">
                                <img 
                                    src={product.image_url || `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${product.name.replace(/\s/g,'+')}`} 
                                    alt={product.name} 
                                    className="w-full h-48 object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/E2E8F0/A0AEC0?text=Image+Not+Found`; }}
                                />
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{product.name}</h3>
                                    <p className="text-md text-green-600 font-bold mb-2">{formatCurrency(product.price)}</p>
                                    <p className="text-sm text-gray-500 mb-3">From: {product.shop_name || 'Unknown Shop'}</p>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-auto w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out flex items-center justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.section>
        </motion.div>
    );
}

export default CustomerDashboard;
    