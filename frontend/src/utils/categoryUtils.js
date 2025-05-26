// frontend/src/utils/categoryUtils.js

/**
 * Product categories with metadata
 */
export const PRODUCT_CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥦',
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-200',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    color: 'bg-red-100 text-red-800',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-200',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-200',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: '🍞',
    color: 'bg-yellow-100 text-yellow-800',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-200',
  },
  {
    id: 'meat',
    name: 'Meat',
    icon: '🥩',
    color: 'bg-red-100 text-red-800',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-200',
  },
  {
    id: 'seafood',
    name: 'Seafood',
    icon: '🐟',
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-200',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    icon: '🍿',
    color: 'bg-orange-100 text-orange-800',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-200',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    icon: '🥤',
    color: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-200',
  },
  {
    id: 'household',
    name: 'Household',
    icon: '🧹',
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-200',
  },
  {
    id: 'organic',
    name: 'Organic',
    icon: '🌱',
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-200',
  },
];

/**
 * Get category by ID
 * @param {string} id - Category ID
 * @returns {Object|undefined} - Category object or undefined if not found
 */
export const getCategoryById = (id) => {
  return PRODUCT_CATEGORIES.find(category => category.id.toLowerCase() === id.toLowerCase());
};

/**
 * Get category by name
 * @param {string} name - Category name
 * @returns {Object|undefined} - Category object or undefined if not found
 */
export const getCategoryByName = (name) => {
  return PRODUCT_CATEGORIES.find(category => category.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get emoji for category
 * @param {string} categoryName - Category name
 * @returns {string} - Emoji for the category
 */
export const getCategoryEmoji = (categoryName) => {
  const category = getCategoryByName(categoryName);
  return category ? category.icon : '📦';
};

/**
 * Get all category names
 * @returns {string[]} - Array of category names
 */
export const getAllCategoryNames = () => {
  return PRODUCT_CATEGORIES.map(category => category.name);
};

/**
 * Get all category IDs
 * @returns {string[]} - Array of category IDs
 */
export const getAllCategoryIds = () => {
  return PRODUCT_CATEGORIES.map(category => category.id);
};