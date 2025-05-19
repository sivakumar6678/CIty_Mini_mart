// frontend/src/components/layout/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../App';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { auth } = useContext(AuthContext);
  
  // Only show sidebar for admin users
  if (auth.role !== 'admin') return null;

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      } 
    },
    closed: { 
      x: '-100%',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      } 
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      name: 'Products',
      path: '/admin/add-product',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Orders',
      path: '/admin/shop-orders',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Shop',
      path: '/admin/create-shop',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar for mobile */}
      <motion.div
        className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg z-50 md:hidden pt-16"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                    onClick={toggleSidebar}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.div>
      
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 pt-20 z-30">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Panel</h2>
          
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-64 flex-shrink-0"></div>
    </>
  );
};

export default Sidebar;