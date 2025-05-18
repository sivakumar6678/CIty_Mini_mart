// frontend/src/pages/ShopOrdersPage.jsx (Admin's view of their shop orders)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getShopOrders, getMyShop } from '../services/api';

function ShopOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
        return <div className="container mx-auto p-4 text-center">Loading shop orders...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
                {error.includes("don't have a shop") && (
                    <Link to="/admin/create-shop" className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Create Your Shop
                    </Link>
                )}
                 <Link to="/admin/dashboard" className="mt-4 ml-2 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Back to Dashboard
                </Link>
            </div>
        );
    }
    
    if (!shop && !loading) {
         return (
            <div className="container mx-auto p-4 text-center">
                <p className="text-xl text-gray-600">Please create a shop first to view orders.</p>
                <Link to="/admin/create-shop" className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Create Your Shop
                </Link>
            </div>
        );
    }


    if (orders.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Orders for {shop?.name || 'Your Shop'}</h1>
                <p className="text-xl text-gray-600">No orders found for your shop yet.</p>
                <Link to="/admin/dashboard" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Orders for {shop?.name || 'Your Shop'}</h1>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b">
                            <div>
                                <h2 className="text-xl font-semibold text-blue-700">Order ID: #{order.id}</h2>
                                <p className="text-sm text-gray-500">Placed on: {formatDate(order.created_at)}</p>
                                <p className="text-sm text-gray-600">Customer: {order.customer_name} (ID: {order.customer_id}, City: {order.customer_city})</p>
                            </div>
                            <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                <p className="text-lg font-bold text-gray-800">Shop's Share: {formatCurrency(order.shop_specific_total_amount)}</p>
                                <p className="text-sm text-gray-500">Order Total: {formatCurrency(order.total_amount)}</p>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    Status: {order.status}
                                </span>
                                {/* TODO: Add functionality to update order status */}
                            </div>
                        </div>
                        
                        <h3 className="text-md font-semibold text-gray-700 mb-2">Items from your shop in this order:</h3>
                        {order.items_for_this_shop && order.items_for_this_shop.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 pl-2">
                                {order.items_for_this_shop.map(item => (
                                    <li key={item.product_id} className="text-gray-600">
                                        {item.name} (x{item.quantity}) - {formatCurrency(item.price * item.quantity)}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No items from your shop in this order (this might indicate an issue if shop_specific_total_amount is not 0).</p>
                        )}
                    </div>
                ))}
            </div>
             <div className="mt-8">
                <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">
                    &larr; Back to Admin Dashboard
                </Link>
            </div>
        </div>
    );
}

export default ShopOrdersPage;
    