// frontend/src/pages/HomePage.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

// Re-using the city list from RegisterPage, ideally this would be in a shared constants file
const indianCities = [
     "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
    "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra",
    "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad",
    "Dhanbad", "Amritsar", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati",
    "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", "Mysore",
    "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem",
    "Warangal", "Mira-Bhayandar", "Thiruvananthapuram", "Bhiwandi", "Saharanpur",
    "Gorakhpur", "Guntur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai",
    "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur",
    "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga",
    "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar", "Jammu",
    "Sangli-Miraj & Kupwad", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli",
    "Malegaon", "Gaya", "Jalgaon", "Udaipur", "Maheshtala", "Tiruppur"
];

// Features for the homepage
const features = [
    {
        title: "Local Shops",
        description: "Connect with shops in your neighborhood and support local businesses.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        title: "Fresh Products",
        description: "Get fresh fruits, vegetables, and groceries delivered to your doorstep.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
        )
    },
    {
        title: "Easy Ordering",
        description: "Simple and intuitive ordering process with real-time order tracking.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        )
    }
];

function HomePage() {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState(auth.city || indianCities[0]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Add animation effect when component mounts
        setIsVisible(true);
    }, []);

    const handleCityChangeAndBrowse = () => {
        if (auth.isAuthenticated && auth.role === 'customer') {
            // Update city in context and localStorage if the user is logged in as a customer
            localStorage.setItem('city', selectedCity);
            setAuth(prevAuth => ({ ...prevAuth, city: selectedCity }));
            navigate(`/customer/dashboard`); // Or directly to products page for the new city
        } else if (!auth.isAuthenticated) {
            // For guest users, temporarily store city preference for browsing
            localStorage.setItem('guestCity', selectedCity); // Use a different key for guests
            navigate(`/products/city/${encodeURIComponent(selectedCity)}`);
        } else {
            // For admins, city selection here might not change their primary operating city
            // but they can still browse products in other cities.
            navigate(`/products/city/${encodeURIComponent(selectedCity)}`);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 text-white py-20 px-6">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className={`md:w-1/2 text-center md:text-left mb-10 md:mb-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Fresh Products from <br />
                            <span className="text-yellow-300">Your Local Shops</span>
                        </h1>
                        <p className="text-xl mb-8 max-w-lg">
                            Mini Mart connects you with local shops in your city. 
                            Get fresh fruits, vegetables, and groceries delivered to your doorstep.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            {!auth.isAuthenticated && (
                                <>
                                    <Link to="/register" className="bg-white text-primary-dark font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition-all">
                                        Get Started
                                    </Link>
                                    <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white/10 transition-all">
                                        Sign In
                                    </Link>
                                </>
                            )}
                            {auth.isAuthenticated && auth.role === 'customer' && (
                                <Link to="/customer/dashboard" className="bg-white text-primary-dark font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition-all">
                                    Go to Dashboard
                                </Link>
                            )}
                            {auth.isAuthenticated && auth.role === 'admin' && (
                                <Link to="/admin/dashboard" className="bg-white text-primary-dark font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition-all">
                                    Admin Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    <div className={`md:w-1/2 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 text-center">Browse Products in Your City</h2>
                            
                            <div className="mb-6">
                                <label htmlFor="city-select" className="block text-lg font-medium mb-2">
                                    Select Your City:
                                </label>
                                <select 
                                    id="city-select"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full p-3 rounded-md bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                                >
                                    {indianCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={handleCityChangeAndBrowse}
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Browse Products in {selectedCity}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Features Section */}
            <div className="py-16 px-6 bg-gray-50">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Mini Mart?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div 
                                key={index} 
                                className={`bg-white p-8 rounded-lg shadow-md text-center transition-all duration-700 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                            >
                                <div className="flex justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Call to Action */}
            <div className="bg-primary-color text-white py-16 px-6">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to start shopping?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of customers who are already enjoying fresh products from their local shops.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={handleCityChangeAndBrowse}
                            className="bg-white text-primary-dark font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition-all"
                        >
                            Browse Products
                        </button>
                        
                        {!auth.isAuthenticated && (
                            <Link to="/register" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-all">
                                Create Account
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
    