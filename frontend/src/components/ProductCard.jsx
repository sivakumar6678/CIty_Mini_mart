import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { calculateDiscountedPrice } from '../utils/priceUtils';

// Helper function to get emoji for category
const getCategoryEmoji = (category) => {
  switch (category) {
    case 'Fruits': return '🍎';
    case 'Vegetables': return '🥦';
    case 'Leafy Greens': return '🥬';
    case 'Dairy': return '🥛';
    case 'Organic': return '🌱';
    case 'Seasonal': return '🍓';
    case 'Bakery': return '🍞';
    case 'Meat': return '🥩';
    case 'Seafood': return '🐟';
    case 'Pantry': return '🥫';
    case 'Beverages': return '🥤';
    case 'Snacks': return '🍿';
    case 'Household': return '🧹';
    case 'Personal Care': return '🧴';
    default: return '📦';
  }
};

const ProductCard = ({ product, onAddToCart, isCustomer, formatCurrency }) => {
  const handleAddToCart = () => {
    // Create a clone of the image that will fly to the cart
    const imgElement = document.getElementById(`product-img-${product.id}`);
    if (imgElement && onAddToCart) {
      // Create flying element
      const flyingImg = imgElement.cloneNode(true);
      const rect = imgElement.getBoundingClientRect();
      const cartIcon = document.querySelector('.cart-icon');
      
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect();
        
        flyingImg.style.position = 'fixed';
        flyingImg.style.top = `${rect.top}px`;
        flyingImg.style.left = `${rect.left}px`;
        flyingImg.style.width = `${rect.width}px`;
        flyingImg.style.height = `${rect.height}px`;
        flyingImg.style.zIndex = 1000;
        flyingImg.style.opacity = 0.8;
        flyingImg.style.borderRadius = '8px';
        flyingImg.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
        
        document.body.appendChild(flyingImg);
        
        // Start animation in the next frame
        setTimeout(() => {
          flyingImg.style.top = `${cartRect.top + 10}px`;
          flyingImg.style.left = `${cartRect.left + 10}px`;
          flyingImg.style.width = '20px';
          flyingImg.style.height = '20px';
          flyingImg.style.opacity = 0.5;
          
          // Remove the element after animation completes
          setTimeout(() => {
            if (document.body.contains(flyingImg)) {
              document.body.removeChild(flyingImg);
            }
            // Call the actual add to cart function
            onAddToCart(product);
          }, 800);
        }, 10);
      } else {
        // If cart icon not found, just add to cart normally
        onAddToCart(product);
      }
    } else {
      // Fallback if image element not found
      onAddToCart(product);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative overflow-hidden group">
        <img 
          id={`product-img-${product.id}`}
          src={product.image_url || `https://placehold.co/600x400/E2E8F0/A0AEC0?text=${product.name.charAt(0)}`} 
          alt={product.name} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src=`https://placehold.co/600x400/E2E8F0/A0AEC0?text=${product.name.charAt(0)}`; 
          }}
        />
        <div className="absolute top-2 right-2 flex flex-col items-end">
          {product.discount_percentage > 0 ? (
            <>
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md mb-1">
                {product.discount_percentage}% OFF
              </div>
              <div className="flex items-center">
                <span className="bg-gray-200 text-gray-500 text-xs line-through px-2 py-1 rounded-full mr-1">
                  {formatCurrency(product.price)}
                </span>
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {formatCurrency(calculateDiscountedPrice(product.price, product.discount_percentage))}
                </span>
              </div>
            </>
          ) : (
            <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              {formatCurrency(product.price)}
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm text-gray-500">{product.shop_name || 'Unknown Shop'}</p>
        </div>
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-sm text-gray-500">
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </p>
        </div>
        
        {product.category && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
              {getCategoryEmoji(product.category)} {product.category}
            </span>
          </div>
        )}
        
        {isCustomer ? (
          <motion.button
            onClick={handleAddToCart}
            disabled={product.quantity <= 0}
            className={`mt-auto w-full font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center ${
              product.quantity > 0 
                ? "bg-primary hover:bg-primary-dark text-white" 
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
            whileHover={product.quantity > 0 ? { scale: 1.03 } : {}}
            whileTap={product.quantity > 0 ? { scale: 0.97 } : {}}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </motion.button>
        ) : (
          <Link 
            to="/login"
            className="mt-auto text-center w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Login to Add
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;