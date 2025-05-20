// frontend/src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set page title based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) {
      setPageTitle('Dashboard');
    } else if (path.includes('/admin/analytics')) {
      setPageTitle('Analytics');
    } else if (path.includes('/admin/add-product')) {
      setPageTitle('Products');
    } else if (path.includes('/admin/shop-orders')) {
      setPageTitle('Orders');
    } else if (path.includes('/admin/create-shop')) {
      setPageTitle('Shop Management');
    } else {
      setPageTitle('Admin Panel');
    }
  }, [location.pathname]);

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isScrolled={isScrolled} toggleSidebar={toggleSidebar} isAdmin={true} pageTitle={pageTitle} />
      
      <div className="flex flex-1 pt-16 md:pt-20">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 transition-all duration-300 ease-in-out">
          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center text-sm">
              <span className="text-primary">Admin</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium text-gray-700">{pageTitle}</span>
            </div>
          </div>
          
          {/* Page Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="container mx-auto px-4 py-6 md:py-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLayout;