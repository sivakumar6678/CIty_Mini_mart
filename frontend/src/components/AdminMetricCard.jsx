import React from 'react';
import { motion } from 'framer-motion';

const AdminMetricCard = ({ title, value, icon, color, index }) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-500',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
      iconText: 'text-green-500',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-500',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-500',
      border: 'border-orange-200'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      iconText: 'text-red-500',
      border: 'border-red-200'
    }
  };

  const colorClass = colors[color] || colors.blue;

  return (
    <motion.div 
      className={`${colorClass.bg} rounded-xl shadow-md border ${colorClass.border} p-6`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center">
        <div className={`${colorClass.iconBg} p-3 rounded-full mr-4`}>
          <span className={`${colorClass.iconText}`}>
            {icon}
          </span>
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className={`${colorClass.text} text-2xl font-bold mt-1`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminMetricCard;