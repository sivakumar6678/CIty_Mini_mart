// frontend/src/pages/ManageProductsPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getMyShop, getProductsByShop, deleteProduct } from '../services/api';
import { motion } from 'framer-motion';
import Toast from '../components/Toast';

function ManageProductsPage() {
    const { auth } = useContext(AuthContext);
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingShop, setLoadingShop] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchShopDetails();
    }, []);

    useEffect(() => {
        if (shop && shop.id) {
            fetchShopProducts(shop.id);
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

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteProduct(productId);
                setProducts(products.filter(p => p.id !== productId));
                setNotification({
                    show: true,
                    message: 'Product deleted successfully',
                    type: 'success'
                });
            } catch (err) {
                setError(`Failed to delete product: ${err.response?.data?.message || err.message}`);
                setNotification({
                    show: true,
                    message: `Failed to delete product: ${err.response?.data?.message || err.message}`,
                    type: 'error'
                });
            }
        }
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    if (loadingShop) {
        return (
            <div className="text-center p-10">
                <motion.div 
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-xl font-semibold text-primary mt-4">Loading shop details...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Toast Notification */}
            <Toast 
                message={notification.message}
                type={notification.type}
                show={notification.show}
                onClose={closeNotification}
            />

            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Products</h1>
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
                </div>
            )}

            {shop && (
                <div className="mb-8">
                    <div className="flex flex-wrap gap-3 mb-4">
                        <Link to="/admin/add-product" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
                            + Add New Product
                        </Link>
                        <Link to="/admin/manage-offers" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded inline-block">
                            Manage Offers
                        </Link>
                        <Link to="/admin/dashboard" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-block">
                            Back to Dashboard
                        </Link>
                    </div>
                    {loadingProducts && (
                        <div className="text-center p-10">
                            <motion.div 
                                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <p className="text-lg text-blue-500 mt-4">Loading products...</p>
                        </div>
                    )}
                    {!loadingProducts && products.length === 0 && (
                        <div className="text-center p-10 bg-gray-50 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-xl text-gray-500 mt-4">You have no products yet.</p>
                            <Link to="/admin/add-product" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Add Your First Product
                            </Link>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <motion.div 
                                key={product.id} 
                                className="bg-white rounded-lg shadow-lg overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <img 
                                    src={product.image_url || `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${product.name.replace(/\s/g,'+')}`} 
                                    alt={product.name} 
                                    className="w-full h-48 object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/E2E8F0/A0AEC0?text=Image+Not+Found`; }}
                                />
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-md text-green-600 font-bold">{formatCurrency(product.price)}</p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Stock:</span> {product.quantity || 'N/A'}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        <Link to={`/admin/edit-product/${product.id}`} className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded">
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageProductsPage;