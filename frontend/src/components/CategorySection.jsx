// frontend/src/components/CategorySection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PRODUCT_CATEGORIES } from '../utils/categoryUtils';

const CategorySection = ({ city }) => {
  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Item animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of product categories to find exactly what you need.
            {city && ` All products are available for delivery in ${city}.`}
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {PRODUCT_CATEGORIES.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                to={city ? `/products/city/${city}/category/${category.id}` : `/products/category/${category.id}`}
                className={`block p-6 rounded-xl border ${category.borderColor} ${category.color} ${category.hoverColor} transition-all duration-200 transform hover:scale-105 hover:shadow-md text-center h-full flex flex-col justify-center items-center`}
              >
                <span className="text-4xl mb-3" role="img" aria-label={category.name}>
                  {category.icon}
                </span>
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-10">
          <Link
            to={city ? `/products/city/${city}` : "/products"}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
          >
            View All Products
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;