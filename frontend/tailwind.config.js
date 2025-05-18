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
          DEFAULT: '#10b981', // Same as var(--primary-color)
          dark: '#047857',    // Same as var(--primary-dark)
          light: '#d1fae5',   // Same as var(--primary-light)
        },
        secondary: {
          DEFAULT: '#f59e0b', // Same as var(--secondary-color)
        },
        text: {
          dark: '#1f2937',    // Same as var(--text-dark)
          light: '#f9fafb',   // Same as var(--text-light)
        },
        background: {
          light: '#ffffff',   // Same as var(--background-light)
          dark: '#f3f4f6',    // Same as var(--background-dark)
        },
        danger: '#ef4444',    // Same as var(--danger)
        success: '#10b981',   // Same as var(--success)
        warning: '#f59e0b',   // Same as var(--warning)
        info: '#3b82f6',      // Same as var(--info)
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
  ]
}