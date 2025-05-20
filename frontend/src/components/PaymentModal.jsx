import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentSuccess, formatCurrency }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState('');
  const [cardType, setCardType] = useState('credit');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Mock function to simulate payment processing
  const processPayment = () => {
    setIsProcessing(true);
    setError('');
    
    // Validate form based on payment method
    if (paymentMethod === 'card') {
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
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., name@upi)');
        setIsProcessing(false);
        return;
      }
    } else if (paymentMethod === 'cod') {
      if (!deliveryAddress.trim()) {
        setError('Please confirm your delivery address for Cash on Delivery');
        setIsProcessing(false);
        return;
      }
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
          cardType: paymentMethod === 'card' ? cardType : null,
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
    setUpiId('');
    setDeliveryAddress('');
    setPaymentMethod('card');
    setCardType('credit');
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

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'card':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
      case 'upi':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        );
      case 'cod':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M6 10a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H6zm3 2a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v3a1 1 0 002 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="form-radio text-blue-600"
                    />
                    <div className="ml-2 flex items-center">
                      {getPaymentIcon('card')}
                      <span>Card</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="form-radio text-blue-600"
                    />
                    <div className="ml-2 flex items-center">
                      {getPaymentIcon('upi')}
                      <span>UPI</span>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="form-radio text-blue-600"
                    />
                    <div className="ml-2 flex items-center">
                      {getPaymentIcon('cod')}
                      <span>Cash on Delivery</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="flex space-x-4 mb-4">
                    <label className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${cardType === 'credit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="cardType"
                        value="credit"
                        checked={cardType === 'credit'}
                        onChange={() => setCardType('credit')}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-sm">Credit Card</span>
                    </label>
                    
                    <label className={`flex items-center p-2 border rounded-lg cursor-pointer transition-colors ${cardType === 'debit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="cardType"
                        value="debit"
                        checked={cardType === 'debit'}
                        onChange={() => setCardType('debit')}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2 text-sm">Debit Card</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center text-blue-700 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">UPI Payment</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Pay directly from your bank account using UPI ID.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="name@upi"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Example: yourname@okicici, yourname@okhdfc, etc.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <div key={app} className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {app}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cash on Delivery Form */}
              {paymentMethod === 'cod' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center text-yellow-700 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                      Pay with cash when your order is delivered. Additional fee of ₹40 applies.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Delivery Address</label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your full delivery address"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                    `Pay ${formatCurrency(paymentMethod === 'cod' ? amount + 40 : amount)}`
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