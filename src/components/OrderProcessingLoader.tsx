import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, User, Package, CreditCard, Truck } from 'lucide-react';
import ehsaasLogo from '@/assets/ehsaas-logo.png';

interface OrderProcessingLoaderProps {
  isOpen: boolean;
  onComplete?: () => void;
}

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in-progress' | 'completed';
  delay: number;
}

export function OrderProcessingLoader({ isOpen, onComplete }: OrderProcessingLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: 'validating',
      title: 'Validating Order',
      description: 'Checking your order details...',
      icon: <Clock className="w-5 h-5" />,
      status: 'pending',
      delay: 1000
    },
    {
      id: 'creating-profile',
      title: 'Creating Profile',
      description: 'Setting up your account...',
      icon: <User className="w-5 h-5" />,
      status: 'pending',
      delay: 2000
    },
    {
      id: 'processing-payment',
      title: 'Processing Payment',
      description: 'Preparing your payment method...',
      icon: <CreditCard className="w-5 h-5" />,
      status: 'pending',
      delay: 1500
    },
    {
      id: 'creating-order',
      title: 'Creating Order',
      description: 'Generating your order number...',
      icon: <Package className="w-5 h-5" />,
      status: 'pending',
      delay: 2000
    },
    {
      id: 'preparing-shipment',
      title: 'Preparing Shipment',
      description: 'Getting your order ready for delivery...',
      icon: <Truck className="w-5 h-5" />,
      status: 'pending',
      delay: 1500
    }
  ]);

  useEffect(() => {
    if (!isOpen) {
      // Reset steps when loader is closed
      setSteps(steps.map(step => ({ ...step, status: 'pending' })));
      setCurrentStep(0);
      return;
    }

    // Start processing sequence
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Mark current step as in-progress
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'in-progress' } : step
        ));
        setCurrentStep(i);

        // Wait for the step delay
        await new Promise(resolve => setTimeout(resolve, steps[i].delay));

        // Mark step as completed
        setSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed' } : step
        ));
      }

      // Call onComplete when all steps are done
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    };

    processSteps();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-20 h-20 mx-auto mb-4"
          >
            <img 
              src={ehsaasLogo} 
              alt="एहसास Jewellery" 
              className="w-full h-full object-contain"
            />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-luxury mb-2"
          >
            Processing Your Order
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Please wait while we prepare your order...
          </motion.p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                  step.status === 'completed' 
                    ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                    : step.status === 'in-progress'
                    ? 'bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                    : 'bg-muted/30'
                }`}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : step.status === 'in-progress'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    step.status === 'completed' 
                      ? 'text-green-700 dark:text-green-300' 
                      : step.status === 'in-progress'
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    step.status === 'completed' 
                      ? 'text-green-600 dark:text-green-400' 
                      : step.status === 'in-progress'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* Progress indicator for current step */}
                {step.status === 'in-progress' && (
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            This will only take a few moments...
          </p>
          <div className="mt-4 flex justify-center">
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-luxury"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
