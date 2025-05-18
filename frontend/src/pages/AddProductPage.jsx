// frontend/src/pages/AddProductPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { addProduct, getMyShop } from '../services/api';

function AddProductPage() {
    const { auth } = useContext(AuthContext);
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [shopExists, setShopExists] = useState(false);
    const [checkingShop, setCheckingShop] = useState(true);
    const navigate = useNavigate();

     useEffect(() => {
        // Check if admin has a shop, as products are tied to a shop
        const checkShop = async () => {
            setCheckingShop(true);
            try {
                const response = await getMyShop(); // This API gets the admin's shop
                if (response.data && response.data.id) {
                    setShopExists(true);
                } else {
                    setShopExists(false);
                    setError("You need to create a shop before adding products.");
                }
            } catch (err) {
                 setShopExists(false);
                 if (err.response && err.response.status === 404) {
                    setError("You don't have a shop registered yet. Please create one first.");
                 } else {
                    setError("Could not verify shop status. " + (err.response?.data?.message || err.message));
                 }
            } finally {
                setCheckingShop(false);
            }
        };
        if (auth.role === 'admin') {
            checkShop();
        }
    }, [auth.role]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName.trim() || !price) {
            setError("Product name and price are required.");
            return;
        }
        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError("Price must be a positive number.");
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // The backend addProduct endpoint uses the logged-in admin's shop automatically
            await addProduct({ name: productName, price: numericPrice, image_url: imageUrl });
            setSuccess(`Product "${productName}" added successfully!`);
            // Clear form
            setProductName('');
            setPrice('');
            setImageUrl('');
            // Optionally navigate back to dashboard or product list after a delay
            setTimeout(() => {
                // navigate('/admin/dashboard'); // Or a page showing all products
                setSuccess(''); // Clear success message after some time if staying on page
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    if (checkingShop) {
        return <div className="container mx-auto p-4 text-center">Verifying shop status...</div>;
    }

    if (!shopExists && !checkingShop) {
         return (
            <div className="container mx-auto p-6 max-w-lg bg-white shadow-xl rounded-lg text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Shop Required</h1>
                <p className="text-gray-700 mb-4">
                    {error || "You must have a registered shop to add products."}
                </p>
                <Link 
                    to="/admin/create-shop" 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-150 mr-2"
                >
                    Create Shop
                </Link>
                <Link 
                    to="/admin/dashboard" 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-150"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Add New Product
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Fill in the details to add a product to your shop.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                    {success && <p className="text-sm text-green-600 bg-green-100 p-3 rounded-md text-center">{success}</p>}
                    
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                            Product Name
                        </label>
                        <input
                            id="productName"
                            name="productName"
                            type="text"
                            required
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="e.g., Fresh Apples"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                            Price (INR ₹)
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="e.g., 50.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                            Image URL (Optional)
                        </label>
                        <input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                         <p className="mt-1 text-xs text-gray-500">
                            Or use a placeholder like: <code className="text-xs bg-gray-100 p-0.5 rounded">https://placehold.co/600x400?text=Product+Name</code>
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Adding Product...' : 'Add Product'}
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

export default AddProductPage;
    