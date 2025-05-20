// frontend/src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [showHero, setShowHero] = useState(false);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set page title and hero visibility based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') {
      setPageTitle('Home');
      setShowHero(true);
    } else if (path.includes('/products')) {
      setPageTitle('Products');
      setShowHero(false);
    } else if (path.includes('/cart')) {
      setPageTitle('Shopping Cart');
      setShowHero(false);
    } else if (path.includes('/orders')) {
      setPageTitle('My Orders');
      setShowHero(false);
    } else if (path.includes('/customer/dashboard')) {
      setPageTitle('My Account');
      setShowHero(false);
    } else {
      setPageTitle('');
      setShowHero(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isScrolled={isScrolled} pageTitle={pageTitle} />
      
      {showHero && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-primary to-primary-dark text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        >
          <div className="container mx-auto">
            <div className="max-w-3xl">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Fresh Local Products Delivered to Your Door
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-lg md:text-xl mb-8 text-gray-100"
              >
                Shop from local stores in your city and get products delivered quickly and conveniently.
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <a href="#featured-products" className="bg-white text-primary hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition duration-200 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                  Shop Now
                </a>
                <a href="#how-it-works" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-medium py-3 px-6 rounded-lg transition duration-200 inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  How It Works
                </a>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute right-0 bottom-0 transform translate-y-1/4 -z-10 opacity-10">
            <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFFFFF" d="M41.9,-71.3C53.5,-64.6,61.8,-51.5,67.8,-37.7C73.8,-23.9,77.5,-9.4,76.2,4.7C74.9,18.8,68.6,32.6,59.1,43.1C49.6,53.6,36.9,60.9,23.4,65.8C9.9,70.7,-4.4,73.3,-17.4,69.9C-30.4,66.5,-42.1,57.1,-51.5,45.8C-60.9,34.5,-68,21.3,-71.5,6.5C-75,-8.3,-74.9,-24.7,-68.1,-37.7C-61.3,-50.7,-47.8,-60.3,-34.1,-66C-20.4,-71.7,-6.5,-73.5,7.2,-74.9C20.9,-76.3,30.3,-77.9,41.9,-71.3Z" transform="translate(100 100)" />
            </svg>
          </div>
        </motion.div>
      )}
      
      <main className={`flex-grow ${showHero ? '' : 'pt-16 md:pt-20'}`}>
        {!showHero && pageTitle && (
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
            </div>
          </div>
        )}
        
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
      
      <Footer />
    </div>
  );
};

export default MainLayout;