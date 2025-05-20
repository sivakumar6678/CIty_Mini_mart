// frontend/src/components/layout/Sidebar.jsx
import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../App';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { auth } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('main');
  
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

  const mainNavItems = [
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
    }
  ];

  const productNavItems = [
    {
      name: 'Add Product',
      path: '/admin/add-product',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Manage Products',
      path: '/admin/products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    }
  ];

  const shopNavItems = [
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
      name: 'Shop Settings',
      path: '/admin/create-shop',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const renderNavItems = (items, isMobile = false) => (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-4 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
            onClick={isMobile ? toggleSidebar : undefined}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  const SectionTitle = ({ title }) => (
    <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-4 py-2 mt-6 mb-2">
      {title}
    </h3>
  );

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
        className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-lg z-50 md:hidden pt-16 overflow-y-auto"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
              <p className="text-sm text-gray-500">{auth.name}'s Shop</p>
            </div>
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav>
            <div className="mb-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveSection('main')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                    activeSection === 'main' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Main
                </button>
                <button 
                  onClick={() => setActiveSection('products')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                    activeSection === 'products' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Products
                </button>
                <button 
                  onClick={() => setActiveSection('shop')}
                  className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                    activeSection === 'shop' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Shop
                </button>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'main' && renderNavItems(mainNavItems, true)}
                {activeSection === 'products' && renderNavItems(productNavItems, true)}
                {activeSection === 'shop' && renderNavItems(shopNavItems, true)}
              </motion.div>
            </AnimatePresence>
          </nav>
        </div>
      </motion.div>
      
      {/* Sidebar for desktop */}
      <div className="hidden md:block w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 pt-20 z-30 overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-500 mt-1">{auth.name}'s Shop</p>
          </div>
          
          <nav className="space-y-6">
            <div>
              {renderNavItems(mainNavItems)}
            </div>
            
            <div>
              <SectionTitle title="Products" />
              {renderNavItems(productNavItems)}
            </div>
            
            <div>
              <SectionTitle title="Shop Management" />
              {renderNavItems(shopNavItems)}
            </div>
            
            <div className="pt-6 mt-6 border-t border-gray-200">
              <a 
                href="https://docs.example.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help & Documentation</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
      
      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-64 flex-shrink-0"></div>
    </>
  );
};

export default Sidebar;