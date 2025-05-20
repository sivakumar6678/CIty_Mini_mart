// frontend/src/pages/OrdersPage.jsx (Customer's Order History)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { getCustomerOrders } from '../services/api';
import OrderCard from '../components/OrderCard';
import CustomerAnalytics from '../components/CustomerAnalytics';
import Toast from '../components/Toast';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchTerm, setSearchTerm] = useState('');
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

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getCustomerOrders();
            console.log("Orders response:", response.data);
            setOrders(response.data || []);
            setFilteredOrders(response.data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(`Failed to fetch orders: ${err.response?.data?.message || err.message}`);
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
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
    };

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
                    <div className="mt-6">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
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
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 mb-4 md:mb-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    My Orders
                </motion.h1>
                <motion.div
                    className="flex flex-wrap gap-3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.button
                        onClick={toggleAnalytics}
                        className={`${showAnalytics ? 'bg-primary text-white' : 'bg-white text-primary border border-primary'} font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm inline-flex items-center`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
                        </svg>
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </motion.button>
                    
                    <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        Continue Shopping
                    </Link>
                </motion.div>
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
                className="bg-white rounded-xl shadow-md p-5 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                id="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Search by order ID, product, or shop"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select
                            id="filterStatus"
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Orders</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                        <select
                            id="sortBy"
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="amount-desc">Highest Amount</option>
                            <option value="amount-asc">Lowest Amount</option>
                        </select>
                    </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </p>
                    
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
                        <OrderCard 
                            key={order.id}
                            order={order}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default OrdersPage;
    