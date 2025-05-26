import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopOrderCard = ({ order, formatCurrency, formatDate, onUpdateStatus, index }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.status);
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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-gradient-to-r from-primary to-primary-dark text-white cursor-pointer"
        onClick={toggleExpand}
      >
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
            Customer: {order.customer_name}
          </p>
        </div>
        <div className="mt-3 sm:mt-0 text-right flex flex-col items-end">
          <p className="text-lg font-bold text-white">{formatCurrency(order.shop_specific_total_amount)}</p>
          <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(order.status)}`}>
            {order.status}
          </span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">ORDER DETAILS</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        order.status === 'Delivered' ? 'text-green-600' : 
                        order.status === 'Cancelled' ? 'text-red-600' : 'text-blue-600'
                      }`}>{order.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment:</span>
                      <span className="font-medium text-green-600">Completed</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">CUSTOMER INFORMATION</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{order.customer_id}</span>
                    </div>
                    {order.customer_city && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{order.customer_city}</span>
                      </div>
                    )}
                    {order.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{order.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <h3 className="text-md font-semibold text-gray-700 mb-3">Items from your shop in this order:</h3>
              
              {order.items_for_this_shop && order.items_for_this_shop.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty Ordered
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items_for_this_shop.map(item => (
                        <tr key={item.product_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                {item.image_url ? (
                                  <img 
                                    src={item.image_url} 
                                    alt={item.name} 
                                    className="h-8 w-8 object-cover rounded"
                                    onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
                                  />
                                ) : (
                                  <span className="text-gray-500 font-bold">{item.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">ID: {item.product_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatCurrency(item.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block text-center min-w-[40px]">{item.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                          Subtotal:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.shop_specific_total_amount)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                          Order Total (including other shops):
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        No items from your shop in this order (this might indicate an issue if shop_specific_total_amount is not 0).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Order Status Update Section */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
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
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className={`p-3 rounded-md border ${order.status === 'Pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'Pending' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${order.status === 'Pending' ? 'text-yellow-700' : 'text-gray-500'}`}>Pending</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border ${order.status === 'Processing' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'Processing' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${order.status === 'Processing' ? 'text-purple-700' : 'text-gray-500'}`}>Processing</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border ${order.status === 'Shipped' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'Shipped' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${order.status === 'Shipped' ? 'text-blue-700' : 'text-gray-500'}`}>Shipped</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border ${order.status === 'Out for Delivery' ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'Out for Delivery' ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${order.status === 'Out for Delivery' ? 'text-indigo-700' : 'text-gray-500'}`}>Out for Delivery</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border ${order.status === 'Delivered' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${order.status === 'Delivered' ? 'text-green-700' : 'text-gray-500'}`}>Delivered</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-md border ${order.status === 'Cancelled' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm font-medium ${order.status === 'Cancelled' ? 'text-red-700' : 'text-gray-500'}`}>Cancelled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ShopOrderCard;