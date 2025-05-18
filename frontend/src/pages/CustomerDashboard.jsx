// frontend/src/pages/CustomerDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { getProductsByCity, getShopsByCity } from '../services/api';

function CustomerDashboard() {
    const { auth } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingShops, setLoadingShops] = useState(true);
    const [error, setError] = useState('');
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        if (auth.city) {
            fetchProducts(auth.city);
            fetchShops(auth.city);
        }
    }, [auth.city]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const fetchProducts = async (cityName) => {
        setLoadingProducts(true);
        try {
            const response = await getProductsByCity(cityName);
            setProducts(response.data || []);
            setError('');
        } catch (err) {
            setError(`Failed to fetch products: ${err.response?.data?.message || err.message}`);
            setProducts([]); // Clear products on error
        } finally {
            setLoadingProducts(false);
        }
    };
    
    const fetchShops = async (cityName) => {
        setLoadingShops(true);
        try {
            const response = await getShopsByCity(cityName);
            setShops(response.data || []);
        } catch (err) {
            // Silently fail for shops or show a less prominent error
            console.error(`Failed to fetch shops: ${err.response?.data?.message || err.message}`);
            setShops([]);
        } finally {
            setLoadingShops(false);
        }
    };

    const addToCart = (product) => {
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
    };
    
    // Function to format currency
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome, {auth.name}!</h1>
            <p className="text-lg mb-2 text-gray-600">Browsing fresh fruits and vegetables in <span className="font-semibold text-green-600">{auth.city}</span>.</p>
            <div className="mb-6">
                <Link to="/cart" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4">
                    View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </Link>
                 <Link to="/orders" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                    My Orders
                </Link>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Shops in {auth.city}</h2>
                {loadingShops && <p>Loading shops...</p>}
                {!loadingShops && shops.length === 0 && <p className="text-gray-500">No shops found in your city yet.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shops.map(shop => (
                        <div key={shop.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-semibold text-green-700">{shop.name}</h3>
                            <p className="text-gray-600">{shop.city}</p>
                            {/* Future: Link to shop-specific product page */}
                        </div>
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Products Available</h2>
                {loadingProducts && <p>Loading products...</p>}
                {!loadingProducts && products.length === 0 && !error && <p className="text-gray-500">No products found in your city currently. Check back later!</p>}
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
                                <button
                                    onClick={() => addToCart(product)}
                                    className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default CustomerDashboard;
    