import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cancelOrder } from '../services/api';

const OrderCard = ({ order, formatCurrency, formatDate, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
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

  const handleBuyAgain = (item) => {
    // This would typically add the item to cart
    console.log('Buy again:', item);
    // Show a toast notification
    alert(`${item.name} added to cart!`);
  };

  const handleCancelOrder = () => {
    setShowCancelConfirm(true);
  };

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const confirmCancelOrder = async () => {
    setCancelLoading(true);
    setCancelError('');
    try {
      // Call the API to cancel the order
      const response = await cancelOrder(order.id);
      console.log('Order cancelled successfully:', response);
      
      // Update the order status locally
      order.status = 'Cancelled';
      
      // Close the modal
      setShowCancelConfirm(false);
      
      // Show a success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50';
      successMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="h-6 w-6 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <p><strong>Success!</strong> Order #${order.id} has been cancelled.</p>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Remove the message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
      // Refresh the page to show updated order status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setCancelError(error.response?.data?.message || 'Failed to cancel order. Please try again.');
      
      // Show an error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50';
      errorMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p><strong>Error!</strong> ${error.response?.data?.message || 'Failed to cancel order. Please try again.'}</p>
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      // Remove the message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleTrackOrder = () => {
    setShowTrackingModal(true);
  };

  // Calculate estimated delivery date
  const getEstimatedDelivery = () => {
    if (order.status === 'Delivered') return 'Delivered';
    if (order.status === 'Cancelled') return 'Order Cancelled';
    
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
      className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      layout
    >
      {/* Order Header - Modern Design with Status Indicator */}
      <div className="relative">
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          order.status === 'Delivered' ? 'bg-green-500' : 
          order.status === 'Cancelled' ? 'bg-red-500' : 
          order.status === 'Shipped' ? 'bg-blue-500' :
          order.status === 'Processing' ? 'bg-purple-500' :
          'bg-yellow-500'
        }`}></div>
        
        <div 
          className="p-6 cursor-pointer hover:bg-gray-50 transition-all duration-300"
          onClick={toggleExpand}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Left Section - Order Info */}
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                order.status === 'Processing' ? 'bg-purple-100 text-purple-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                {getStatusIcon(order.status)}
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-800">Order #{order.id}</h2>
                  <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  Placed on: {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            
            {/* Right Section - Price and Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(order.total_amount)}</p>
                <p className="text-sm text-gray-500">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Order Timeline - Horizontal Flow */}
          <div className="mt-6">
            <div className="relative">
              {/* Horizontal connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 z-0"></div>
              
              {/* Status steps */}
              <div className="grid grid-cols-4 relative z-10">
                {/* Order Placed */}
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${
                    order.status !== 'Cancelled' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {order.status !== 'Cancelled' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>1</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-600">Order Placed</p>
                </div>
                
                {/* Processing */}
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${
                    (order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered') 
                      ? 'bg-green-500 text-white' 
                      : order.status === 'Cancelled' 
                        ? 'bg-gray-200 text-gray-400' 
                        : 'bg-blue-500 text-white animate-pulse'
                  }`}>
                    {(order.status === 'Processing' || order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>2</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-600">Processing</p>
                </div>
                
                {/* Shipped */}
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${
                    (order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered') 
                      ? 'bg-green-500 text-white' 
                      : order.status === 'Processing' 
                        ? 'bg-blue-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {(order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>3</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-600">Shipped</p>
                </div>
                
                {/* Delivered */}
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 ${
                    order.status === 'Delivered' 
                      ? 'bg-green-500 text-white' 
                      : order.status === 'Out for Delivery' 
                        ? 'bg-blue-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-400'
                  }`}>
                    {order.status === 'Delivered' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>4</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-600">Delivered</p>
                </div>
              </div>
            </div>
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
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              {/* Expected Delivery */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Delivery</p>
                      <p className="text-lg font-bold text-gray-800">{getEstimatedDelivery()}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Order Progress</p>
                    <p className="text-lg font-bold text-primary">{getProgressPercentage()}% Complete</p>
                  </div>
                </div>
              </div>
              
              {/* Order Items - Card Style */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Order Items
                </h3>
                
                {order.items && order.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map(item => (
                      <motion.div 
                        key={item.product_id} 
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex p-4">
                          <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center mr-4 overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <img 
                                src={item.image_url} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-2xl font-bold text-gray-500">{item.name.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                              <p className="font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                            <div className="mt-1 flex justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Qty: <span className="font-medium">{item.quantity}</span></p>
                                <p className="text-xs text-gray-500 mt-1">From: {item.shop_name || 'Unknown Shop'}</p>
                              </div>
                              <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                            </div>
                            <div className="mt-3">
                              <motion.button 
                                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBuyAgain(item)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                Buy Again
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500">Item details not available for this order.</p>
                  </div>
                )}
              </div>
              
              {/* Order Details - Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                    </svg>
                    Order Summary
                  </h3>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Order ID</span>
                        <span className="font-medium text-gray-800">#{order.id}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Order Date</span>
                        <span className="font-medium text-gray-800">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Items</span>
                        <span className="font-medium text-gray-800">{order.items?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-800">{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium text-gray-800">Included</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Delivery Information
                  </h3>
                  <div className="bg-white p-5 rounded-lg shadow-sm">
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="text-gray-500 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Delivery Address
                      </p>
                      <p className="font-medium text-gray-800">
                        {order.delivery_address ? 
                          (typeof order.delivery_address === 'object' ? 
                            `${order.delivery_address.full_name}, ${order.delivery_address.street_address}, ${order.delivery_address.city}, ${order.delivery_address.state} ${order.delivery_address.postal_code}` 
                            : order.delivery_address)
                          : 'Address not available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Contact Information
                      </p>
                      <p className="font-medium text-gray-800">
                        {order.customer_phone ? 
                          (typeof order.customer_phone === 'object' ? 
                            order.customer_phone.number || JSON.stringify(order.customer_phone) 
                            : order.customer_phone)
                          : 'Phone not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3 justify-end">
                <motion.button 
                  className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium flex items-center shadow-sm"
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Need Help
                </motion.button>
                
                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <motion.button 
                    className="px-5 py-2.5 bg-red-50 border border-red-300 rounded-lg text-red-700 hover:bg-red-100 text-sm font-medium flex items-center shadow-sm"
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCancelOrder}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Cancel Order
                  </motion.button>
                )}
                
                <motion.button 
                  className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium flex items-center shadow-sm"
                  whileHover={{ scale: 1.03, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleTrackOrder}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Track Order
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Tracking Modal */}
      <AnimatePresence>
        {showTrackingModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTrackingModal(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-primary text-white p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Track Order #{order.id}</h3>
                  <button onClick={() => setShowTrackingModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 font-medium">{order.status}</span>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(order.status)}`}>
                      {getProgressPercentage()}% Complete
                    </span>
                  </div>
                  
                  <div className="relative">
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
                  
                  <div className="space-y-6 mt-8">
                    <div className="flex">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${order.status !== 'Cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">Order Placed</h4>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${getProgressPercentage() >= 25 && order.status !== 'Cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {getProgressPercentage() >= 25 && order.status !== 'Cancelled' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white">2</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Processing</h4>
                        <p className="text-sm text-gray-500">Your order is being prepared</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${getProgressPercentage() >= 50 && order.status !== 'Cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {getProgressPercentage() >= 50 && order.status !== 'Cancelled' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white">3</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Shipped</h4>
                        <p className="text-sm text-gray-500">Your order is on the way</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${getProgressPercentage() >= 75 && order.status !== 'Cancelled' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {getProgressPercentage() >= 75 && order.status !== 'Cancelled' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white">4</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Out for Delivery</h4>
                        <p className="text-sm text-gray-500">Your order will be delivered soon</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center mr-3 ${getProgressPercentage() >= 100 ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                        {getProgressPercentage() >= 100 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white">5</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">Delivered</h4>
                        <p className="text-sm text-gray-500">Expected by {getEstimatedDelivery()}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <motion.button
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark text-sm font-medium"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowTrackingModal(false)}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-red-500 text-white p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Cancel Order</h3>
                  <button onClick={() => setShowCancelConfirm(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">Are you sure?</h4>
                    <p className="text-gray-600">This action cannot be undone. Order #{order.id} will be cancelled.</p>
                  </div>
                </div>
                
                {cancelError && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {cancelError}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelLoading}
                  >
                    No, Keep Order
                  </motion.button>
                  <motion.button
                    className={`px-4 py-2 ${cancelLoading ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'} text-white rounded-md text-sm font-medium flex items-center justify-center min-w-[120px]`}
                    whileHover={cancelLoading ? {} : { scale: 1.03 }}
                    whileTap={cancelLoading ? {} : { scale: 0.97 }}
                    onClick={confirmCancelOrder}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Yes, Cancel Order'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCard;