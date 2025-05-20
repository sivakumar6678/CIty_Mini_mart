// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductsByCity, getProducts } from '../services/api';
import { AuthContext } from '../App'; // To manage cart
import ProductCard from '../components/ProductCard';
import Toast from '../components/Toast';

function ProductsPage({ filter }) {
    const { cityName, categoryName } = useParams();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const { auth } = useContext(AuthContext); // Get auth context for cart link
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [maxPrice, setMaxPrice] = useState(10000);

    // Cart state and functions
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Add animation effect when component mounts
        setIsVisible(true);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Dispatch custom event to notify other components (like Header) about cart updates
        window.dispatchEvent(new Event('cartUpdated'));
    }, [cart]);

    // Fetch products based on route parameters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                let response;
                
                if (cityName) {
                    // Fetch products by city
                    response = await getProductsByCity(decodeURIComponent(cityName));
                    console.log("Products by city response:", response.data);
                } else if (categoryName) {
                    // Fetch all products and filter by category
                    response = await getProducts();
                    response.data = response.data.filter(product => 
                        product.category && product.category.toLowerCase() === categoryName.toLowerCase()
                    );
                    console.log("Products by category response:", response.data);
                } else {
                    // Fetch all products
                    response = await getProducts();
                    console.log("All products response:", response.data);
                }
                
                const productsData = response.data || [];
                setProducts(productsData);
                
                // Extract available categories and max price
                const categories = [...new Set(productsData.map(product => product.category).filter(Boolean))];
                setAvailableCategories(categories);
                
                const highestPrice = Math.max(...productsData.map(product => product.price || 0), 0);
                setMaxPrice(highestPrice > 0 ? highestPrice : 10000);
                setPriceRange([0, highestPrice > 0 ? highestPrice : 10000]);
                
                // Apply initial filter if provided as prop
                if (filter === 'offers') {
                    setFilteredProducts(productsData.filter(product => product.discount_percentage > 0));
                } else if (filter === 'popular') {
                    setFilteredProducts([...productsData].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)));
                } else {
                    setFilteredProducts(productsData);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                const locationName = cityName ? `for ${decodeURIComponent(cityName)}` : 
                                    categoryName ? `in category ${categoryName}` : '';
                setError(`Failed to fetch products ${locationName}. Please try again later.`);
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [cityName, categoryName, filter]);

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
    
    // Apply filters to products
    const applyFilters = useCallback(() => {
        if (!products.length) return;
        
        let result = [...products];
        
        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(term) || 
                product.description.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                (product.shop_name && product.shop_name.toLowerCase().includes(term))
            );
        }
        
        // Apply category filter
        if (selectedCategories.length > 0) {
            result = result.filter(product => 
                selectedCategories.includes(product.category)
            );
        }
        
        // Apply price range filter
        result = result.filter(product => 
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );
        
        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'popular':
                result.sort((a, b) => b.sold_count - a.sold_count);
                break;
            case 'discount':
                result.sort((a, b) => b.discount_percentage - a.discount_percentage);
                break;
            case 'featured':
            default:
                // Keep original order or apply featured logic
                break;
        }
        
        setFilteredProducts(result);
    }, [products, searchTerm, selectedCategories, priceRange, sortBy]);
    
    // Apply filters when filter criteria change
    useEffect(() => {
        applyFilters();
    }, [applyFilters, searchTerm, selectedCategories, priceRange, sortBy]);
    
    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };
    
    const handlePriceChange = (e, index) => {
        const newRange = [...priceRange];
        newRange[index] = Number(e.target.value);
        setPriceRange(newRange);
    };
    
    const resetFilters = () => {
        setSearchTerm('');
        setPriceRange([0, maxPrice]);
        setSelectedCategories([]);
        setSortBy('featured');
    };
    
    // Get page title based on route
    const getPageTitle = () => {
        if (cityName) return `Products in ${decodeURIComponent(cityName)}`;
        if (categoryName) return `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Products`;
        if (filter === 'offers') return 'Special Offers';
        if (filter === 'popular') return 'Popular Products';
        return 'All Products';
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 mb-4 md:mb-0"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {getPageTitle()}
                </motion.h1>
                
                <div className="flex flex-wrap gap-3">
                    <motion.button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`${showFilters ? 'bg-primary text-white' : 'bg-white text-primary border border-primary'} font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm inline-flex items-center`}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </motion.button>
                    
                    {auth.isAuthenticated && auth.role === 'customer' && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Link to="/cart" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm inline-flex items-center relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
                        </motion.div>
                    )}
                </div>
            </div>
            
            {/* Filters Section */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="bg-white rounded-xl shadow-md p-5">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800">Filter Products</h2>
                                <button 
                                    onClick={resetFilters}
                                    className="text-primary hover:text-primary-dark text-sm font-medium"
                                >
                                    Reset Filters
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Search */}
                                <div>
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search products..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-600">
                                            <span>{formatCurrency(priceRange[0])}</span>
                                            <span>{formatCurrency(priceRange[1])}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={maxPrice}
                                            value={priceRange[0]}
                                            onChange={(e) => handlePriceChange(e, 0)}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max={maxPrice}
                                            value={priceRange[1]}
                                            onChange={(e) => handlePriceChange(e, 1)}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                                
                                {/* Categories */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {availableCategories.map(category => (
                                            <div key={category} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`category-${category}`}
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => handleCategoryToggle(category)}
                                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                />
                                                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                                                    {category}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Sort By */}
                                <div>
                                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        id="sortBy"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="newest">Newest First</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="discount">Biggest Discount</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between items-center">
                                <p className="text-sm text-gray-600">
                                    Showing {filteredProducts.length} of {products.length} products
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
            
            {!loading && !error && filteredProducts.length === 0 && (
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
                        {searchTerm || selectedCategories.length > 0 ? 
                            "No products match your current filters." : 
                            cityName ? 
                                `No products found in ${decodeURIComponent(cityName)} at the moment. Try another city or check back later!` :
                                "No products available at the moment. Please check back later!"
                        }
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {(searchTerm || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                            <motion.button
                                onClick={resetFilters}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Reset Filters
                            </motion.button>
                        )}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link to="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 inline-block">
                                Back to Home
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                        <ProductCard 
                            key={product.id}
                            product={product}
                            onAddToCart={() => addToCart(product)}
                            isCustomer={auth.isAuthenticated && auth.role === 'customer'}
                            formatCurrency={formatCurrency}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export default ProductsPage;
    