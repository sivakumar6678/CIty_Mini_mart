// frontend/src/pages/ProductsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductsByCity } from '../services/api';
import { AuthContext } from '../App'; // To manage cart

function ProductsPage() {
    const { cityName } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { auth } = useContext(AuthContext); // Get auth context for cart link

    // Cart state and functions (similar to CustomerDashboard)
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getProductsByCity(decodeURIComponent(cityName));
                setProducts(response.data || []);
            } catch (err) {
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
            alert("Please log in as a customer to add items to your cart.");
            // Consider redirecting to login or showing a modal
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
         // Simple feedback
        alert(`${product.name} added to cart!`);
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Products in <span className="text-green-600">{decodeURIComponent(cityName)}</span>
                </h1>
                {auth.isAuthenticated && auth.role === 'customer' && (
                     <Link to="/cart" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </Link>
                )}
            </div>

            {loading && <p className="text-center text-gray-600">Loading products...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            
            {!loading && !error && products.length === 0 && (
                <p className="text-center text-gray-500 text-xl">
                    No products found in {decodeURIComponent(cityName)} at the moment. Try another city or check back later!
                </p>
            )}

            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <img 
                                src={product.image_url || `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${product.name.replace(/\s/g,'+')}`} 
                                alt={product.name} 
                                className="w-full h-48 object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/E2E8F0/A0AEC0?text=Image+Not+Found`; }}
                            />
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="text-xl font-semibold text-gray-800 mb-1">{product.name}</h3>
                                <p className="text-md text-green-600 font-bold mb-2">{formatCurrency(product.price)}</p>
                                <p className="text-sm text-gray-500 mb-3">From: {product.shop_name || 'Unknown Shop'}</p>
                                { (auth.isAuthenticated && auth.role === 'customer') ? (
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
                                    >
                                        Add to Cart
                                    </button>
                                ) : (
                                     <Link 
                                        to="/login"
                                        className="mt-auto text-center w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
                                    >
                                        Login to Add
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <div className="mt-8 text-center">
                <Link to="/" className="text-green-600 hover:text-green-800 font-semibold">
                    &larr; Back to Home / Change City
                </Link>
            </div>
        </div>
    );
}

export default ProductsPage;
    