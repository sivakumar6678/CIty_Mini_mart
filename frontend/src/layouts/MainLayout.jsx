// frontend/src/layouts/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isScrolled={isScrolled} />
      
      <main className="flex-grow pt-16 md:pt-20">
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