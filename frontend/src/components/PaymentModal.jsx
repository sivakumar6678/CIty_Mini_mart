import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess, formatCurrency }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [error, setError] = useState('');

  // Mock function to simulate payment processing
  const processPayment = () => {
    setIsProcessing(true);
    setError('');
    
    // Validate form
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      setError('Please fill in all card details');
      setIsProcessing(false);
      return;
    }
    
    // Simple validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Card number must be 16 digits');
      setIsProcessing(false);
      return;
    }
    
    if (cardCvv.length < 3) {
      setError('Invalid CVV');
      setIsProcessing(false);
      return;
    }
    
    // Simulate API call to payment gateway
    setTimeout(() => {
      // 90% success rate for demo purposes
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        // Payment successful
        onPaymentSuccess({
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          amount: amount,
          method: paymentMethod,
          timestamp: new Date().toISOString()
        });
        resetForm();
      } else {
        // Payment failed
        setError('Payment failed. Please try again or use a different payment method.');
      }
      setIsProcessing(false);
    }, 2000);
  };
  
  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvv('');
    setPaymentMethod('card');
    setError('');
  };
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };
  
  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };
  
  // Handle expiry date input
  const handleExpiryChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setCardExpiry(formattedValue);
  };
  
  // Close modal and reset form
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Close modal on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6">
              <h2 className="text-2xl font-bold">Complete Your Payment</h2>
              <p className="text-white text-opacity-90 mt-1">
                Amount to pay: {formatCurrency(amount)}
              </p>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Payment Method</h3>
                <div className="flex space-x-4">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Credit Card</span>
                  </label>
                  
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'wallet' ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="form-radio text-primary"
                    />
                    <span className="ml-2">Wallet</span>
                  </label>
                </div>
              </div>
              
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'wallet' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">Pay using your wallet balance.</p>
                  <p className="text-sm text-gray-500 mt-1">Your current balance: {formatCurrency(5000)}</p>
                </div>
              )}
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                
                <motion.button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  whileHover={{ scale: isProcessing ? 1 : 1.03 }}
                  whileTap={{ scale: isProcessing ? 1 : 0.97 }}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatCurrency(amount)}`
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;