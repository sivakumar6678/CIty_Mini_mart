// frontend/src/pages/AddProductPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { addProduct, getMyShop } from '../services/api';
import { motion } from 'framer-motion';

function AddProductPage() {
    const { auth } = useContext(AuthContext);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('0');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopExists, setShopExists] = useState(false);
    const [checkingShop, setCheckingShop] = useState(true);
    const [previewImage, setPreviewImage] = useState('');
    const navigate = useNavigate();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                duration: 0.5
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    useEffect(() => {
        // Check if admin has a shop, as products are tied to a shop
        const checkShop = async () => {
            setCheckingShop(true);
            try {
                const response = await getMyShop(); // This API gets the admin's shop
                if (response.data && response.data.id) {
                    setShopExists(true);
                } else {
                    setShopExists(false);
                    setError("You need to create a shop before adding products.");
                }
            } catch (err) {
                setShopExists(false);
                if (err.response && err.response.status === 404) {
                    setError("You don't have a shop registered yet. Please create one first.");
                } else {
                    setError("Could not verify shop status. " + (err.response?.data?.message || err.message));
                }
            } finally {
                setCheckingShop(false);
            }
        };
        if (auth.role === 'admin') {
            checkShop();
        }
    }, [auth.role]);

    // Update preview image when imageUrl changes
    useEffect(() => {
        if (imageUrl) {
            setPreviewImage(imageUrl);
        } else if (productName) {
            // Generate a placeholder with the product name if no image URL is provided
            setPreviewImage(`https://placehold.co/600x400?text=${encodeURIComponent(productName)}`);
        } else {
            setPreviewImage('https://placehold.co/600x400?text=Product+Image');
        }
    }, [imageUrl, productName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName.trim() || !price) {
            setError("Product name and price are required.");
            return;
        }
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError("Price must be a positive number.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // The backend addProduct endpoint uses the logged-in admin's shop automatically
            await addProduct({ 
                name: productName, 
                price: numericPrice, 
                image_url: imageUrl,
                description: description,
                category: category,
                quantity: parseInt(quantity) || 0
            });
            setSuccess(`Product "${productName}" added successfully!`);
            // Clear form
            setProductName('');
            setPrice('');
            setImageUrl('');
            setDescription('');
            setCategory('');
            setQuantity('0');
            // Optionally navigate back to dashboard or product list after a delay
            setTimeout(() => {
                // navigate('/admin/dashboard'); // Or a page showing all products
                setSuccess(''); // Clear success message after some time if staying on page
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    if (checkingShop) {
        return (
            <div className="container mx-auto p-8 flex justify-center items-center min-h-[60vh]">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg text-gray-700 font-medium">Verifying shop status...</p>
                </motion.div>
            </div>
        );
    }

    if (!shopExists && !checkingShop) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto p-8 flex justify-center items-center min-h-[70vh]"
            >
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-red-50 p-6 border-b border-red-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-red-600 text-center">Shop Required</h1>
                    </div>
                    
                    <div className="p-6">
                        <p className="text-gray-700 mb-6 text-center">
                            {error || "You must have a registered shop to add products."}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link 
                                to="/admin/create-shop" 
                                className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Create Shop
                            </Link>
                            <Link 
                                to="/admin/dashboard" 
                                className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container mx-auto py-8 px-4"
        >
            <div className="max-w-6xl mx-auto">
                <motion.div variants={itemVariants} className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Product</h1>
                    <p className="text-gray-600">Expand your inventory with new products for your customers</p>
                </motion.div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Product Preview Section */}
                        <motion.div 
                            variants={itemVariants}
                            className="md:w-2/5 bg-gray-50 p-8 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Preview</h3>
                                <div className="aspect-w-1 aspect-h-1 mb-6">
                                    <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                                        <img 
                                            src={previewImage} 
                                            alt="Product preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-1">
                                        {productName || 'Product Name'}
                                    </h4>
                                    <p className="text-primary font-bold mb-2">
                                        {price ? `₹${price}` : '₹0.00'}
                                    </p>
                                    <p className="text-sm text-gray-500 line-clamp-3">
                                        {description || 'Product description will appear here...'}
                                    </p>
                                    {category && (
                                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-primary-light text-primary-dark rounded-full">
                                            {category}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <p className="text-sm text-gray-500">
                                    This is how your product will appear to customers. Fill out the form to update this preview.
                                </p>
                            </div>
                        </motion.div>

                        {/* Product Form Section */}
                        <motion.div variants={itemVariants} className="md:w-3/5 p-8">
                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-green-700">{success}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="productName"
                                            name="productName"
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary transition duration-200"
                                            placeholder="e.g., Fresh Organic Apples"
                                            value={productName}
                                            onChange={(e) => setProductName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                            Price (INR ₹) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">₹</span>
                                            </div>
                                            <input
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                required
                                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary transition duration-200"
                                                placeholder="e.g., 50.00"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary transition duration-200"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Fruits">🍎 Fruits</option>
                                            <option value="Vegetables">🥦 Vegetables</option>
                                            <option value="Leafy Greens">🥬 Leafy Greens</option>
                                            <option value="Dairy">🥛 Dairy</option>
                                            <option value="Organic">🌱 Organic</option>
                                            <option value="Seasonal">🍓 Seasonal</option>
                                            <option value="Bakery">🍞 Bakery</option>
                                            <option value="Meat">🥩 Meat</option>
                                            <option value="Seafood">🐟 Seafood</option>
                                            <option value="Pantry">🥫 Pantry</option>
                                            <option value="Beverages">🥤 Beverages</option>
                                            <option value="Snacks">🍿 Snacks</option>
                                            <option value="Household">🧹 Household</option>
                                            <option value="Personal Care">🧴 Personal Care</option>
                                            <option value="Other">📦 Other</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                            Quantity in Stock
                                        </label>
                                        <input
                                            id="quantity"
                                            name="quantity"
                                            type="number"
                                            min="0"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary transition duration-200"
                                            placeholder="e.g., 100"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary transition duration-200"
                                            placeholder="Describe your product..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                            Image URL
                                        </label>
                                        <input
                                            id="imageUrl"
                                            name="imageUrl"
                                            type="url"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary transition duration-200"
                                            placeholder="https://example.com/image.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                        <p className="mt-2 text-xs text-gray-500 flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Leave empty to use a placeholder image based on product name
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center disabled:bg-gray-400"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Adding Product...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                Add Product
                                            </>
                                        )}
                                    </button>
                                    <Link 
                                        to="/admin/dashboard" 
                                        className="flex-1 sm:flex-initial border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                        </svg>
                                        Back to Dashboard
                                    </Link>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default AddProductPage;
    