import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  variantName?: string; // Add variant name property
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Generate a session ID for tracking
const generateSessionId = () => {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  }
  return 'unknown_session';
};

// Track visitor analytics
const trackVisitorAnalytics = async (sessionId: string, action: string) => {
  try {
    // Get user info if available
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('Error getting user info:', userError);
    }
    
    // Get visitor info
    const visitorInfo = {
      session_id: sessionId,
      user_id: user?.id || null,
      ip_address: null, // Would be set by server in real implementation
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      page_url: typeof window !== 'undefined' ? window.location.href : null,
      device_type: typeof window !== 'undefined' ? 
        (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 
         /Tablet|iPad/i.test(navigator.userAgent) ? 'tablet' : 'desktop') : 'unknown',
      country: null // Would be determined by IP in real implementation
    };
    
    console.log('Tracking visitor analytics:', { action, visitorInfo });
    
    // Call the appropriate tracking function based on action
    if (action === 'page_view') {
      // Create or update visitor record
      const params = {
        p_session_id: visitorInfo.session_id,
        p_user_id: visitorInfo.user_id,
        p_ip_address: visitorInfo.ip_address,
        p_user_agent: visitorInfo.user_agent,
        p_page_url: visitorInfo.page_url,
        p_device_type: visitorInfo.device_type,
        p_country: visitorInfo.country
      };
      
      console.log('Calling get_or_create_visitor_session with params:', params);
      
      const { data, error } = await supabase.rpc('get_or_create_visitor_session', params);
      
      if (error) {
        console.error('Error tracking page view:', error);
        console.error('Parameters sent:', params);
        // Try to get more detailed error information
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('Page view tracked successfully:', data);
      }
    } else if (action === 'add_to_cart') {
      // Increment cart additions
      const params = {
        p_session_id: sessionId
      };
      
      console.log('Calling increment_cart_additions with params:', params);
      
      const { error } = await supabase.rpc('increment_cart_additions', params);
      
      if (error) {
        console.error('Error tracking add to cart:', error);
        console.error('Session ID:', sessionId);
        // Try to get more detailed error information
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('Add to cart tracked successfully');
      }
    }
  } catch (error) {
    console.error('Error tracking visitor analytics:', error);
    // Log more detailed error information if available
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const sessionId = generateSessionId();
  
  // Initialize cart state from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('jewellery-ehsaas-cart');
        return savedCart ? JSON.parse(savedCart) : [];
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // Save cart items to localStorage whenever cartItems changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jewellery-ehsaas-cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems]);

  // Track initial page view
  useEffect(() => {
    trackVisitorAnalytics(sessionId, 'page_view');
  }, [sessionId]);

  // Track time spent on page and update visit duration in Supabase
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let pageLoadTime = new Date();
    let isActive = true;

    const recordTimeSpent = async () => {
      if (!isActive) return;
      const now = new Date();
      const seconds = Math.floor((now.getTime() - pageLoadTime.getTime()) / 1000);
      if (seconds <= 0) return;

      try {
        const { error } = await supabase.rpc('update_visit_duration', {
          p_session_id: sessionId,
          p_time_spent: seconds,
        });
        if (error) {
          console.error('Error updating visit duration:', error);
        } else {
          console.log('⏱️ Visit duration updated:', seconds, 'seconds');
        }
      } catch (err) {
        console.error('Error calling update_visit_duration:', err);
      } finally {
        // reset counter after sending
        pageLoadTime = new Date();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // tab hidden, record time so far
        recordTimeSpent();
      } else if (document.visibilityState === 'visible') {
        // reset start time when returning
        pageLoadTime = new Date();
      }
    };

    window.addEventListener('beforeunload', recordTimeSpent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', recordTimeSpent);
      // final flush on unmount
      recordTimeSpent();
    };
  }, [sessionId]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity }];
      }
    });
    
    // Track add to cart event
    trackVisitorAnalytics(sessionId, 'add_to_cart');
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    
    if (totalItems >= 3) {
      // 300 off for 3+ products
      return 300;
    } else if (totalItems >= 2) {
      // 20% off upto 200 for 2 products
      const discount = (totalPrice * 20) / 100;
      return Math.min(discount, 200);
    }
    
    return 0;
  };

  const getFinalTotal = () => {
    const totalPrice = getTotalPrice();
    const discountAmount = getDiscountAmount();
    return Math.max(0, totalPrice - discountAmount);
  };

  const getItemQuantity = (itemId: string) => {
    const item = cartItems.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getDiscountAmount,
    getFinalTotal,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};