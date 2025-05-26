// frontend/src/pages/AdminDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getMyShop, getShopOrders } from '../services/api'; // Removed product-related imports

function AdminDashboard() {
    const { auth } = useContext(AuthContext);
    const [shop, setShop] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingShop, setLoadingShop] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchShopDetails();
    }, []);

    useEffect(() => {
        if (shop && shop.id) {
            fetchShopOrders(); // Fetch orders when shop details are available
        }
    }, [shop]);

    const fetchShopDetails = async () => {
        setLoadingShop(true);
        setError('');
        try {
            const response = await getMyShop();
            setShop(response.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('No shop found. Please create your shop.');
            } else {
                setError(`Failed to fetch shop details: ${err.response?.data?.message || err.message}`);
            }
            setShop(null);
        } finally {
            setLoadingShop(false);
        }
    };

    const fetchShopOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await getShopOrders(); // API should handle getting orders for the admin's shop
            setOrders(response.data || []);
        } catch (err) {
            setError(`Failed to fetch orders: ${err.response?.data?.message || err.message}`);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    if (loadingShop) {
        return <div className="text-center p-10">Loading shop details...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            {!shop && !loadingShop && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Shop Not Found</p>
                    <p>You haven't registered a shop yet. Please create one to start adding products.</p>
                    <Link to="/admin/create-shop" className="mt-2 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Create Your Shop
                    </Link>
                </div>
            )}

            {shop && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-2">{shop.name}</h2>
                    <p className="text-gray-600">City: {shop.city}</p>
                    <p className="text-gray-600">Owner: {auth.name}</p>
                    {/* Add edit shop details link/button here if needed */}
                </div>
            )}

            {shop && (
                <>
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Shop Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6 flex flex-col items-center text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Products</h3>
                                    <p className="text-gray-600 mb-4">Manage your shop's products inventory</p>
                                    <Link to="/admin/products" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block w-full">
                                        Manage Products
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6 flex flex-col items-center text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-2.6.9l-.7.7a4 4 0 00-.9 2.6V8m12 0V6a4 4 0 00-4-4h-.8a4 4 0 00-2.6.9l-.7.7a4 4 0 00-.9 2.6V8" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Offers</h3>
                                    <p className="text-gray-600 mb-4">Create and manage special offers</p>
                                    <Link to="/admin/manage-offers" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded inline-block w-full">
                                        Manage Offers
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6 flex flex-col items-center text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Add Product</h3>
                                    <p className="text-gray-600 mb-4">Add new products to your inventory</p>
                                    <Link to="/admin/add-product" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block w-full">
                                        Add New Product
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Shop Orders</h2>
                         <Link to="/admin/shop-orders" className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
                            View All Shop Orders
                        </Link>
                        {/* Basic display, can be expanded on ShopOrdersPage */}
                        {loadingOrders && <p>Loading orders...</p>}
                        {!loadingOrders && orders.length === 0 && <p className="text-gray-500">No orders for your shop yet.</p>}
                        {!loadingOrders && orders.length > 0 && (
                            <p className="text-gray-600">You have {orders.length} order(s) involving your shop. Click the button above for details.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default AdminDashboard;
    