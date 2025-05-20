/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // Blue-500 - Changed from green to blue
          dark: '#2563eb',    // Blue-600
          light: '#dbeafe',   // Blue-100
        },
        secondary: {
          DEFAULT: '#8b5cf6', // Purple-500
          dark: '#7c3aed',    // Purple-600
          light: '#ede9fe',   // Purple-100
        },
        accent: {
          DEFAULT: '#f97316', // Orange-500
          dark: '#ea580c',    // Orange-600
          light: '#ffedd5',   // Orange-100
        },
        text: {
          dark: '#1e293b',    // Slate-800
          light: '#f8fafc',   // Slate-50
          muted: '#64748b',   // Slate-500
        },
        background: {
          light: '#ffffff',   // White
          dark: '#f1f5f9',    // Slate-100
          card: '#ffffff',    // White
        },
        danger: '#ef4444',    // Red-500
        success: '#22c55e',   // Green-500
        warning: '#eab308',   // Yellow-500
        info: '#06b6d4',      // Cyan-500
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
  safelist: [
    // Basic utility classes
    'bg-white',
    'p-8',
    'rounded-xl',
    'shadow-lg',
    'text-center',
    'text-3xl',
    'font-extrabold',
    'text-gray-900',
    'mb-2',
    'mt-6',
    'text-sm',
    'text-gray-600',
    'font-medium',
    'mb-4',
    'block',
    'text-gray-700',
    'mb-1',
    'appearance-none',
    'rounded-md',
    'relative',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'border-gray-300',
    'placeholder-gray-500',
    'focus:outline-none',
    'focus:ring-primary',
    'focus:border-primary',
    'py-2',
    'px-4',
    'border-transparent',
    'text-white',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:bg-gray-400',
    'transition-colors',
    'duration-200',
    
    // Custom color classes
    'text-primary',
    'hover:text-primary-dark',
    'bg-primary',
    'hover:bg-primary-dark',
    'bg-primary-light',
    'text-primary-dark',
    'border-primary',
    'focus:ring-primary',
    'focus:border-primary',
    'bg-secondary',
    'text-secondary',
    'bg-danger',
    'hover:bg-danger',
    'text-danger',
    'bg-success',
    'text-success',
    'bg-warning',
    'text-warning',
    'bg-info',
    'text-info',
    'text-text-dark',
    'text-text-light',
    'bg-background-light',
    'bg-background-dark',
    
    // Filter and category classes
    'bg-blue-100',
    'text-blue-800',
    'bg-green-100',
    'text-green-800',
    'bg-yellow-100',
    'text-yellow-800',
    'bg-red-100',
    'text-red-800',
    'bg-purple-100',
    'text-purple-800',
    'bg-orange-100',
    'text-orange-800',
    'bg-pink-100',
    'text-pink-800',
    'bg-indigo-100',
    'text-indigo-800',
    'bg-gray-100',
    'text-gray-800',
    'bg-blue-600',
    'bg-indigo-700',
    'from-blue-600',
    'to-indigo-700',
    'from-green-500',
    'to-emerald-700',
    'from-purple-600',
    'to-indigo-800',
    'bg-opacity-90',
    'bg-opacity-60',
    'bg-opacity-40',
    'bg-opacity-30',
    'bg-opacity-20',
    'bg-opacity-10',
    'hover:bg-opacity-50',
    'hover:bg-blue-50',
    'hover:bg-white',
    'hover:text-blue-700',
    'text-blue-700',
    'text-blue-100',
    'text-green-600',
    'text-green-700',
    'text-red-600',
    'text-red-700',
    'border-red-100',
    'border-red-500',
    'border-yellow-500',
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'border-l-4',
    'bg-red-50',
    'bg-yellow-50',
    'bg-green-50',
    'bg-blue-50',
    'bg-purple-50',
    'bg-gray-50',
  ]
}