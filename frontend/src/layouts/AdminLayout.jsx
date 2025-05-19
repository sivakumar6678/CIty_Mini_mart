// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change header appearance
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isScrolled={isScrolled} toggleSidebar={toggleSidebar} isAdmin={true} />
      
      <div className="flex flex-1 pt-16 md:pt-20">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 transition-all duration-300 ease-in-out">
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