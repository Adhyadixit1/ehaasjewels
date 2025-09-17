import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Only show loading on initial app load
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 50); // Minimal delay to ensure smooth transition

      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  return (
    <>
      {isInitialLoad ? (
        // Minimal initial loading state without conflicting with splash screen
        <div className="min-h-screen flex items-center justify-center bg-background">
          {children}
        </div>
      ) : (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}