// frontend/src/pages/CartPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { placeOrder } from '../services/api';
import CartItem from '../components/CartItem';
import Toast from '../components/Toast';
import PaymentModal from '../components/PaymentModal';

function CartPage() {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Dispatch custom event to notify other components (like Header) about cart updates
        window.dispatchEvent(new Event('cartUpdated'));
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
        
        // Show notification
        setNotification({
            show: true,
            message: "Item removed from cart",
            type: 'info'
        });
    };

    const clearCart = () => {
        setCart([]);
        
        // Show notification
        setNotification({
            show: true,
            message: "Cart has been cleared",
            type: 'info'
        });
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleCheckout = () => {
        if (!auth.isAuthenticated) {
            setError("Please login to place an order.");
            navigate('/login');
            return;
        }
        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        // Open payment modal
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async (paymentDetails) => {
        setLoading(true);
        setError('');
        setSuccess('');
        setIsPaymentModalOpen(false);

        const orderItems = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        try {
            // Include payment details with the order
            const response = await placeOrder({ 
                items: orderItems,
                payment: {
                    transaction_id: paymentDetails.transactionId,
                    method: paymentDetails.method,
                    amount: paymentDetails.amount
                }
            });
            
            setSuccess(`Order placed successfully! Order ID: ${response.data.order_id}. Total: ${formatCurrency(response.data.total_amount)}`);
            clearCart(); // Clear cart from state and localStorage
            
            // Show success notification
            setNotification({
                show: true,
                message: "Payment successful! Your order has been placed.",
                type: 'success'
            });
            
            // Redirect to orders page after a delay
            setTimeout(() => navigate('/orders'), 3000);
        } catch (err) {
            console.error("Error placing order:", err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
            
            // Show error notification
            setNotification({
                show: true,
                message: "Failed to place order. Please try again.",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    if (cart.length === 0 && !success) {
        return (
            <motion.div 
                className="container mx-auto p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="bg-white shadow-lg rounded-xl p-8 max-w-2xl mx-auto"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 24 }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h1>
                    <p className="text-xl text-gray-600 mb-8">Add some products to your cart and start shopping!</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                            Browse Products
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        );
    }

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
            
            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={cartTotal}
                onPaymentSuccess={handlePaymentSuccess}
                formatCurrency={formatCurrency}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Your Shopping Cart
                </motion.h1>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link to="/" className="text-primary hover:text-primary-dark font-medium flex items-center mt-2 md:mt-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Continue Shopping
                    </Link>
                </motion.div>
            </div>
            
            {error && (
                <motion.div 
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                </motion.div>
            )}
            
            {success && (
                <motion.div 
                    className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md mb-6"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                    <p className="text-sm text-green-600 mt-2">Redirecting to your orders...</p>
                </motion.div>
            )}

            {cart.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div 
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5">
                                <h2 className="text-xl font-bold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    Cart Items ({cart.length})
                                </h2>
                            </div>
                            <div className="p-6">
                                <AnimatePresence>
                                    {cart.map((item, index) => (
                                        <CartItem 
                                            key={item.id}
                                            item={item}
                                            updateQuantity={updateQuantity}
                                            removeFromCart={removeFromCart}
                                            formatCurrency={formatCurrency}
                                            index={index}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        className="lg:col-span-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="bg-white shadow-lg rounded-xl overflow-hidden sticky top-20">
                            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5">
                                <h2 className="text-xl font-bold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                                    </svg>
                                    Order Summary
                                </h2>
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
                                    <motion.button 
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 flex items-center justify-center"
                                        whileHover={{ scale: loading ? 1 : 1.03 }}
                                        whileTap={{ scale: loading ? 1 : 0.97 }}
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
                                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                                </svg>
                                                Proceed to Checkout
                                            </>
                                        )}
                                    </motion.button>
                                    
                                    <motion.button 
                                        onClick={clearCart}
                                        className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Clear Cart
                                    </motion.button>
                                </div>
                                
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Secure Checkout</h3>
                                    <p className="text-xs text-gray-600">
                                        We accept all major credit cards and digital payment methods. Your transaction is secure and encrypted.
                                    </p>
                                    <div className="flex items-center justify-center mt-3 space-x-2">
                                        <span className="text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </span>
                                        <span className="text-xs text-gray-500">Secure Payment</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {!success && cart.length === 0 && ( // Show this if cart became empty NOT due to successful order
                <div className="text-center mt-6">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link to="/" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                            Browse Products
                        </Link>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}

export default CartPage;

    