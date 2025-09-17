import React from 'react';
import { motion } from 'framer-motion';
import ehsaasLogo from '@/assets/ehsaas-logo.png';

interface AppLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AppLoading({ message = 'Loading...', size = 'md' }: AppLoadingProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Pulsating Logo */}
      <motion.div
        className={sizeClasses[size]}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src={ehsaasLogo} 
          alt="एहसास Jewellery" 
          className="w-full h-full object-contain"
        />
      </motion.div>
      
      {/* Optional message */}
      {message && (
        <motion.p
          className={`${textSizeClasses[size]} text-muted-foreground font-medium`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// Full page loading component
export function FullPageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AppLoading message={message} size="lg" />
    </div>
  );
}

// Inline loading component for smaller areas
export function InlineLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <AppLoading message={message} size="sm" />
    </div>
  );
}
