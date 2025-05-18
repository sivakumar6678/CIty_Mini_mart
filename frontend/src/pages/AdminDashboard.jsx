// frontend/src/pages/AdminDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getMyShop, getProductsByShop, deleteProduct, getShopOrders } from '../services/api'; // Assuming API functions

function AdminDashboard() {
    const { auth } = useContext(AuthContext);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loadingShop, setLoadingShop] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchShopDetails();
    }, []);

    useEffect(() => {
        if (shop && shop.id) {
            fetchShopProducts(shop.id);
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

    const fetchShopProducts = async (shopId) => {
        setLoadingProducts(true);
        try {
            const response = await getProductsByShop(shopId);
            setProducts(response.data || []);
        } catch (err) {
            setError(`Failed to fetch products: ${err.response?.data?.message || err.message}`);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
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


    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
            } catch (err) {
                setError(`Failed to delete product: ${err.response?.data?.message || err.message}`);
            }
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
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Manage Products</h2>
                        <Link to="/admin/add-product" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
                            + Add New Product
                        </Link>
                        {loadingProducts && <p>Loading products...</p>}
                        {!loadingProducts && products.length === 0 && <p className="text-gray-500">You have no products yet. Add some!</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                    <img 
                                        src={product.image_url || `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${product.name.replace(/\s/g,'+')}`} 
                                        alt={product.name} 
                                        className="w-full h-48 object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/E2E8F0/A0AEC0?text=Image+Not+Found`; }}
                                    />
                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                                        <p className="text-md text-green-600 font-bold">{formatCurrency(product.price)}</p>
                                        <div className="mt-4 space-x-2">
                                            {/* <Link to={`/admin/edit-product/${product.id}`} className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded">Edit</Link> */}
                                            <button 
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
    