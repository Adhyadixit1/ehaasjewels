import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '@/services/AnalyticsService';

interface AnalyticsProps {
  children?: React.ReactNode;
}

/**
 * Analytics Component - Handles Google Analytics and Facebook Pixel integration
 * 
 * This component:
 * 1. Initializes analytics scripts when the app loads
 * 2. Tracks page views for single-page application navigation
 * 3. Provides event tracking functionality
 * 4. Automatically reloads scripts when settings change
 */
export function Analytics({ children }: AnalyticsProps) {
  const location = useLocation();
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    const initAnalytics = async () => {
      try {
        await analyticsService.initialize();
        analyticsService.trackPageView();
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    };
    
    initAnalytics();
  }, []);

  useEffect(() => {
    // Track page view when route changes (for SPA navigation)
    if (previousPathRef.current !== location.pathname) {
      analyticsService.trackPageView();
      previousPathRef.current = location.pathname;
    }
  }, [location]);

  return <>{children}</>;
}

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const trackPageView = (url?: string) => {
    analyticsService.trackPageView(url);
  };

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    analyticsService.trackEvent(eventName, parameters);
  };

  const trackPurchase = (orderData: {
    orderId: string;
    value: number;
    currency: string;
    items?: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  }) => {
    analyticsService.trackPurchase(orderData);
  };

  return {
    trackPageView,
    trackEvent,
    trackPurchase,
  };
}

/**
 * Higher-order component for adding analytics to page components
 */
export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) {
  return function WithAnalyticsComponent(props: P) {
    useEffect(() => {
      const initAnalytics = async () => {
        try {
          await analyticsService.initialize();
          analyticsService.trackPageView();
        } catch (error) {
          console.error('Failed to initialize analytics:', error);
        }
      };
      
      initAnalytics();
    }, []);

    useEffect(() => {
      // Track custom page view event if page name is provided
      if (pageName) {
        analyticsService.trackEvent('page_view', {
          page_name: pageName,
          page_path: window.location.pathname
        });
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
}
