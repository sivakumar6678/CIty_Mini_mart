// frontend/src/pages/EditProductPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';
import { getMyShop, getProductsByShop, updateProduct } from '../services/api';
import Toast from '../components/Toast';
import { calculateDiscountedPrice, formatCurrency } from '../utils/priceUtils';

function EditProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        quantity: '',
        image_url: '',
        category: 'Vegetables',
        description: '',
        discount_percentage: 0,
        featured: false
    });

    useEffect(() => {
        if (!auth.isAuthenticated || auth.role !== 'admin') {
            navigate('/login');
            return;
        }
        
        fetchProduct();
    }, [productId, auth, navigate]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            // First, get the shop details
            const shopResponse = await getMyShop();
            const shop = shopResponse.data;
            
            if (!shop || !shop.id) {
                setError('No shop found. Please create a shop first.');
                setLoading(false);
                return;
            }
            
            // Now fetch products for this shop
            const response = await getProductsByShop(shop.id);
            const products = response.data || [];
            const foundProduct = products.find(p => p.id === parseInt(productId));
            
            if (foundProduct) {
                setProduct(foundProduct);
                setFormData({
                    name: foundProduct.name || '',
                    price: foundProduct.price || '',
                    quantity: foundProduct.quantity || 0,
                    image_url: foundProduct.image_url || '',
                    category: foundProduct.category || 'Vegetables',
                    description: foundProduct.description || '',
                    discount_percentage: foundProduct.discount_percentage || 0,
                    featured: foundProduct.featured || false
                });
            } else {
                setError('Product not found');
            }
        } catch (err) {
            setError(`Failed to fetch product: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        let parsedValue;
        
        if (name === 'price') {
            parsedValue = value === '' ? '' : parseFloat(value);
        } else {
            parsedValue = value === '' ? '' : parseInt(value);
        }
        
        setFormData({
            ...formData,
            [name]: parsedValue
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            setNotification({
                show: true,
                message: 'Product name is required',
                type: 'error'
            });
            return;
        }
        
        if (formData.price <= 0) {
            setNotification({
                show: true,
                message: 'Price must be greater than zero',
                type: 'error'
            });
            return;
        }
        
        if (formData.quantity < 0) {
            setNotification({
                show: true,
                message: 'Quantity cannot be negative',
                type: 'error'
            });
            return;
        }
        
        setSaving(true);
        try {
            const response = await updateProduct(productId, formData);
            
            setNotification({
                show: true,
                message: 'Product updated successfully',
                type: 'success'
            });
            
            // Navigate back to products page after a short delay
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (err) {
            setError(`Failed to update product: ${err.response?.data?.message || err.message}`);
            setNotification({
                show: true,
                message: `Failed to update product: ${err.response?.data?.message || err.message}`,
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    // Using imported formatCurrency function from utils

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <motion.div 
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="ml-4 text-xl font-semibold text-primary">Loading product...</p>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h2 className="text-xl font-bold text-red-700 mb-1">Error</h2>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Link to="/admin/products" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Back to Products
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <Toast 
                message={notification.message}
                type={notification.type}
                show={notification.show}
                onClose={closeNotification}
            />
            
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
                <Link to="/admin/products" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Products
                </Link>
            </div>
            
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleNumberChange}
                                    min="0.01"
                                    step="0.01"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleNumberChange}
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                >
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Bakery">Bakery</option>
                                    <option value="Meat">Meat</option>
                                    <option value="Seafood">Seafood</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Household">Household</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    id="image_url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    id="discount_percentage"
                                    name="discount_percentage"
                                    value={formData.discount_percentage}
                                    onChange={handleNumberChange}
                                    min="0"
                                    max="90"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                />
                                {formData.discount_percentage > 0 && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-md">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 line-through">
                                                {formatCurrency(formData.price)}
                                            </span>
                                            <span className="text-sm font-semibold text-green-600">
                                                {formatCurrency(calculateDiscountedPrice(formData.price, formData.discount_percentage))}
                                            </span>
                                        </div>
                                        <div className="text-xs text-green-600 mt-1 text-right">
                                            Customer saves {formatCurrency(formData.price - calculateDiscountedPrice(formData.price, formData.discount_percentage))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                ></textarea>
                            </div>
                            
                            <div className="col-span-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                                        Feature this product on homepage
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        {formData.image_url && (
                            <div className="mt-6 p-4 border border-gray-200 rounded-md">
                                <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
                                <img 
                                    src={formData.image_url} 
                                    alt={formData.name} 
                                    className="h-40 object-contain mx-auto"
                                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x300/E2E8F0/A0AEC0?text=Image+Not+Found`; }}
                                />
                            </div>
                        )}
                        
                        <div className="mt-8 flex justify-end space-x-3">
                            <Link 
                                to="/admin/products" 
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Link>
                            
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditProductPage;