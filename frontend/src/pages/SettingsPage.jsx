// frontend/src/pages/SettingsPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';
import { updateUserProfile } from '../services/api';
import Toast from '../components/Toast';

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
            className="container mx-auto p-6 max-w-4xl"
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

            <motion.h1 
                className="text-3xl font-bold text-gray-800 mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                Account Settings
            </motion.h1>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`px-6 py-4 text-sm font-medium ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`px-6 py-4 text-sm font-medium ${activeTab === 'security' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    <button
                        className={`px-6 py-4 text-sm font-medium ${activeTab === 'preferences' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('preferences')}
                    >
                        Preferences
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <motion.div 
                        className="p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleProfileUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="mt-6">
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    whileTap={{ scale: loading ? 1 : 0.97 }}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <motion.div 
                        className="p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handlePasswordUpdate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    whileHover={{ scale: loading ? 1 : 1.03 }}
                                    whileTap={{ scale: loading ? 1 : 0.97 }}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        'Update Password'
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <motion.div 
                        className="p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Notification Preferences</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" defaultChecked />
                                        <span className="ml-2 text-gray-700">Email notifications for orders</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" defaultChecked />
                                        <span className="ml-2 text-gray-700">Email notifications for promotions</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" defaultChecked />
                                        <span className="ml-2 text-gray-700">SMS notifications for order updates</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Display Preferences</h3>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" defaultChecked />
                                        <span className="ml-2 text-gray-700">Enable dark mode</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-primary" defaultChecked />
                                        <span className="ml-2 text-gray-700">Show product recommendations</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <motion.button
                                type="button"
                                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    setNotification({
                                        show: true,
                                        message: 'Preferences saved successfully!',
                                        type: 'success'
                                    });
                                }}
                            >
                                Save Preferences
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="text-lg font-medium text-gray-800">{auth.role === 'admin' ? 'Admin' : 'Customer'}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="text-lg font-medium text-gray-800">{new Date(auth.created_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default SettingsPage;