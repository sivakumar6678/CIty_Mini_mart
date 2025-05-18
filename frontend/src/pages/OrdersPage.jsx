// frontend/src/pages/OrdersPage.jsx (Customer's Order History)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getCustomerOrders } from '../services/api';

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
            setOrders(response.data || []);
        } catch (err) {
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
        return <div className="container mx-auto p-4 text-center">Loading your orders...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">My Orders</h1>
                <p className="text-xl text-gray-600">You haven't placed any orders yet.</p>
                <Link to="/" className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h1>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b">
                            <div>
                                <h2 className="text-xl font-semibold text-green-700">Order ID: #{order.id}</h2>
                                <p className="text-sm text-gray-500">Placed on: {formatDate(order.created_at)}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                <p className="text-lg font-bold text-gray-800">Total: {formatCurrency(order.total_amount)}</p>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    Status: {order.status}
                                </span>
                            </div>
                        </div>
                        
                        <h3 className="text-md font-semibold text-gray-700 mb-2">Items in this order:</h3>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            {order.items && order.items.map(item => (
                                <li key={item.product_id} className="text-gray-600">
                                    {item.name} (x{item.quantity}) - {formatCurrency(item.price * item.quantity)}
                                    {/* You might want to fetch shop name if product.shop_id is available and needed */}
                                </li>
                            ))}
                        </ul>
                         {(!order.items || order.items.length === 0) && <p className="text-gray-500">Item details not available for this order.</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OrdersPage;
    