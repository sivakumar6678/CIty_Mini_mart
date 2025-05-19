// frontend/src/components/layout/Header.jsx
import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ isScrolled, toggleSidebar, isAdmin = false }) => {
  const { auth, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const onLogout = () => {
    handleLogout();
    navigate('/login');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setUserMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-gradient-to-r from-primary to-primary-dark py-3'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {isAdmin && (
              <button 
                onClick={toggleSidebar}
                className="mr-3 md:hidden text-white"
                aria-label="Toggle sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <Link to="/" className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-8 w-8 ${isScrolled ? 'text-primary' : 'text-white'}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              <span className={`ml-2 text-xl font-bold ${isScrolled ? 'text-gray-800' : 'text-white'}`}>
                Mini Mart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-gray-200'} 
                 ${isActive ? 'font-semibold' : 'font-medium'} transition-colors`
              }
              end
            >
              Home
            </NavLink>
            
            {auth.isAuthenticated ? (
              <>
                {auth.role === 'customer' && (
                  <>
                    <NavLink 
                      to={`/products/city/${auth.city}`} 
                      className={({ isActive }) => 
                        `${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-gray-200'} 
                         ${isActive ? 'font-semibold' : 'font-medium'} transition-colors`
                      }
                    >
                      Products
                    </NavLink>
                    <NavLink 
                      to="/cart" 
                      className={({ isActive }) => 
                        `${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-gray-200'} 
                         ${isActive ? 'font-semibold' : 'font-medium'} transition-colors relative`
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Cart
                    </NavLink>
                    <NavLink 
                      to="/orders" 
                      className={({ isActive }) => 
                        `${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-gray-200'} 
                         ${isActive ? 'font-semibold' : 'font-medium'} transition-colors`
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                      </svg>
                      Orders
                    </NavLink>
                  </>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={toggleUserMenu}
                    className={`flex items-center space-x-1 ${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-gray-200'} transition-colors`}
                  >
                    <span className="font-medium">{auth.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                      >
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">{auth.name}</p>
                          <p className="text-xs text-gray-500">{auth.city}</p>
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary bg-opacity-10 text-primary mt-1">
                            {auth.role === 'admin' ? 'Admin' : 'Customer'}
                          </span>
                        </div>
                        
                        {auth.role === 'admin' && (
                          <Link 
                            to="/admin/dashboard" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                        )}
                        
                        {auth.role === 'customer' && (
                          <Link 
                            to="/customer/dashboard" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                        )}
                        
                        <button 
                          onClick={onLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => 
                    `${isScrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-gray-200'} 
                     ${isActive ? 'font-semibold' : 'font-medium'} transition-colors`
                  }
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  className={({ isActive }) => 
                    `${isScrolled ? 'bg-primary text-white' : 'bg-white text-primary'} 
                     px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity`
                  }
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className={`${isScrolled ? 'text-gray-700' : 'text-white'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg"
          >
            <div className="px-4 py-3 border-b border-gray-200">
              {auth.isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{auth.name}</p>
                    <p className="text-xs text-gray-500">{auth.city}</p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary bg-opacity-10 text-primary mt-1">
                      {auth.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-red-600 text-sm font-medium"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <Link 
                    to="/login" 
                    className="text-primary font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary text-white px-3 py-1 rounded-md text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            
            <nav className="px-4 py-2">
              <Link 
                to="/" 
                className="block py-2 text-gray-700 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {auth.isAuthenticated && auth.role === 'customer' && (
                <>
                  <Link 
                    to={`/products/city/${auth.city}`} 
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link 
                    to="/cart" 
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    Cart
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                    </svg>
                    Orders
                  </Link>
                  <Link 
                    to="/customer/dashboard" 
                    className="block py-2 text-gray-700 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    Dashboard
                  </Link>
                </>
              )}
              
              {auth.isAuthenticated && auth.role === 'admin' && (
                <Link 
                  to="/admin/dashboard" 
                  className="block py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;