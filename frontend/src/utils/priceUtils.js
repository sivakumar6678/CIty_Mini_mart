// frontend/src/utils/priceUtils.js

/**
 * Calculate the discounted price of a product
 * @param {number} price - The original price
 * @param {number} discountPercentage - The discount percentage (0-100)
 * @returns {number} - The discounted price
 */
export const calculateDiscountedPrice = (price, discountPercentage) => {
  if (typeof price !== 'number' || typeof discountPercentage !== 'number') return price;
  if (discountPercentage <= 0) return price;
  return price - (price * (discountPercentage / 100));
};

/**
 * Format a price as currency
 * @param {number} amount - The amount to format
 * @param {boolean} minimizeFractions - Whether to minimize fraction digits
 * @returns {string} - The formatted currency string
 */
export const formatCurrency = (amount, minimizeFractions = false) => {
  if (typeof amount !== 'number') return 'N/A';
  return amount.toLocaleString('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    minimumFractionDigits: minimizeFractions ? 0 : 2,
    maximumFractionDigits: minimizeFractions ? 0 : 2
  });
};