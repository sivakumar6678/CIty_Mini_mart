import React from 'react';
import { motion } from 'framer-motion';

const CartItem = ({ item, updateQuantity, removeFromCart, formatCurrency, index }) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row items-center justify-between py-4 border-b last:border-b-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
        <div className="relative">
          <img 
            src={item.image_url || `https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`} 
            alt={item.name} 
            className="w-20 h-20 object-cover rounded-md mr-4 shadow-md"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/100x100/E2E8F0/A0AEC0?text=${item.name.charAt(0)}`; }}
          />
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
            {item.quantity}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-600">{formatCurrency(item.price)} each</p>
          {item.shop_name && <p className="text-xs text-gray-500">From: {item.shop_name}</p>}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center space-x-2 border rounded-lg overflow-hidden shadow-sm">
          <motion.button 
            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            -
          </motion.button>
          <span className="px-3 py-1 font-medium">{item.quantity}</span>
          <motion.button 
            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            +
          </motion.button>
        </div>
        
        <div className="text-right min-w-[100px]">
          <p className="font-bold text-gray-800">{formatCurrency(item.price * item.quantity)}</p>
        </div>
        
        <motion.button 
          onClick={() => removeFromCart(item.id)} 
          className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
          title="Remove item"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CartItem;