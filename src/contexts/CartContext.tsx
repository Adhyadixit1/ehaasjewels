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

interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  isFirstOrderOnly: boolean;
  description: string;
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
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  appliedPromoCode: PromoCode | null;
  promoCodeDiscount: number;
  isFirstOrder: boolean;
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

// Define available promo codes
const PROMO_CODES: PromoCode[] = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    value: 10,
    minPurchase: 0,
    isFirstOrderOnly: true,
    description: '10% off on your first order',
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    value: 99, // Assuming 99 is the shipping cost
    minPurchase: 999,
    isFirstOrderOnly: false,
    description: 'Free shipping on orders above ₹999',
  },
  {
    code: 'EXTRA15',
    discountType: 'percentage',
    value: 15,
    minPurchase: 1999,
    maxDiscount: 500,
    isFirstOrderOnly: false,
    description: '15% off (max ₹500) on orders above ₹1999',
  },
];

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
  
  // Promo code state
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPromo = localStorage.getItem('jewellery-ehsaas-promo');
        return savedPromo ? JSON.parse(savedPromo) : null;
      } catch (error) {
        console.error('Error loading promo code from localStorage:', error);
        return null;
      }
    }
    return null;
  });
  
  // Check if it's user's first order
  const [isFirstOrder, setIsFirstOrder] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasOrdered = localStorage.getItem('jewellery-ehsaas-has-ordered');
        return hasOrdered !== 'true';
      } catch (error) {
        console.error('Error checking first order status:', error);
        return true; // Default to true to be safe
      }
    }
    return true;
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

  // Calculate promo code discount
  const calculatePromoDiscount = (totalPrice: number): number => {
    if (!appliedPromoCode) return 0;
    
    const { discountType, value, minPurchase = 0, maxDiscount } = appliedPromoCode;
    
    // Check minimum purchase requirement
    if (totalPrice < minPurchase) return 0;
    
    let discount = 0;
    
    if (discountType === 'percentage') {
      discount = (totalPrice * value) / 100;
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      // Fixed discount
      discount = value;
    }
    
    // Don't let discount exceed the total price
    return Math.min(discount, totalPrice);
  };

  const getDiscountAmount = () => {
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    
    // Calculate base discount based on quantity
    let baseDiscount = 0;
    if (totalItems >= 3) {
      // 300 off for 3+ products
      baseDiscount = 300;
    } else if (totalItems >= 2) {
      // 20% off up to 200 for 2 products
      const discount = (totalPrice * 20) / 100;
      baseDiscount = Math.min(discount, 200);
    }
    
    // Add promo code discount
    const promoDiscount = calculatePromoDiscount(totalPrice);
    
    // Return the higher of the two discounts
    return Math.max(baseDiscount, promoDiscount);
  };
  
  // Track promo code discount separately for display
  const promoCodeDiscount = appliedPromoCode ? calculatePromoDiscount(getTotalPrice()) : 0;

  const getFinalTotal = () => {
    const totalPrice = getTotalPrice();
    const discountAmount = getDiscountAmount();
    return Math.max(0, totalPrice - discountAmount);
  };
  
  // Apply promo code
  const applyPromoCode = (code: string) => {
    const promoCode = PROMO_CODES.find(
      pc => pc.code.toUpperCase() === code.toUpperCase()
    );
    
    if (!promoCode) {
      return { success: false, message: 'Invalid promo code' };
    }
    
    // Check if it's a first-order-only code
    if (promoCode.isFirstOrderOnly && !isFirstOrder) {
      return { 
        success: false, 
        message: 'This promo code is only valid for your first order' 
      };
    }
    
    // Check minimum purchase requirement
    const totalPrice = getTotalPrice();
    if (promoCode.minPurchase && totalPrice < promoCode.minPurchase) {
      return { 
        success: false, 
        message: `Minimum purchase of ₹${promoCode.minPurchase} required for this promo code` 
      };
    }
    
    setAppliedPromoCode(promoCode);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jewellery-ehsaas-promo', JSON.stringify(promoCode));
      } catch (error) {
        console.error('Error saving promo code to localStorage:', error);
      }
    }
    
    return { 
      success: true, 
      message: `Promo code applied: ${promoCode.description}` 
    };
  };
  
  // Remove promo code
  const removePromoCode = () => {
    setAppliedPromoCode(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('jewellery-ehsaas-promo');
      } catch (error) {
        console.error('Error removing promo code from localStorage:', error);
      }
    }
  };
  
  // Mark that user has placed an order
  const markOrderPlaced = () => {
    setIsFirstOrder(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jewellery-ehsaas-has-ordered', 'true');
      } catch (error) {
        console.error('Error saving order status to localStorage:', error);
      }
    }
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
    applyPromoCode,
    removePromoCode,
    appliedPromoCode,
    promoCodeDiscount,
    isFirstOrder,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};