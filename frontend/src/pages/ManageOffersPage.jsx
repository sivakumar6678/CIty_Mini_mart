import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../App';
import { getProducts, updateProduct } from '../services/api';
import Toast from '../components/Toast';

const ManageOffersPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [editingProduct, setEditingProduct] = useState(null);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== 'admin') {
      navigate('/login');
    }
  }, [auth, navigate]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts();
        const productsData = response.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(`Failed to fetch products: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products when search term or category changes
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        product.shop_name.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const handleEditOffer = (product) => {
    setEditingProduct({
      ...product,
      newDiscount: product.discount_percentage || 0,
      newFeatured: product.featured || false
    });
  };

  const handleSaveOffer = async () => {
    if (!editingProduct) return;
    
    setLoading(true);
    try {
      const updatedProduct = {
        ...editingProduct,
        discount_percentage: editingProduct.newDiscount,
        featured: editingProduct.newFeatured
      };
      
      const response = await updateProduct(editingProduct.id, updatedProduct);
      
      // Update products list
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === editingProduct.id ? response.data : p
        )
      );
      
      setNotification({
        show: true,
        message: `Successfully updated offer for ${editingProduct.name}`,
        type: 'success'
      });
      
      setEditingProduct(null);
    } catch (err) {
      console.error("Error updating product:", err);
      setNotification({
        show: true,
        message: `Failed to update offer: ${err.response?.data?.message || err.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'N/A';
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (typeof price !== 'number' || typeof discountPercentage !== 'number') return price;
    return price - (price * (discountPercentage / 100));
  };

  const closeNotification = () => {
    setNotification({ ...notification, show: false });
  };

  return (
    <div className="container mx-auto p-6">
      <Toast 
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Offers</h1>
          <p className="text-gray-600">Create and manage special offers and featured products</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link to="/admin/dashboard" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or shop..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>
      
      {/* Products List */}
      {loading && !editingProduct ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <motion.div 
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-xl font-semibold text-primary mt-4">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-red-700 mb-1">Error Loading Products</h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white shadow-lg rounded-xl p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h2>
          <p className="text-gray-600 mb-6">No products match your current filters.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={product.image_url || `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${product.name.charAt(0)}`} 
                            alt={product.name}
                            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${product.name.charAt(0)}`; }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.shop_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(product.price)}</div>
                      {product.discount_percentage > 0 && (
                        <div className="text-xs text-green-600">
                          {formatCurrency(calculateDiscountedPrice(product.price, product.discount_percentage))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.discount_percentage > 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product.discount_percentage}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No discount</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.featured ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not featured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditOffer(product)}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Edit Offer Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingProduct(null)}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                <h2 className="text-2xl font-bold">Edit Offer</h2>
                <p className="text-white text-opacity-90 mt-1">
                  {editingProduct.name}
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Price</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(editingProduct.price)}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="discount"
                        min="0"
                        max="90"
                        value={editingProduct.newDiscount}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          newDiscount: Math.min(90, Math.max(0, parseInt(e.target.value) || 0))
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                      <span className="ml-2 text-gray-500">%</span>
                    </div>
                  </div>
                  
                  {editingProduct.newDiscount > 0 && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">Discounted Price</span>
                      </div>
                      <div className="mt-1 text-lg font-bold text-green-700">
                        {formatCurrency(calculateDiscountedPrice(editingProduct.price, editingProduct.newDiscount))}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Customer saves {formatCurrency(editingProduct.price - calculateDiscountedPrice(editingProduct.price, editingProduct.newDiscount))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editingProduct.newFeatured}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        newFeatured: e.target.checked
                      })}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Feature this product on homepage
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleSaveOffer}
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageOffersPage;