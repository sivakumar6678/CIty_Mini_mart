import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderCard = ({ order, formatCurrency, formatDate, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Function to determine status badge color
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'Shipped':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        );
      case 'Out for Delivery':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        );
      case 'Processing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'Pending':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    if (order.status === 'Delivered') return 'Delivered';
    
    const orderDate = new Date(order.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 3); // Assuming 3 days for delivery
    
    return formatDate(estimatedDate);
  };

  // Get progress percentage based on status
  const getProgressPercentage = () => {
    switch(order.status) {
      case 'Delivered': return 100;
      case 'Out for Delivery': return 75;
      case 'Shipped': return 50;
      case 'Processing': return 25;
      case 'Pending': return 10;
      case 'Cancelled': return 0;
      default: return 0;
    }
  };

  return (
    <motion.div 
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      layout
    >
      <div 
        className="bg-gradient-to-r from-primary to-primary-dark text-white p-5 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Order #{order.id}
            </h2>
            <p className="text-white text-opacity-90 text-sm mt-1">
              Placed on: {formatDate(order.created_at)}
            </p>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col items-end">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
            <p className="text-white text-opacity-90 text-sm mt-1">
              {formatCurrency(order.total_amount)}
            </p>
            <motion.div 
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-gray-200">
              {/* Order Progress */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Order Progress</h3>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary bg-opacity-10">
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary">
                        {getProgressPercentage()}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <motion.div 
                      style={{ width: `${getProgressPercentage()}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage()}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 text-sm text-gray-600">Current Status: <span className="font-medium">{order.status}</span></span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Expected Delivery: <span className="font-medium">{getEstimatedDelivery()}</span>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Order Items</h3>
              
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.product_id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4 shadow-sm">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name} 
                              className="w-14 h-14 object-cover rounded"
                              onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
                            />
                          ) : (
                            <span className="text-gray-500 font-bold">{item.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-xs text-gray-500">Shop: {item.shop_name || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                        <motion.button 
                          className="text-xs text-primary hover:text-primary-dark mt-1 flex items-center justify-end w-full"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                          </svg>
                          Buy Again
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Item details not available for this order.</p>
              )}
              
              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-700">Total</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Delivery Information */}
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Delivery Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                      <p className="text-sm font-medium text-gray-800">
                        {order.delivery_address || 'Address not available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact Information</p>
                      <p className="text-sm font-medium text-gray-800">
                        {order.customer_phone || 'Phone not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <motion.button 
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Need Help
                </motion.button>
                
                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <motion.button 
                    className="px-4 py-2 bg-red-50 border border-red-300 rounded-md text-red-700 hover:bg-red-100 text-sm font-medium"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancel Order
                  </motion.button>
                )}
                
                <motion.button 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Track Order
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCard;