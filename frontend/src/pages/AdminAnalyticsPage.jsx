// frontend/src/pages/AdminAnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminMetricCard from '../components/AdminMetricCard';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { getShopAnalytics } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeCustomers: 0,
    averageOrderValue: 0,
    revenueData: [],
    orderStatusData: {},
    topProducts: []
  });

  const [timeRange, setTimeRange] = useState(30); // Default to 30 days

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getShopAnalytics(timeRange);
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        
        // Use placeholder data if API fails
        setAnalytics({
          totalSales: 0,
          totalOrders: 0,
          activeCustomers: 0,
          averageOrderValue: 0,
          revenueData: [],
          orderStatusData: {
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
          },
          topProducts: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare chart data
  const revenueChartData = {
    labels: analytics.revenueData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Revenue',
        data: analytics.revenueData.map(item => item.revenue),
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const orderStatusChartData = {
    labels: Object.keys(analytics.orderStatusData),
    datasets: [
      {
        data: Object.values(analytics.orderStatusData),
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)', // Pending - Amber
          'rgba(139, 92, 246, 0.8)', // Processing - Purple
          'rgba(59, 130, 246, 0.8)', // Shipped - Blue
          'rgba(16, 185, 129, 0.8)', // Delivered - Green
          'rgba(239, 68, 68, 0.8)'   // Cancelled - Red
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const topProductsChartData = {
    labels: analytics.topProducts.map(product => product.name),
    datasets: [
      {
        label: 'Sales',
        data: analytics.topProducts.map(product => product.sales),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your shop's performance and sales</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select 
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">This year</option>
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminMetricCard
          title="Total Sales"
          value={formatCurrency(analytics.totalSales)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
          index={0}
        />
        <AdminMetricCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="blue"
          index={1}
        />
        <AdminMetricCard
          title="Active Customers"
          value={analytics.activeCustomers}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="purple"
          index={2}
        />
        <AdminMetricCard
          title="Avg. Order Value"
          value={formatCurrency(analytics.averageOrderValue)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="orange"
          index={3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Trend</h2>
          <div className="h-80">
            <Line data={revenueChartData} options={lineChartOptions} />
          </div>
        </motion.div>

        {/* Order Status Chart */}
        <motion.div 
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Status Breakdown</h2>
          <div className="h-80 flex items-center justify-center">
            <Pie data={orderStatusChartData} options={pieChartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div 
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Selling Products</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <Bar data={topProductsChartData} options={barChartOptions} />
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.topProducts.map((product, index) => (
                  <tr key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sales} units</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalyticsPage;