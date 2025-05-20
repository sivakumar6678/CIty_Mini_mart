import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Carousel = ({ children, autoPlay = true, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const [isPaused, setIsPaused] = useState(false);

  const childrenArray = React.Children.toArray(children);
  const childCount = childrenArray.length;

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % childCount);
  }, [childCount]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + childCount) % childCount);
  }, [childCount]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, goToNext]);

  // Variants for slide animations
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div 
      className="relative overflow-hidden w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="w-full"
        >
          {childrenArray[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 z-20 text-white"
        onClick={goToPrevious}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full p-2 z-20 text-white"
        onClick={goToNext}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {childrenArray.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;