import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WishlistService, { WishlistItem } from '@/services/WishlistService';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  addToWishlist: (productId: bigint) => Promise<void>;
  removeFromWishlist: (productId: bigint) => Promise<void>;
  toggleWishlist: (productId: bigint) => Promise<boolean>;
  isInWishlist: (productId: bigint) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist items when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated || !user) {
        setWishlistItems([]);
        setWishlistCount(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const items = await WishlistService.getWishlistItems();
        setWishlistItems(items);
        setWishlistCount(items.length);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlistItems([]);
        setWishlistCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [user, isAuthenticated]);

  // Add product to wishlist
  const addToWishlist = async (productId: bigint) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to add to wishlist');
    }

    try {
      await WishlistService.addToWishlist(productId);
      await refreshWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: bigint) => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to remove from wishlist');
    }

    try {
      await WishlistService.removeFromWishlist(productId);
      await refreshWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  // Toggle product in wishlist
  const toggleWishlist = async (productId: bigint): Promise<boolean> => {
    if (!isAuthenticated) {
      throw new Error('User must be authenticated to toggle wishlist');
    }

    try {
      // Optimistic update - check current state and update UI immediately
      const currentlyInWishlist = isInWishlist(productId);
      
      // Update UI optimistically
      if (currentlyInWishlist) {
        // Remove from wishlist items
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        setWishlistCount(prev => Math.max(0, prev - 1));
      } else {
        // Add to wishlist items (create a temporary item)
        const tempItem: WishlistItem = {
          id: BigInt(0), // Temporary ID
          user_id: user?.id || '',
          product_id: productId,
          created_at: new Date().toISOString()
        };
        setWishlistItems(prev => [...prev, tempItem]);
        setWishlistCount(prev => prev + 1);
      }
      
      // Perform the actual toggle operation
      const result = await WishlistService.toggleWishlist(productId);
      
      // Only refresh if there was an error or if we need to sync with server
      // The optimistic update should be correct, so we don't need to refresh immediately
      // We'll let the user continue with the optimistic state
      
      return result;
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling wishlist:', error);
      await refreshWishlist(); // Refresh to get correct state
      throw error;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: bigint): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  // Refresh wishlist data
  const refreshWishlist = async () => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      setWishlistCount(0);
      return;
    }

    try {
      const items = await WishlistService.getWishlistItems();
      setWishlistItems(items);
      setWishlistCount(items.length);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
      setWishlistItems([]);
      setWishlistCount(0);
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
