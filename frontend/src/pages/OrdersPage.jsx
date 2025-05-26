// frontend/src/pages/OrdersPage.jsx (Customer's Order History)
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { getCustomerOrders } from '../services/api';
import OrderCard from '../components/OrderCard';
import CustomerAnalytics from '../components/CustomerAnalytics';
import Toast from '../components/Toast';

function OrdersPage() {
    const location = useLocation();
    const highlightOrderId = new URLSearchParams(location.search).get('highlight');
    const highlightedOrderRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.isAuthenticated && auth.role === 'customer') {
            fetchOrders();
        } else {
            setLoading(false);
            setError("Please login to view your orders.");
        }
    }, [auth]);

    useEffect(() => {
        if (orders.length > 0) {
            applyFiltersAndSort();
        }
    }, [orders, filterStatus, sortBy, searchTerm]);
    
    // Effect to scroll to highlighted order
    useEffect(() => {
        if (highlightOrderId && highlightedOrderRef.current) {
            // Scroll to the highlighted order with a smooth animation
            highlightedOrderRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            // Add a highlight animation
            highlightedOrderRef.current.classList.add('highlight-pulse');
            
            // Remove the highlight after animation completes
            setTimeout(() => {
                if (highlightedOrderRef.current) {
                    highlightedOrderRef.current.classList.remove('highlight-pulse');
                }
            }, 3000);
        }
    }, [highlightOrderId, filteredOrders]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getCustomerOrders();
            console.log("Orders response:", response.data);
            setOrders(response.data || []);
            setFilteredOrders(response.data || []);
            // Show success notification when refreshing
            if (refreshing) {
                setNotification({
                    show: true,
                    message: 'Orders refreshed successfully!',
                    type: 'success'
                });
                setRefreshing(false);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(`Failed to fetch orders: ${err.response?.data?.message || err.message}`);
            setOrders([]);
            setFilteredOrders([]);
            // Show error notification when refreshing
            if (refreshing) {
                setNotification({
                    show: true,
                    message: `Failed to refresh orders: ${err.response?.data?.message || err.message}`,
                    type: 'error'
                });
                setRefreshing(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshOrders = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const applyFiltersAndSort = useCallback(() => {
        let result = [...orders];
        
        // Apply status filter
        if (filterStatus !== 'all') {
            result = result.filter(order => order.status === filterStatus);
        }
        
        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(order => {
                // Search by order ID
                if (order.id.toString().includes(term)) return true;
                
                // Search by product name
                if (order.items && order.items.some(item => 
                    item.name.toLowerCase().includes(term)
                )) return true;
                
                // Search by shop name
                if (order.items && order.items.some(item => 
                    item.shop_name && item.shop_name.toLowerCase().includes(term)
                )) return true;
                
                // Search by status
                if (order.status.toLowerCase().includes(term)) return true;
                
                // Search by date
                if (formatDate(order.created_at).toLowerCase().includes(term)) return true;
                
                return false;
            });
        }
        
        // Apply sorting
        switch (sortBy) {
            case 'date-desc':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'date-asc':
                result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'amount-desc':
                result.sort((a, b) => b.total_amount - a.total_amount);
                break;
            case 'amount-asc':
                result.sort((a, b) => a.total_amount - b.total_amount);
                break;
            default:
                break;
        }
        
        setFilteredOrders(result);
    }, [orders, filterStatus, sortBy, searchTerm]);

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const toggleAnalytics = () => {
        setShowAnalytics(!showAnalytics);
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };
    
    const handleStatusFilterChange = (status) => {
        setFilterStatus(status);
        // Scroll to top when filter changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <motion.div 
                        className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-xl font-semibold text-primary mt-4">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <motion.div 
                className="container mx-auto p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md max-w-2xl mx-auto"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h2 className="text-xl font-bold text-red-700 mb-1">Unable to Load Orders</h2>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3 justify-center">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <button 
                                onClick={refreshOrders}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                Try Again
                            </button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Return to Home
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    if (orders.length === 0) {
        return (
            <motion.div 
                className="container mx-auto p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 24 }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">No Orders Yet</h1>
                    <p className="text-xl text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                            Start Shopping
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="container mx-auto p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Toast Notification */}
            <Toast 
                message={notification.message}
                type={notification.type}
                show={notification.show}
                onClose={closeNotification}
            />
            
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-primary-light to-blue-50 rounded-2xl shadow-md p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
                        <p className="text-gray-600">Track and manage all your purchases</p>
                    </motion.div>
                    
                    <motion.div
                        className="flex flex-wrap gap-3 mt-4 md:mt-0"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                    <motion.button
                        onClick={refreshOrders}
                        className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 px-5 rounded-lg transition-all duration-200 text-sm inline-flex items-center shadow-sm"
                        whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.97 }}
                        disabled={refreshing}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {refreshing ? 'Refreshing...' : 'Refresh Orders'}
                    </motion.button>
                    
                    <motion.button
                        onClick={toggleAnalytics}
                        className={`${showAnalytics ? 'bg-primary text-white' : 'bg-white text-primary border border-primary'} font-medium py-2.5 px-5 rounded-lg transition-all duration-200 text-sm inline-flex items-center shadow-sm`}
                        whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </motion.button>
                    
                    <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 text-sm inline-flex items-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Continue Shopping
                    </Link>
                </motion.div>
            </div>
            </div>
            
            {/* Order Stats - Horizontal Flow */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                    </svg>
                    Order Status Flow
                </h2>
                
                <div className="flex flex-wrap justify-between items-center mb-6">
                    <div className="flex items-center mb-2 md:mb-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-xl font-bold text-gray-800">{orders.length}</p>
                        </div>
                    </div>
                    
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm text-gray-600">Completed: {orders.filter(order => order.status === 'Delivered').length}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-sm text-gray-600">In Progress: {orders.filter(order => ['Pending', 'Processing', 'Shipped', 'Out for Delivery'].includes(order.status)).length}</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm text-gray-600">Cancelled: {orders.filter(order => order.status === 'Cancelled').length}</span>
                        </div>
                    </div>
                </div>
                
                {/* Order Process Flow */}
                <div className="relative">
                    <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                        {/* Order Placed */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-2 border-white shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-800">Order Placed</p>
                                <p className="text-sm text-gray-500">{orders.filter(order => order.status === 'Pending').length} orders</p>
                            </div>
                        </div>
                        
                        {/* Processing */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2 border-2 border-white shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-800">Processing</p>
                                <p className="text-sm text-gray-500">{orders.filter(order => order.status === 'Processing').length} orders</p>
                            </div>
                        </div>
                        
                        {/* Shipped */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2 border-2 border-white shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-800">Shipped</p>
                                <p className="text-sm text-gray-500">{orders.filter(order => order.status === 'Shipped').length} orders</p>
                            </div>
                        </div>
                        
                        {/* Out for Delivery */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-2 border-2 border-white shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-800">Out for Delivery</p>
                                <p className="text-sm text-gray-500">{orders.filter(order => order.status === 'Out for Delivery').length} orders</p>
                            </div>
                        </div>
                        
                        {/* Delivered */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2 border-2 border-white shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-gray-800">Delivered</p>
                                <p className="text-sm text-gray-500">{orders.filter(order => order.status === 'Delivered').length} orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Analytics Section */}
            <AnimatePresence>
                {showAnalytics && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 overflow-hidden"
                    >
                        <CustomerAnalytics 
                            orders={orders} 
                            formatCurrency={formatCurrency} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Filters and Search */}
            <motion.div 
                className="bg-white rounded-xl shadow-md p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    Filter Orders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-sm"
                                placeholder="Search by order ID, product, shop, or status"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <div className="relative">
                            <select
                                id="filterStatus"
                                className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary text-sm rounded-lg appearance-none"
                                value={filterStatus}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                            >
                                <option value="all">All Orders</option>
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <div className="relative">
                            <select
                                id="sortBy"
                                className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary text-sm rounded-lg appearance-none"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="amount-desc">Highest Amount</option>
                                <option value="amount-asc">Lowest Amount</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-primary">{filteredOrders.length}</span> of <span className="font-semibold">{orders.length}</span> orders
                    </p>
                    
                    {/* Status Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilterChange('all')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                filterStatus === 'all' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => handleStatusFilterChange('Pending')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                filterStatus === 'Pending' 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => handleStatusFilterChange('Processing')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                filterStatus === 'Processing' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            }`}
                        >
                            Processing
                        </button>
                        <button
                            onClick={() => handleStatusFilterChange('Shipped')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                filterStatus === 'Shipped' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                        >
                            Shipped
                        </button>
                        <button
                            onClick={() => handleStatusFilterChange('Delivered')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                filterStatus === 'Delivered' 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                            Delivered
                        </button>
                        <button
                            onClick={() => handleStatusFilterChange('Cancelled')}
                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                filterStatus === 'Cancelled' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                            Cancelled
                        </button>
                    </div>
                    
                    {(filterStatus !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilterStatus('all');
                                setSearchTerm('');
                            }}
                            className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Clear Filters
                        </button>
                    )}
                </div>
            </motion.div>
            
            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <motion.div 
                    className="bg-white rounded-xl shadow-md p-8 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h2>
                    <p className="text-gray-600 mb-4">No orders match your current filters.</p>
                    <button
                        onClick={() => {
                            setFilterStatus('all');
                            setSearchTerm('');
                        }}
                        className="text-primary hover:text-primary-dark font-medium"
                    >
                        Clear Filters
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-8">
                    {filteredOrders.map((order, index) => (
                        <div 
                            key={order.id} 
                            ref={highlightOrderId && order.id.toString() === highlightOrderId ? highlightedOrderRef : null}
                            className={highlightOrderId && order.id.toString() === highlightOrderId ? 'relative highlight-pulse rounded-lg' : ''}
                        >
                            <OrderCard 
                                order={order}
                                formatCurrency={formatCurrency}
                                formatDate={formatDate}
                                index={index}
                            />
                        </div>
                    ))}
                </div>
            )}
            
            {/* Back to Top Button */}
            <motion.button
                className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary-dark transition-colors duration-200"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </motion.button>
        </motion.div>
    );
}

export default OrdersPage;
    