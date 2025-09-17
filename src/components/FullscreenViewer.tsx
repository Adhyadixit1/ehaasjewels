import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: string;
  reviews: number;
  image: string;
  description: string;
}

interface FullscreenViewerProps {
  product: Product;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleWishlist: (id: string) => void;
  onShare: (product: Product) => void;
  isWishlisted: boolean;
}

export function FullscreenViewer({
  product,
  onClose,
  onNext,
  onPrev,
  onToggleWishlist,
  onShare,
  isWishlisted
}: FullscreenViewerProps) {
  const startX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX.current;
    
    if (deltaX < -60) onNext();
    if (deltaX > 60) onPrev();
    
    startX.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-background"
    >
      <div 
        className="relative h-full w-full flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <Button variant="glass" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
            Close
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="glass" 
              size="sm" 
              onClick={() => onToggleWishlist(product.id)}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button variant="glass" size="sm" onClick={() => onShare(product)}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/40 transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/40 transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Main image */}
        <div className="flex-1 relative overflow-hidden">
          <motion.img
            key={product.id}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-overlay" />
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="absolute bottom-6 left-4 right-4"
        >
          <div className="backdrop-blur-md bg-card/90 rounded-2xl p-4 shadow-luxury border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xl font-bold text-black">₹{product.price.toLocaleString()}</span>
                  <div className="text-sm text-muted-foreground">
                    ⭐ {product.rating} • {product.reviews} reviews
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="luxury" className="flex-1">
                Buy Now
              </Button>
              <Button className="bg-pink-200 hover:bg-pink-300 text-gray-800">
                Add to Cart
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Product details */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-card border-t border-border p-4 space-y-3"
        >
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Care Instructions</h3>
            <p className="text-xs text-muted-foreground">Keep dry and avoid contact with perfumes. Store in a soft cloth pouch.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}