import { supabase } from '@/integrations/supabase/client';

export interface WishlistItem {
  id: bigint;
  user_id: string;
  product_id: bigint;
  created_at: string;
}

class WishlistService {
  // Get all wishlist items for the current user
  async getWishlistItems(): Promise<WishlistItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist items:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWishlistItems:', error);
      throw error;
    }
  }

  // Add a product to wishlist
  async addToWishlist(productId: bigint): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          product_id: Number(productId)
        });

      if (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in addToWishlist:', error);
      throw error;
    }
  }

  // Remove a product from wishlist
  async removeFromWishlist(productId: bigint): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', Number(productId));

      if (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in removeFromWishlist:', error);
      throw error;
    }
  }

  // Check if a product is in user's wishlist
  async isInWishlist(productId: bigint): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', Number(productId))
        .limit(1);

      if (error) {
        console.error('Error checking wishlist status:', error);
        throw error;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in isInWishlist:', error);
      return false;
    }
  }

  // Get wishlist count for current user
  async getWishlistCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }

      const { data, error } = await supabase
        .from('wishlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error getting wishlist count:', error);
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in getWishlistCount:', error);
      return 0;
    }
  }

  // Toggle product in wishlist (add if not exists, remove if exists)
  async toggleWishlist(productId: bigint): Promise<boolean> {
    try {
      const isInWish = await this.isInWishlist(productId);
      
      if (isInWish) {
        await this.removeFromWishlist(productId);
        return false;
      } else {
        await this.addToWishlist(productId);
        return true;
      }
    } catch (error) {
      console.error('Error in toggleWishlist:', error);
      throw error;
    }
  }
}

export default new WishlistService();
