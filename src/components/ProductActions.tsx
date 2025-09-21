import React, { useState, useCallback } from 'react';
import { ShoppingBag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LowStockCounter from '@/components/fomo/LowStockCounter';
import UrgencyMessaging from '@/components/fomo/UrgencyMessaging';

interface ProductActionsProps {
  product: any;
  selectedVariant: any;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  cartQuantity: number;
  isActive: boolean;
}

export const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  cartQuantity,
  isActive
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      onAddToCart();
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  }, [onAddToCart]);

  const handleBuyNow = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      onBuyNow();
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  }, [onBuyNow]);

  const stockQuantity = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;
  const canAddToCart = isActive && stockQuantity > 0;

  return (
    <div className="space-y-4">
      {/* Quantity Selection */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center border border-border rounded-lg">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-muted transition-colors"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 border-x border-border min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="p-2 hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-800"
          size="lg"
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAddingToCart}
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {canAddToCart ? (
            cartQuantity > 0 ? `In Cart (${cartQuantity + quantity})` : `Add ${quantity} to Cart`
          ) : (
            'Out of Stock'
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleBuyNow}
          disabled={!canAddToCart || isAddingToCart}
        >
          {canAddToCart ? 'Buy Now' : 'Out of Stock'}
        </Button>
      </div>

      {/* FOMO Components */}
      <div className="space-y-3">
        <LowStockCounter stockQuantity={stockQuantity} />
        <UrgencyMessaging />
      </div>
    </div>
  );
};
