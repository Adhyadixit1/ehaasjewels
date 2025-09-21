import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { generateRating, generateReviewCount } from '@/utils/reviewData';

interface ProductInfoProps {
  product: any;
  selectedVariant: any;
  rating: number;
  reviewCount: number;
  currentPrice: number;
  originalPrice?: number;
  variants: any[];
  onVariantSelect: (variant: any) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  selectedVariant,
  rating,
  reviewCount,
  currentPrice,
  originalPrice,
  variants,
  onVariantSelect
}) => {
  const renderStars = useMemo(() => (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  }, []);

  const discountPercentage = useMemo(() => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }, [originalPrice, currentPrice]);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center">
            {renderStars(Math.floor(rating))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* Variants Selection */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Select Variant</h3>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => onVariantSelect(variant)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>

          {selectedVariant && (
            <div className="text-sm text-muted-foreground">
              Selected: {selectedVariant.name}
            </div>
          )}
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-black">₹{currentPrice.toLocaleString()}</span>
        {originalPrice && (
          <span className="text-lg text-muted-foreground line-through">
            ₹{originalPrice.toLocaleString()}
          </span>
        )}
        {originalPrice && (
          <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
            {discountPercentage}% OFF
          </span>
        )}
      </div>
    </div>
  );
};
