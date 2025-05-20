import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomerAnalytics = ({ orders, formatCurrency }) => {
  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    orderCount: 0,
    averageOrderValue: 0,
    mostOrderedProducts: [],
    recentOrders: [],
    ordersByStatus: {},
    spendingByMonth: []
  });

  useEffect(() => {
    if (orders && orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders]);

  const calculateAnalytics = () => {
    // Total spent
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Order count
    const orderCount = orders.length;
    
    // Average order value
    const averageOrderValue = totalSpent / orderCount;
    
    // Orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    // Most ordered products
    const productCounts = {};
    orders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          if (!productCounts[item.product_id]) {
            productCounts[item.product_id] = {
              id: item.product_id,
              name: item.name,
              count: 0,
              totalQuantity: 0,
              image_url: item.image_url
            };
          }
          productCounts[item.product_id].count += 1;
          productCounts[item.product_id].totalQuantity += item.quantity;
        });
      }
    });
    
    const mostOrderedProducts = Object.values(productCounts)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 3);
    
    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
    
    // Spending by month
    const spendingByMonth = {};
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      spendingByMonth[monthYear] = (spendingByMonth[monthYear] || 0) + order.total_amount;
    });
    
    const spendingByMonthArray = Object.entries(spendingByMonth).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/');
      const [bMonth, bYear] = b.month.split('/');
      return new Date(bYear, bMonth - 1) - new Date(aYear, aMonth - 1);
    }).slice(0, 6).reverse();
    
    setAnalytics({
      totalSpent,
      orderCount,
      averageOrderValue,
      mostOrderedProducts,
      recentOrders,
      ordersByStatus,
      spendingByMonth: spendingByMonthArray
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-500';
      case 'Shipped': return 'bg-blue-500';
      case 'Out for Delivery': return 'bg-indigo-500';
      case 'Processing': return 'bg-purple-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaxSpending = () => {
    if (analytics.spendingByMonth.length === 0) return 0;
    return Math.max(...analytics.spendingByMonth.map(item => item.amount));
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-5">
        <h2 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
          </svg>
          Your Shopping Analytics
        </h2>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-500 font-medium">Total Spent</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(analytics.totalSpent)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
            <p className="text-sm text-green-500 font-medium">Orders Placed</p>
            <p className="text-2xl font-bold text-green-700">{analytics.orderCount}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-500 font-medium">Average Order</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(analytics.averageOrderValue)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Spending by Month Chart */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Your Spending Trend</h3>
            {analytics.spendingByMonth.length > 0 ? (
              <div className="h-48 flex items-end space-x-2">
                {analytics.spendingByMonth.map((item, index) => {
                  const maxSpending = getMaxSpending();
                  const height = maxSpending ? (item.amount / maxSpending) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-full flex justify-center">
                        <motion.div 
                          className="w-full bg-primary rounded-t-sm"
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 w-full text-center truncate">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Not enough data to show spending trend</p>
              </div>
            )}
          </div>
          
          {/* Order Status Distribution */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Order Status</h3>
            {Object.keys(analytics.ordersByStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(analytics.ordersByStatus).map(([status, count], index) => {
                  const percentage = (count / analytics.orderCount) * 100;
                  
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{status}</span>
                        <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div 
                          className={`h-2.5 rounded-full ${getStatusColor(status)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">No order status data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Most Ordered Products */}
        {analytics.mostOrderedProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Your Favorite Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.mostOrderedProducts.map((product, index) => (
                <motion.div 
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${product.name.charAt(0)}`; }}
                      />
                    ) : (
                      <span className="text-gray-500 font-bold">{product.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">Ordered {product.totalQuantity} times</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CustomerAnalytics;