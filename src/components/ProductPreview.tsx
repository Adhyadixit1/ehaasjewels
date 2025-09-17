import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';

interface ProductPreviewProps {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  rating?: number;
  review_count?: number;
  short_description?: string;
  stock_quantity: number;
  is_active: boolean;
}

export function ProductPreview({ 
  id, 
  name, 
  price, 
  sale_price, 
  image_url,
  rating = 0,
  review_count = 0,
  short_description,
  stock_quantity,
  is_active
}: ProductPreviewProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentPrice = sale_price || price;
  const originalPrice = sale_price ? price : undefined;
  const discountPercentage = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-full"></div>
          </div>
        )}
        
        {image_url && !imageError ? (
          <img
            src={image_url}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-gray-400 text-4xl">?</div>
          </div>
        )}
        
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{name}</h3>
        
        {short_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{short_description}</p>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs ml-1">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-400">({review_count})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">₹{currentPrice.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
            )}
          </div>
          
          <Button 
            size="sm" 
            className="h-7 px-2 text-xs"
            disabled={!is_active || stock_quantity <= 0}
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart functionality would go here
            }}
          >
            <ShoppingBag className="w-3 h-3 mr-1" />
            Cart
          </Button>
        </div>
      </div>
    </div>
  );
}