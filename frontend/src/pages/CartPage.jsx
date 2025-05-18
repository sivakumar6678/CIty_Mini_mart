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
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
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
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
                <p className="text-xl text-gray-600">Your cart is currently empty.</p>
                <Link to="/" className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Shopping Cart</h1>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
            {success && <p className="text-green-500 bg-green-100 p-3 rounded-md mb-4">{success}</p>}

            {cart.length > 0 && (
                <>
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        {cart.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <img 
                                        src={item.image_url || `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.replace(/\s/g,'+')}`} 
                                        alt={item.name} 
                                        className="w-20 h-20 object-cover rounded mr-4"
                                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=Error`; }}
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
                                        <p className="text-gray-600">{formatCurrency(item.price)} each</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded hover:bg-gray-100">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded hover:bg-gray-100">+</button>
                                </div>
                                <p className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 font-medium">Remove</button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Cart Total:</h2>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(cartTotal)}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button 
                                onClick={clearCart}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-150"
                            >
                                Clear Cart
                            </button>
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition duration-150 disabled:bg-gray-400"
                            >
                                {loading ? 'Placing Order...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </>
            )}
             {!success && cart.length === 0 && ( // Show this if cart became empty NOT due to successful order
                <div className="text-center mt-6">
                     <Link to="/" className="mt-4 inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Continue Shopping
                    </Link>
                </div>
            )}
        </div>
    );
}

export default CartPage;

    