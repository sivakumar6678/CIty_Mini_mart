// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProductsByCity } from '../services/api';
import { AuthContext } from '../App'; // To manage cart
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';

function ProductsPage() {
    const { cityName } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { auth } = useContext(AuthContext); // Get auth context for cart link

    // Cart state and functions
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Add animation effect when component mounts
        setIsVisible(true);
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getProductsByCity(decodeURIComponent(cityName));
                console.log("Products response:", response.data);
                setProducts(response.data || []);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(`Failed to fetch products for ${decodeURIComponent(cityName)}: ${err.response?.data?.message || err.message}`);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        if (cityName) {
            fetchProducts();
        }
    }, [cityName]);

    const addToCart = (product) => {
        if (!auth.isAuthenticated || auth.role !== 'customer') {
            setNotification({
                show: true,
                message: "Please log in as a customer to add items to your cart.",
                type: 'error'
            });
            return;
        }
        
        setCart(prevCart => {
            const existingProduct = prevCart.find(item => item.id === product.id);
            if (existingProduct) {
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
        
        // Show notification
        setNotification({
            show: true,
            message: `${product.name} added to cart!`,
            type: 'success'
        });
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

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
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Products in <span className="text-primary">{decodeURIComponent(cityName)}</span>
                    </h1>
                    <p className="text-gray-600">Find fresh products from local shops in your area</p>
                </div>
                
                <div className="mt-4 md:mt-0 flex items-center">
                    {auth.isAuthenticated && auth.role === 'customer' && (
                        <Link to="/cart" className="cart-icon bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            View Cart
                            {cart.length > 0 && (
                                <motion.span 
                                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                >
                                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                </motion.span>
                            )}
                        </Link>
                    )}
                    <Link to="/" className="ml-4 text-primary hover:text-primary-dark font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <motion.div 
                            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-xl font-semibold text-primary mt-4">Loading products...</p>
                    </div>
                </div>
            )}
            
            {error && (
                <motion.div 
                    className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h2 className="text-xl font-bold text-red-700 mb-1">Error Loading Products</h2>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}
            
            {!loading && !error && products.length === 0 && (
                <motion.div 
                    className="bg-white shadow-lg rounded-xl p-8 text-center max-w-2xl mx-auto"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h2>
                    <p className="text-gray-600 mb-6">
                        No products found in {decodeURIComponent(cityName)} at the moment. Try another city or check back later!
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 inline-block">
                            Change City
                        </Link>
                    </motion.div>
                </motion.div>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            isCustomer={auth.isAuthenticated && auth.role === 'customer'}
                            formatCurrency={formatCurrency}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default ProductsPage;
    