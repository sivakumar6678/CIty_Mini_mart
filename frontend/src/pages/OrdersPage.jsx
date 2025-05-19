// frontend/src/pages/OrdersPage.jsx (Customer's Order History)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';
import { getCustomerOrders } from '../services/api';
import OrderCard from '../components/OrderCard';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        if (auth.isAuthenticated && auth.role === 'customer') {
            fetchOrders();
        } else {
            setLoading(false);
            setError("Please login to view your orders.");
        }
    }, [auth]);

    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getCustomerOrders();
            console.log("Orders response:", response.data);
            setOrders(response.data || []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(`Failed to fetch orders: ${err.response?.data?.message || err.message}`);
            setOrders([]);
        } finally {
            setLoading(false);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 mb-4 md:mb-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    My Orders
                </motion.h1>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        Continue Shopping
                    </Link>
                </motion.div>
            </div>
            
            <div className="space-y-8">
                {orders.map((order, index) => (
                    <OrderCard 
                        key={order.id}
                        order={order}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        index={index}
                    />
                ))}
            </div>
        </motion.div>
    );
}

export default OrdersPage;
    