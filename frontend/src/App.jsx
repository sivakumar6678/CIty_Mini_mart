// frontend/src/App.jsx
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage'; // Customer orders
import ShopOrdersPage from './pages/ShopOrdersPage'; // Admin shop orders
import CreateShopPage from './pages/CreateShopPage'; // Admin create shop
import AddProductPage from './pages/AddProductPage'; // Admin add product
import { getMe } from './services/api'; // Assuming an api service
import './App.css';

// Create AuthContext
export const AuthContext = createContext(null);

function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role'),
        city: localStorage.getItem('city'),
        name: localStorage.getItem('name'),
        isAuthenticated: !!localStorage.getItem('token'),
        userId: localStorage.getItem('userId'),
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !auth.role) { // If token exists but context not fully populated, try to fetch user data
            const fetchUser = async () => {
                try {
                    const userData = await getMe(token); // You'll need to implement getMe in api.js
                    if (userData) {
                       setAuth({
                           token: token,
                           role: userData.role,
                           city: userData.city,
                           name: userData.name,
                           isAuthenticated: true,
                           userId: userData.id,
                       });
                    } else { // Token might be invalid or expired
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Failed to fetch user data on load:", error);
                    handleLogout(); // Clear invalid auth state
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);


    const handleLogin = (loginData) => {
        localStorage.setItem('token', loginData.access_token);
        localStorage.setItem('role', loginData.role);
        localStorage.setItem('city', loginData.city);
        localStorage.setItem('name', loginData.name);
        localStorage.setItem('userId', loginData.user_id);
        setAuth({
            token: loginData.access_token,
            role: loginData.role,
            city: loginData.city,
            name: loginData.name,
            isAuthenticated: true,
            userId: loginData.user_id,
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('city');
        localStorage.removeItem('name');
        localStorage.removeItem('cart'); // Clear cart on logout
        localStorage.removeItem('userId');
        setAuth({
            token: null,
            role: null,
            city: null,
            name: null,
            isAuthenticated: false,
            userId: null,
        });
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <div className="loading-spinner mb-4"></div>
                    <p className="text-xl font-semibold text-primary-color">Loading Mini Mart...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ auth, handleLogin, handleLogout, setAuth }}>
            <Router>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="main-content">
                        <div className="container mx-auto p-4 fade-in">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to={auth.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} />} />
                                <Route path="/register" element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to={auth.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'} />} />
                                
                                {/* Customer Routes */}
                                <Route path="/customer/dashboard" element={
                                    auth.isAuthenticated && auth.role === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" />
                                } />
                                <Route path="/products/city/:cityName" element={<ProductsPage />} /> {/* Public or customer */}
                                <Route path="/cart" element={
                                    auth.isAuthenticated && auth.role === 'customer' ? <CartPage /> : <Navigate to="/login" />
                                } />
                                <Route path="/orders" element={
                                    auth.isAuthenticated && auth.role === 'customer' ? <OrdersPage /> : <Navigate to="/login" />
                                } />

                                {/* Admin Routes */}
                                <Route path="/admin/dashboard" element={
                                    auth.isAuthenticated && auth.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
                                } />
                                <Route path="/admin/create-shop" element={
                                    auth.isAuthenticated && auth.role === 'admin' ? <CreateShopPage /> : <Navigate to="/login" />
                                } />
                                <Route path="/admin/add-product" element={
                                    auth.isAuthenticated && auth.role === 'admin' ? <AddProductPage /> : <Navigate to="/login" />
                                } />
                                <Route path="/admin/shop-orders" element={
                                    auth.isAuthenticated && auth.role === 'admin' ? <ShopOrdersPage /> : <Navigate to="/login" />
                                } />

                                <Route path="*" element={<Navigate to="/" />} /> {/* Fallback route */}
                            </Routes>
                        </div>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthContext.Provider>
    );
}

// Enhanced Navbar component
const Navbar = () => {
    const { auth, handleLogout } = React.useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        handleLogout();
        navigate('/login');
    };
    
    // Function to format currency (can be moved to a utils file)
    const formatCurrency = (amount) => {
        return amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '₹0.00';
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Mini Mart
                </Link>
                
                <div className="navbar-links">
                    {auth.isAuthenticated ? (
                        <>
                            <div className="navbar-user">
                                <span>Welcome, {auth.name}</span>
                                <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                                    {auth.role === 'admin' ? 'Admin' : 'Customer'}
                                </span>
                                {auth.city && (
                                    <span className="px-2 py-1 bg-white bg-opacity-10 rounded-full text-xs ml-1">
                                        {auth.city}
                                    </span>
                                )}
                            </div>
                            
                            {auth.role === 'customer' && (
                                <>
                                    <Link to="/cart" className="navbar-link">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                            <circle cx="9" cy="21" r="1"></circle>
                                            <circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                        Cart
                                    </Link>
                                    <Link to="/orders" className="navbar-link">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                        My Orders
                                    </Link>
                                </>
                            )}
                            
                            {auth.role === 'admin' && (
                                <div className="relative group">
                                    <Link to="/admin/dashboard" className="navbar-link">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                        Dashboard
                                    </Link>
                                </div>
                            )}
                            
                            <button onClick={onLogout} className="navbar-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                    <polyline points="10 17 15 12 10 7"></polyline>
                                    <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                                Login
                            </Link>
                            <Link to="/register" className="navbar-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

// Add a simple Footer component
const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold mb-2">Mini Mart</h3>
                        <p className="text-gray-400 text-sm">Your neighborhood marketplace</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        <div>
                            <h4 className="font-semibold mb-2">Quick Links</h4>
                            <ul className="text-sm text-gray-400">
                                <li className="mb-1"><Link to="/" className="hover:text-white">Home</Link></li>
                                <li className="mb-1"><Link to="/products/city/all" className="hover:text-white">Products</Link></li>
                                <li className="mb-1"><Link to="/cart" className="hover:text-white">Cart</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-2">Contact</h4>
                            <ul className="text-sm text-gray-400">
                                <li className="mb-1">Email: support@minimart.com</li>
                                <li className="mb-1">Phone: +91 1234567890</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Mini Mart. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default App;
    