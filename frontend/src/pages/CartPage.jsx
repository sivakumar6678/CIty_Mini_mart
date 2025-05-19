// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { placeOrder } from '../services/api';

function CartPage() {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Add animation effect when component mounts
        setIsVisible(true);
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        if (!auth.isAuthenticated) {
            setError("Please login to place an order.");
            navigate('/login');
            return;
        }
        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const orderItems = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        try {
            const response = await placeOrder({ items: orderItems });
            setSuccess(`Order placed successfully! Order ID: ${response.data.order_id}. Total: ${formatCurrency(response.data.total_amount)}`);
            clearCart(); // Clear cart from state and localStorage
            // Optionally redirect to an order confirmation page or orders history
            setTimeout(() => navigate('/orders'), 3000);
        } catch (err) {
            console.error("Error placing order:", err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    if (cart.length === 0 && !success) {
        return (
            <div className={`container mx-auto p-8 text-center transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h1>
                    <p className="text-xl text-gray-600 mb-8">Add some products to your cart and start shopping!</p>
                    <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`container mx-auto p-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
                <Link to="/" className="text-primary hover:text-primary-dark font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Continue Shopping
                </Link>
            </div>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </div>
            )}
            
            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                    <p className="text-sm text-green-600 mt-2">Redirecting to your orders...</p>
                </div>
            )}

            {cart.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                                <h2 className="text-xl font-bold">Cart Items</h2>
                            </div>
                            <div className="p-6">
                                {cart.map((item, index) => (
                                    <div 
                                        key={item.id} 
                                        className={`flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0 transition-all duration-300 delay-${index * 100} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                    >
                                        <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
                                            <div className="relative">
                                                <img 
                                                    src={item.image_url || `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`} 
                                                    alt={item.name} 
                                                    className="w-20 h-20 object-cover rounded-md mr-4"
                                                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
                                                />
                                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-gray-600">{formatCurrency(item.price)} each</p>
                                                {item.shop_name && <p className="text-xs text-gray-500">From: {item.shop_name}</p>}
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                            <div className="flex items-center space-x-2 border rounded-lg overflow-hidden">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 py-1 font-medium">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            
                                            <div className="text-right min-w-[100px]">
                                                <p className="font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                            
                                            <button 
                                                onClick={() => removeFromCart(item.id)} 
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Remove item"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden sticky top-20">
                            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4">
                                <h2 className="text-xl font-bold">Order Summary</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(cartTotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-bold">Total</span>
                                            <span className="text-xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <button 
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                Place Order
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={clearCart}
                                        className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                                
                                <div className="mt-6 text-center text-sm text-gray-500">
                                    <p>Need help? Contact our support team</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {!success && cart.length === 0 && ( // Show this if cart became empty NOT due to successful order
                <div className="text-center mt-6">
                    <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                        Browse Products
                    </Link>
                </div>
            )}
        </div>
    );
}

export default CartPage;

    