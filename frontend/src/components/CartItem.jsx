import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CartItem = ({ item, updateQuantity, removeFromCart, formatCurrency, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [customQuantity, setCustomQuantity] = useState(item.quantity.toString());
  const [showCustomQuantity, setShowCustomQuantity] = useState(false);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomQuantity(value);
    }
  };

  const applyCustomQuantity = () => {
    const quantity = parseInt(customQuantity);
    if (!isNaN(quantity) && quantity > 0) {
      // Check if requested quantity is available
      if (item.quantity_available && quantity > item.quantity_available) {
        alert(`Sorry, only ${item.quantity_available} items are available in stock.`);
        setCustomQuantity(Math.min(item.quantity, item.quantity_available).toString());
      } else {
        updateQuantity(item.id, quantity);
      }
    } else if (quantity === 0) {
      setShowConfirmDelete(true);
    }
    setShowCustomQuantity(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyCustomQuantity();
    } else if (e.key === 'Escape') {
      setShowCustomQuantity(false);
      setCustomQuantity(item.quantity.toString());
    }
  };

  const confirmDelete = () => {
    removeFromCart(item.id);
    setShowConfirmDelete(false);
  };

  return (
    <motion.div 
      className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      exit={{ opacity: 0, x: -100 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmDelete(false)}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Item</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to remove "{item.name}" from your cart?</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => setShowConfirmDelete(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={confirmDelete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Remove
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Image and Info */}
      <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <img 
            src={item.image_url || `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`} 
            alt={item.name} 
            className="w-20 h-20 object-cover rounded-md mr-4 shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
          />
          <motion.span 
            className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          >
            {item.quantity}
          </motion.span>
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-600">{formatCurrency(item.price)} each</p>
          {item.shop_name && (
            <p className="text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              {item.shop_name}
            </p>
          )}
        </div>
      </div>
      
      {/* Quantity Controls and Price */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {/* Quantity Controls */}
        <div className="flex items-center">
          {showCustomQuantity ? (
            <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
              <input
                type="text"
                value={customQuantity}
                onChange={handleQuantityChange}
                onKeyDown={handleKeyDown}
                className="w-16 px-3 py-1 text-center focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
                onBlur={applyCustomQuantity}
              />
              <motion.button
                onClick={applyCustomQuantity}
                className="px-2 py-1 bg-primary text-white hover:bg-primary-dark"
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 border rounded-lg overflow-hidden shadow-sm">
              <motion.button 
                onClick={() => {
                  if (item.quantity === 1) {
                    setShowConfirmDelete(true);
                  } else {
                    updateQuantity(item.id, item.quantity - 1);
                  }
                }} 
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                -
              </motion.button>
              <motion.span 
                className="px-3 py-1 font-medium cursor-pointer"
                onClick={() => {
                  setShowCustomQuantity(true);
                  setCustomQuantity(item.quantity.toString());
                }}
                whileHover={{ backgroundColor: "#f3f4f6" }}
              >
                {item.quantity}
              </motion.span>
              <motion.button 
                onClick={() => {
                  if (item.quantity_available && item.quantity >= item.quantity_available) {
                    alert(`Sorry, only ${item.quantity_available} items are available in stock.`);
                  } else {
                    updateQuantity(item.id, item.quantity + 1);
                  }
                }} 
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                +
              </motion.button>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="text-right min-w-[100px]">
          <motion.p 
            className="font-bold text-gray-800"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {formatCurrency(item.price * item.quantity)}
          </motion.p>
          <p className="text-xs text-gray-500">
            {item.quantity > 1 && `${item.quantity} × ${formatCurrency(item.price)}`}
          </p>
        </div>
        
        {/* Remove Button */}
        <motion.button 
          onClick={() => setShowConfirmDelete(true)} 
          className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 relative group"
          title="Remove item"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full transition-opacity">
            Remove
          </span>
        </motion.button>
      </div>
      
      {/* Save for Later Button - Appears on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.button
            className="absolute top-2 right-2 text-primary hover:text-primary-dark text-xs font-medium flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            Save for later
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartItem;