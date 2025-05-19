import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ShopOrderCard = ({ order, formatCurrency, formatDate, onUpdateStatus, index }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);

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

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus !== order.status) {
      setIsUpdating(true);
      try {
        await onUpdateStatus(order.id, selectedStatus);
        // Status updated successfully
      } catch (error) {
        // Handle error
        console.error("Failed to update order status:", error);
        setSelectedStatus(order.status); // Reset to original status
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <motion.div 
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gradient-to-r from-primary to-primary-dark text-white">
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
          <p className="text-white text-opacity-90 text-sm">
            Customer: {order.customer_name} (ID: {order.customer_id})
          </p>
          {order.customer_city && (
            <p className="text-white text-opacity-90 text-sm">
              City: {order.customer_city}
            </p>
          )}
        </div>
        <div className="mt-3 sm:mt-0 text-right">
          <p className="text-lg font-bold text-white">Shop's Share: {formatCurrency(order.shop_specific_total_amount)}</p>
          <p className="text-sm text-white text-opacity-80">Order Total: {formatCurrency(order.total_amount)}</p>
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Items from your shop in this order:</h3>
        
        {order.items_for_this_shop && order.items_for_this_shop.length > 0 ? (
          <div className="space-y-3">
            {order.items_for_this_shop.map(item => (
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
          <p className="text-gray-500 italic">No items from your shop in this order (this might indicate an issue if shop_specific_total_amount is not 0).</p>
        )}
        
        {/* Order Status Update Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">Update Order Status</h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select 
              value={selectedStatus} 
              onChange={handleStatusChange}
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
            <motion.button
              onClick={handleUpdateStatus}
              disabled={isUpdating || selectedStatus === order.status}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                selectedStatus === order.status 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-dark'
              }`}
              whileHover={{ scale: selectedStatus !== order.status ? 1.03 : 1 }}
              whileTap={{ scale: selectedStatus !== order.status ? 0.97 : 1 }}
            >
              {isUpdating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Status'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopOrderCard;