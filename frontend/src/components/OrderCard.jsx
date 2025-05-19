import React from 'react';
import { motion } from 'framer-motion';

const OrderCard = ({ order, formatCurrency, formatDate, index }) => {
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

  return (
    <motion.div 
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5">
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
          <div className="mt-2 sm:mt-0">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Order Items</h3>
        
        {order.items && order.items.length > 0 ? (
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.product_id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-4 shadow-sm">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
                      />
                    ) : (
                      <span className="text-gray-500 font-bold">{item.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Item details not available for this order.</p>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-700">Total Amount:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
          </div>
          
          {/* Delivery information */}
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Delivery Information</h4>
            <div className="text-sm text-gray-600">
              <p>Estimated delivery: {order.status === 'Delivered' ? 'Delivered' : 'Within 2-3 days'}</p>
              {order.delivery_address && <p>Address: {order.delivery_address}</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;