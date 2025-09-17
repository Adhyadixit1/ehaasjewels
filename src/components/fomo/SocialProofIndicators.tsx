import React, { useState, useEffect } from 'react';
import { Users, Eye, Heart, TrendingUp, Star, Shield } from 'lucide-react';

interface SocialProofIndicatorsProps {
  productId: string;
  rating?: number;
  reviewCount?: number;
}

const SocialProofIndicators: React.FC<SocialProofIndicatorsProps> = ({
  productId,
  rating = 4.5,
  reviewCount = 127
}) => {
  const [viewCount, setViewCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentViewers, setRecentViewers] = useState(0);

  useEffect(() => {
    // Simulate view count based on product ID (static values instead of continuous updates)
    const baseViews = parseInt(productId) * 47 + 234;
    const randomViews = Math.floor(Math.random() * 100);
    setViewCount(baseViews + randomViews);

    // Simulate wishlist count
    const baseWishlist = parseInt(productId) * 12 + 45;
    const randomWishlist = Math.floor(Math.random() * 20);
    setWishlistCount(baseWishlist + randomWishlist);

    // Simulate recent viewers (people viewing now) - reduced frequency
    const updateRecentViewers = () => {
      const viewers = Math.floor(Math.random() * 15) + 3;
      setRecentViewers(viewers);
    };

    updateRecentViewers();
    // Reduced update frequency from 30 seconds to 60 seconds
    const interval = setInterval(updateRecentViewers, 60000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="space-y-3">
      {/* People viewing now */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="relative">
          <Eye className="w-5 h-5 text-blue-600" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">
              {recentViewers} people viewing this product
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <div className="text-xs text-blue-700">Popular choice right now</div>
        </div>
      </div>

      {/* Total views */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <TrendingUp className="w-5 h-5 text-gray-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">
            {viewCount.toLocaleString()} views this month
          </div>
          <div className="text-xs text-gray-600">High demand product</div>
        </div>
      </div>

      {/* Wishlist count */}
      <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
        <Heart className="w-5 h-5 text-pink-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-pink-900">
            {wishlistCount} people have this in wishlist
          </div>
          <div className="text-xs text-pink-700">Customer favorite</div>
        </div>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
        <Shield className="w-5 h-5 text-green-600" />
        <div className="flex-1">
          <div className="text-sm font-medium text-green-900">
            Authenticity Guaranteed
          </div>
          <div className="text-xs text-green-700">100% genuine products</div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofIndicators;