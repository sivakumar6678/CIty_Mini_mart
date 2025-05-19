// frontend/src/pages/OrdersPage.jsx (Customer's Order History)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getCustomerOrders } from '../services/api';

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        // Add animation effect when component mounts
        setIsVisible(true);
        
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
                    <div className="loading-spinner mb-4"></div>
                    <p className="text-xl font-semibold text-primary">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`container mx-auto p-8 text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md max-w-2xl mx-auto">
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
                        <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className={`container mx-auto p-8 text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">No Orders Yet</h1>
                    <p className="text-xl text-gray-600 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                    <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`container mx-auto p-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                    Continue Shopping
                </Link>
            </div>
            
            <div className="space-y-8">
                {orders.map((order, index) => (
                    <div 
                        key={order.id} 
                        className={`bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-500 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <h2 className="text-xl font-bold">Order #{order.id}</h2>
                                    <p className="text-white text-opacity-80 text-sm">Placed on: {formatDate(order.created_at)}</p>
                                </div>
                                <div className="mt-2 sm:mt-0">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Order Items</h3>
                            
                            {order.items && order.items.length > 0 ? (
                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.product_id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                                                    {item.image_url ? (
                                                        <img 
                                                            src={item.image_url} 
                                                            alt={item.name} 
                                                            className="w-10 h-10 object-cover rounded"
                                                            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-500 font-bold">{item.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                                                <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Item details not available for this order.</p>
                            )}
                            
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-700">Total Amount:</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrdersPage;
    