import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Carousel from '../components/Carousel';

const LandingPage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProducts();
      const products = response.data || [];
      
      // Filter products for different sections
      const featured = products.filter(product => product.featured).slice(0, 8);
      const offers = products.filter(product => product.discount_percentage > 0).slice(0, 8);
      const popular = [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 8);
      
      setFeaturedProducts(featured);
      setOfferProducts(offers);
      setBestSellers(popular);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
      
      // Set empty arrays to prevent errors in rendering
      setFeaturedProducts([]);
      setOfferProducts([]);
      setBestSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Hero section banners
  const heroBanners = [
    {
      id: 1,
      title: "Fresh Fruits",
      description: "Handpicked seasonal fruits delivered to your doorstep",
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      buttonText: "Shop Fruits",
      buttonLink: "/products/category/fruits",
      color: "from-red-500 to-orange-600"
    },
    {
      id: 2,
      title: "Farm Fresh Vegetables",
      description: "Locally sourced vegetables for your healthy lifestyle",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      buttonText: "Explore Veggies",
      buttonLink: "/products/category/vegetables",
      color: "from-green-500 to-emerald-700"
    },
    {
      id: 3,
      title: "Dairy Products",
      description: "Fresh dairy products from local farms",
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
      buttonText: "View Dairy",
      buttonLink: "/products/category/dairy",
      color: "from-blue-400 to-blue-600"
    }
  ];

  // Categories
  const categories = [
    { id: 1, name: "Fruits", icon: "🍎", color: "bg-red-100 text-red-800", link: "/products/category/fruits" },
    { id: 2, name: "Vegetables", icon: "🥦", color: "bg-green-100 text-green-800", link: "/products/category/vegetables" },
    { id: 3, name: "Leafy Greens", icon: "🥬", color: "bg-emerald-100 text-emerald-800", link: "/products/category/leafy-greens" },
    { id: 4, name: "Dairy", icon: "🥛", color: "bg-blue-100 text-blue-800", link: "/products/category/dairy" },
    { id: 5, name: "Organic", icon: "🌱", color: "bg-green-100 text-green-800", link: "/products/category/organic" },
    { id: 6, name: "Seasonal", icon: "🍓", color: "bg-orange-100 text-orange-800", link: "/products/category/seasonal" },
  ];

  // Features
  const features = [
    { id: 1, title: "Farm Fresh", description: "Directly from local farms", icon: "🌾" },
    { id: 2, title: "Same Day Delivery", description: "For orders before 2 PM", icon: "🚚" },
    { id: 3, title: "Organic Options", description: "Pesticide-free produce", icon: "🌱" },
    { id: 4, title: "Quality Guarantee", description: "Fresh or refunded", icon: "✅" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl font-semibold text-primary mt-4">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Hero Section with Carousel */}
      <section className="relative">
        <Carousel>
          {heroBanners.map((banner) => (
            <div key={banner.id} className="relative h-[60vh] md:h-[70vh] w-full">
              <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
              <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{ backgroundImage: `url(${banner.image})` }}
              ></div>
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-60 z-10`}></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-20 px-4">
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {banner.title}
                </motion.h1>
                <motion.p 
                  className="text-xl md:text-2xl mb-8 max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {banner.description}
                </motion.p>
                <motion.button
                  className="bg-white text-primary px-8 py-3 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(banner.buttonLink)}
                >
                  {banner.buttonText}
                </motion.button>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 bg-background-light">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-text-dark">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                className={`${category.color} rounded-xl p-6 text-center cursor-pointer shadow-md hover:shadow-lg transition-all`}
                whileHover={{ y: -5 }}
                onClick={() => navigate(category.link)}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 px-4 bg-background-dark">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark">Featured Products</h2>
            <Link to="/products" className="text-primary hover:text-primary-dark font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatCurrency={formatCurrency}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-lg text-gray-600">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Fresh Deals</h2>
            <Link to="/products/offers" className="text-white hover:text-green-100 font-medium flex items-center">
              View All Offers
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {offerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {offerProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatCurrency={formatCurrency}
                  index={index}
                  theme="light"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white bg-opacity-10 rounded-lg">
              <p className="text-lg">No special offers available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-12 px-4 bg-background-light">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark">Best Sellers</h2>
            <Link to="/products/popular" className="text-primary hover:text-primary-dark font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  formatCurrency={formatCurrency}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-lg text-gray-600">No best sellers available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-background-dark">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-text-dark">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <motion.div 
                key={feature.id}
                className="bg-white p-6 rounded-xl shadow-md text-center"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-text-dark">{feature.title}</h3>
                <p className="text-text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Fresh Updates to Your Inbox</h2>
          <p className="text-lg mb-8 text-green-100">Get seasonal recipes, harvest updates, and exclusive deals on fresh produce.</p>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <motion.button 
              className="bg-white text-purple-700 px-6 py-3 rounded-lg font-bold hover:bg-purple-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </div>
          <p className="text-sm mt-4 text-purple-200">By subscribing, you agree to our Privacy Policy and Terms of Service.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;