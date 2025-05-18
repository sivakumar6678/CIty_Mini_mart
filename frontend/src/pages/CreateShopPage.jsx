// frontend/src/pages/CreateShopPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { createShop, getMyShop } from '../services/api';

// Re-using the city list, ideally from a shared constants file
const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
    "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", /* ... more cities */
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

function CreateShopPage() {
    const { auth } = useContext(AuthContext);
    const [shopName, setShopName] = useState('');
    // Default shop city to admin's registration city, but allow them to change if needed for the shop
    const [shopCity, setShopCity] = useState(auth.city || indianCities[0]); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingShop, setExistingShop] = useState(null);
    const [checkingShop, setCheckingShop] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin already has a shop
        const checkExistingShop = async () => {
            setCheckingShop(true);
            try {
                const response = await getMyShop();
                if (response.data && response.data.id) {
                    setExistingShop(response.data);
                }
            } catch (err) {
                // If 404, it means no shop, which is fine for this page.
                if (err.response && err.response.status !== 404) {
                    setError("Error checking for existing shop: " + (err.response?.data?.message || err.message));
                }
            } finally {
                setCheckingShop(false);
            }
        };

        if (auth.role === 'admin') {
            checkExistingShop();
        }
    }, [auth.role]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shopName.trim() || !shopCity) {
            setError("Shop name and city are required.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await createShop({ name: shopName, city: shopCity });
            setSuccess(`Shop "${response.data.name}" created successfully in ${response.data.city}! Redirecting to dashboard...`);
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create shop. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checkingShop) {
        return <div className="container mx-auto p-4 text-center">Checking your shop status...</div>;
    }

    if (existingShop) {
        return (
            <div className="container mx-auto p-6 max-w-lg bg-white shadow-xl rounded-lg text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">You Already Have a Shop</h1>
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                    <strong className="font-bold">{existingShop.name}</strong>
                    <span className="block sm:inline"> located in {existingShop.city}.</span>
                </div>
                <p className="text-gray-600 mb-6">
                    You can manage your existing shop from the admin dashboard. Currently, Mini Mart supports one shop per admin.
                </p>
                <Link 
                    to="/admin/dashboard" 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-150"
                >
                    Go to Dashboard
                </Link>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Register Your Shop
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Set up your shop to start selling fresh produce.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md text-center">{success}</p>}
                    
                    <div>
                        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                            Shop Name
                        </label>
                        <input
                            id="shopName"
                            name="shopName"
                            type="text"
                            required
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="e.g., Fresh Farms Daily"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="shopCity" className="block text-sm font-medium text-gray-700">
                            Shop City
                        </label>
                        <select 
                            id="shopCity" 
                            name="shopCity" 
                            required 
                            value={shopCity} 
                            onChange={(e) => setShopCity(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                        >
                            {indianCities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">This is the city where your shop operates and will be listed.</p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !!success} // Disable if successful to prevent resubmit
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Creating Shop...' : 'Create Shop'}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-center text-sm">
                    <Link to="/admin/dashboard" className="font-medium text-green-600 hover:text-green-500">
                        Back to Dashboard
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default CreateShopPage;
    