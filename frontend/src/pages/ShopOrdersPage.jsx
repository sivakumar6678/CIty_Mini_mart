// frontend/src/pages/ShopOrdersPage.jsx (Admin's view of their shop orders)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';
import { getShopOrders, getMyShop, updateOrderStatus } from '../services/api';
import ShopOrderCard from '../components/ShopOrderCard';
import Toast from '../components/Toast';

function ShopOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.isAuthenticated && auth.role === 'admin') {
            fetchShopAndOrders();
        } else {
            setLoading(false);
            setError("Access denied. Please login as an admin.");
        }
    }, [auth]);

    const fetchShopAndOrders = async () => {
        setLoading(true);
        setError('');
        try {
            // First, get the admin's shop details
            const shopResponse = await getMyShop();
            setShop(shopResponse.data);

            if (shopResponse.data && shopResponse.data.id) {
                // Then, fetch orders for that shop
                const ordersResponse = await getShopOrders(); // API should correctly filter by admin's shop
                setOrders(ordersResponse.data || []);
            } else {
                setError("No shop found for this admin. Cannot fetch orders.");
                setOrders([]);
            }
        } catch (err) {
            setError(`Failed to fetch shop orders: ${err.response?.data?.message || err.message}`);
            setOrders([]);
            if (err.response?.status === 404 && err.response?.data?.message.includes("Admin does not have a shop")) {
                 setError("You don't have a shop registered yet. Please create one to see orders.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            // Call API to update order status
            await updateOrderStatus(orderId, newStatus);
            
            // Update local state
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            
            // Show success notification
            setNotification({
                show: true,
                message: `Order #${orderId} status updated to ${newStatus}`,
                type: 'success'
            });
            
            return true;
        } catch (err) {
            console.error("Error updating order status:", err);
            
            // Show error notification
            setNotification({
                show: true,
                message: `Failed to update order status: ${err.response?.data?.message || err.message}`,
                type: 'error'
            });
            
            return false;
        }
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
                    <p className="text-xl font-semibold text-primary mt-4">Loading shop orders...</p>
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
                    className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl max-w-2xl mx-auto shadow-lg"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h2 className="text-xl font-bold text-red-700 mb-1">Error</h2>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        {error.includes("don't have a shop") && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/admin/create-shop" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                                    Create Your Shop
                                </Link>
                            </motion.div>
                        )}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/admin/dashboard" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                                Back to Dashboard
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }
    
    if (!shop && !loading) {
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">No Shop Found</h1>
                    <p className="text-xl text-gray-600 mb-8">Please create a shop first to view orders.</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/admin/create-shop" className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                            Create Your Shop
                        </Link>
                    </motion.div>
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
                <motion.h1 
                    className="text-3xl font-bold mb-6 text-gray-800"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Orders for {shop?.name || 'Your Shop'}
                </motion.h1>
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
                    <p className="text-xl text-gray-600 mb-8">No orders found for your shop yet.</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/admin/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                            Back to Dashboard
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
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 mb-4 md:mb-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Orders for {shop?.name || 'Your Shop'}
                </motion.h1>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link to="/admin/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </motion.div>
            </div>
            
            <div className="space-y-8">
                {orders.map((order, index) => (
                    <ShopOrderCard 
                        key={order.id}
                        order={order}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        onUpdateStatus={handleUpdateOrderStatus}
                        index={index}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export default ShopOrdersPage;
    