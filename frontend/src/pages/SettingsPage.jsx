// frontend/src/pages/SettingsPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { updateUserProfile } from '../services/api';
import Toast from '../components/Toast';
import AddressSelector from '../components/AddressSelector';
import { Link } from 'react-router-dom';

function SettingsPage() {
    const { auth, setAuth } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (auth.isAuthenticated) {
            setName(auth.name || '');
            setEmail(auth.email || '');
            setCity(auth.city || '');
            setPhone(auth.phone || '');
            setAddress(auth.address || '');
        }
    }, [auth]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await updateUserProfile({
                name,
                email,
                city,
                phone,
                address
            });

            // Update auth context with new user data
            setAuth(prev => ({
                ...prev,
                name,
                email,
                city,
                phone,
                address
            }));

            setNotification({
                show: true,
                message: 'Profile updated successfully!',
                type: 'success'
            });
        } catch (error) {
            setNotification({
                show: true,
                message: error.response?.data?.message || 'Failed to update profile',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setNotification({
                show: true,
                message: 'Passwords do not match',
                type: 'error'
            });
            return;
        }

        if (password.length < 6) {
            setNotification({
                show: true,
                message: 'Password must be at least 6 characters long',
                type: 'error'
            });
            return;
        }

        setLoading(true);

        try {
            await updateUserProfile({ password });
            
            setNotification({
                show: true,
                message: 'Password updated successfully!',
                type: 'success'
            });
            
            // Clear password fields
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setNotification({
                show: true,
                message: error.response?.data?.message || 'Failed to update password',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    if (!auth.isAuthenticated) {
        return (
            <div className="container mx-auto p-8 text-center">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
                    <p className="text-yellow-700">Please log in to access your settings.</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="container mx-auto p-6 max-w-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Toast Notification */}
            <Toast 
                message={notification.message}
                type={notification.type}
                show={notification.show}
                onClose={closeNotification}
            />

            {/* Header with breadcrumbs */}
            <div className="mb-8">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700">Account Settings</span>
                </div>
                
                <motion.h1 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Account Settings
                </motion.h1>
                <p className="text-gray-600 mt-2">Manage your profile, security, and preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:w-1/4">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6">
                        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                                    {auth.name ? auth.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <h3 className="font-medium">{auth.name || 'User'}</h3>
                                    <p className="text-sm text-white/80">{auth.email || ''}</p>
                                </div>
                            </div>
                        </div>
                        
                        <nav className="p-3">
                            <button
                                className={`w-full text-left px-4 py-3.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'security' ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveTab('security')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Security Settings</span>
                            </button>
                            
                            <button
                                className={`w-full text-left px-4 py-3.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'preferences' ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveTab('preferences')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Preferences</span>
                            </button>
                            
                            <button
                                className={`w-full text-left px-4 py-3.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'addresses' ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Delivery Addresses</span>
                            </button>
                        </nav>
                        
                        <div className="p-4 border-t border-gray-100">
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
                                <h4 className="font-medium text-indigo-800 mb-1">Need Help?</h4>
                                <p className="text-sm text-indigo-700 mb-3">Have questions about your account?</p>
                                <Link to="/contact" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                                    <span>Contact Support</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main Content Area */}
                <div className="lg:w-3/4">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeTab === 'security' && 'Security Settings'}
                                {activeTab === 'preferences' && 'Your Preferences'}
                                {activeTab === 'addresses' && 'Manage Addresses'}
                            </h2>
                        </div>
                        
                        <AnimatePresence mode="wait">
                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <motion.div 
                                    key="security"
                                    className="p-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 shadow-sm">
                                        <div className="flex items-center mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">Update Your Password</h3>
                                                <p className="text-gray-600 text-sm">Keep your account secure with a strong password</p>
                                            </div>
                                        </div>
                                        
                                        <form onSubmit={handlePasswordUpdate} className="mt-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                                            placeholder="Enter new password"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                                            placeholder="Confirm new password"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <motion.button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                                    whileHover={{ scale: loading ? 1 : 1.02 }}
                                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Updating Password...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                            </svg>
                                                            <span>Update Password</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="p-4 bg-indigo-50 border-b border-gray-200">
                                            <h3 className="font-medium text-indigo-800">Password Tips</h3>
                                        </div>
                                        <div className="p-4">
                                            <ul className="space-y-2 text-sm text-gray-700">
                                                <li className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Use at least 8 characters
                                                </li>
                                                <li className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Include uppercase and lowercase letters
                                                </li>
                                                <li className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Add numbers and special characters
                                                </li>
                                                <li className="flex items-start">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Avoid using easily guessable information
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Security Options</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                                                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-white border border-purple-300 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
                                                    Enable
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-800">Login History</h4>
                                                        <p className="text-sm text-gray-600 mt-1">View your recent login activity</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-white border border-green-300 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                                </motion.div>
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                                <motion.div 
                                    key="preferences"
                                    className="p-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 mb-8 shadow-sm">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">Personalize Your Experience</h3>
                                        <p className="text-gray-600">Customize how you interact with our platform</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Notification Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-5 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-purple-900">Notifications</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-800">Order Updates</p>
                                                <p className="text-sm text-gray-500">Get notified about your order status</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-800">Promotional Emails</p>
                                                <p className="text-sm text-gray-500">Receive emails about deals and offers</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">SMS Notifications</p>
                                                <p className="text-sm text-gray-500">Get text messages for important updates</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Display Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-blue-900">Display Settings</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-800">Dark Mode</p>
                                                <p className="text-sm text-gray-500">Switch to dark theme for better viewing at night</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-800">Product Recommendations</p>
                                                <p className="text-sm text-gray-500">Show personalized product suggestions</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-medium text-gray-800">Show Recently Viewed</p>
                                                <p className="text-sm text-gray-500">Display your recently viewed products</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Language Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-5 bg-gradient-to-r from-green-50 to-green-100 border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-green-900">Language</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm">
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                            <option value="zh">中文</option>
                                            <option value="ja">日本語</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Currency Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-amber-900">Currency</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm">
                                            <option value="usd">USD ($)</option>
                                            <option value="eur">EUR (€)</option>
                                            <option value="gbp">GBP (£)</option>
                                            <option value="jpy">JPY (¥)</option>
                                            <option value="cad">CAD (C$)</option>
                                            <option value="aud">AUD (A$)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <motion.button
                                    type="button"
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setNotification({
                                            show: true,
                                            message: 'Preferences saved successfully!',
                                            type: 'success'
                                        });
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save All Preferences</span>
                                </motion.button>
                            </div>
                                </motion.div>
                            )}
                
                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <motion.div 
                                    key="addresses"
                                    className="p-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-xl p-6 mb-8 shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">Delivery Addresses</h3>
                                        <p className="text-gray-600">Manage your delivery locations for faster checkout</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                                <div className="p-5 bg-gradient-to-r from-cyan-50 to-cyan-100 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-cyan-200 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-cyan-900">Address Management Tips</h3>
                                        </div>
                                        <button className="px-4 py-2 bg-white border border-cyan-300 text-cyan-600 rounded-lg text-sm font-medium hover:bg-cyan-50 transition-colors flex items-center space-x-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Add New Address</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-cyan-50 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3 flex-shrink-0">
                                                    <span className="text-cyan-700 font-medium">1</span>
                                                </div>
                                                <p className="text-sm text-cyan-800">
                                                    Add multiple addresses for different delivery locations
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-cyan-50 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3 flex-shrink-0">
                                                    <span className="text-cyan-700 font-medium">2</span>
                                                </div>
                                                <p className="text-sm text-cyan-800">
                                                    Set a default address for faster checkout
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-cyan-50 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center mr-3 flex-shrink-0">
                                                    <span className="text-cyan-700 font-medium">3</span>
                                                </div>
                                                <p className="text-sm text-cyan-800">
                                                    Include detailed instructions for delivery personnel
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 pt-5">
                                        <AddressSelector 
                                            onAddressSelect={() => {}} 
                                            isManagementMode={true}
                                            onAddressUpdate={(message, type) => {
                                                setNotification({
                                                    show: true,
                                                    message,
                                                    type
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <motion.button
                                    type="button"
                                    className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setNotification({
                                            show: true,
                                            message: 'Address settings saved successfully!',
                                            type: 'success'
                                        });
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save Address Settings</span>
                                </motion.button>
                            </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    </div>
            </div>
            
            {/* Account Information Card */}
            <div className="lg:w-3/4 ml-auto mt-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 bg-white">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Account Information</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transform transition-transform hover:scale-105 duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Account Type</p>
                                        <p className="text-lg font-semibold text-gray-800">{auth.role === 'admin' ? 'Admin' : 'Customer'}</p>
                                    </div>
                                </div>
                                {auth.role === 'admin' && (
                                    <div className="mt-2 bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        Admin privileges
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transform transition-transform hover:scale-105 duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                                        <p className="text-lg font-semibold text-gray-800">{new Date(auth.created_at || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="mt-2 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Active member
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transform transition-transform hover:scale-105 duration-300">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Account Status</p>
                                        <p className="text-lg font-semibold text-green-600">Active</p>
                                    </div>
                                </div>
                                <div className="mt-2 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Verified account
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-800">Delete Account</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 ml-11">Permanently delete your account and all associated data</p>
                                    </div>
                                    <button className="px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center space-x-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete Account</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default SettingsPage;