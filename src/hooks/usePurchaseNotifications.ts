import { useState, useEffect, useCallback } from 'react';
import { getRandomNotification, PurchaseNotification } from '@/data/purchaseNotifications';

export const usePurchaseNotifications = () => {
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback(() => {
    const notification = getRandomNotification();
    setCurrentNotification(notification);
    setIsVisible(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    // Start showing notifications after a 5-second delay
    const initialDelay = setTimeout(() => {
      const notification = getRandomNotification();
      setCurrentNotification(notification);
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible && currentNotification) {
      // Schedule next notification after current one is hidden
      const nextNotificationDelay = Math.random() * 5000 + 10000; // 10-15 seconds
      
      const timer = setTimeout(() => {
        const notification = getRandomNotification();
        setCurrentNotification(notification);
        setIsVisible(true);
      }, nextNotificationDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, currentNotification]);

  return {
    currentNotification: currentNotification ? 
      `${currentNotification.name} from ${currentNotification.state} bought ${currentNotification.product}` : 
      null,
    isVisible,
    hideNotification
  };
};
