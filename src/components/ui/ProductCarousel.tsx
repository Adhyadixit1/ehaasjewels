import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: string;
  reviews: number;
  image: string;
  description: string;
}

interface ProductCarouselProps {
  products: Product[];
  title: string;
  onOpenFullscreen: (product: Product) => void;
  onToggleWishlist: (id: bigint) => Promise<boolean>;
  onShare: (product: Product) => void;
  isWishlisted: boolean;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  title,
  onOpenFullscreen,
  onToggleWishlist,
  onShare,
  isWishlisted
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= products.length - 4 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 4 : prevIndex - 1
    );
  };

  if (products.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-foreground text-xs">{title}</h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            className="w-6 h-6 p-0"
            disabled={products.length <= 4}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            className="w-6 h-6 p-0"
            disabled={products.length <= 4}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-0.5"
          animate={{ x: -currentIndex * (100 / 4) + '%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={`${product.id}-${index}`}
              className="flex-shrink-0 w-[calc(25%-0.9px)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onOpenFullscreen={onOpenFullscreen}
                onToggleWishlist={onToggleWishlist}
                onShare={onShare}
                isWishlisted={isWishlisted}
                index={index}
                variant="ultra-compact"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductCarousel;