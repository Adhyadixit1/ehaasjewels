import { useState, useEffect, useRef } from 'react';
import { ProductCard } from './ProductCard';
import { ProductService } from '@/services/ProductService';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { generateReviewCount, generateRating } from '@/utils/reviewData';
import { InlineLoading } from '@/components/AppLoading';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: string;
  reviews: number;
  image: string;
  description: string;
}

interface ProductRecommendationsProps {
  currentProductId?: string;
}

export default function ProductRecommendations({ currentProductId }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = window.location; // Using window.location for navigation

  // Check if element is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        root: null,
        rootMargin: '100px', // Load 100px before entering viewport
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load products when component becomes visible
  useEffect(() => {
    if (isVisible && products.length === 0) {
      loadProducts();
    }
  }, [isVisible, products.length]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Small delay to prioritize main content loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let fetchedProducts;
      
      if (currentProductId) {
        // Get related products if we have a current product ID
        fetchedProducts = await ProductService.getRelatedProducts(currentProductId, 4);
      } else {
        // Get first products if no current product ID
        const firstProducts = await ProductService.getProducts(1, 4);
        fetchedProducts = firstProducts;
      }
      
      // Format products for ProductCard component
      const formattedProducts = fetchedProducts.map((product: any) => {
        // Get primary image or first image
        const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                           product.product_images?.[0]?.image_url || 
                           '';
        
        // Generate consistent review data
        const reviewCount = generateReviewCount(product.id.toString());
        const rating = generateRating(product.id.toString());
        
        return {
          id: product.id.toString(),
          name: product.name,
          price: product.price,
          rating: rating.toFixed(1),
          reviews: reviewCount,
          image: primaryImage,
          description: product.description || product.short_description || ''
        };
      });
      
      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFullscreen = (product: Product) => {
    window.location.href = `/product/${product.id}`;
  };

  const handleToggleWishlist = async (id: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to use wishlist',
        variant: 'destructive',
      });
      window.location.href = '/profile';
      return false;
    }
    
    try {
      await toggleWishlist(BigInt(id));
      return true;
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  };

  const handleShare = (product: Product) => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: `${window.location.origin}/product/${product.id}`,
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // Silently handle share errors
      });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: 'Link Copied',
        description: 'Product link copied to clipboard',
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, 1);
    
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  if (!isVisible) {
    // Show placeholder while not visible
    return (
      <div ref={ref} className="border-t border-border p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-1/3"></div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-t border-border p-4">
        <InlineLoading message="Loading recommendations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-border p-4">
        <h3 className="font-semibold mb-4">You Might Also Like</h3>
        <p className="text-red-500 text-center py-4">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="border-t border-border p-4">
      <h3 className="font-semibold mb-4">You Might Also Like</h3>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((product, index) => (
          <div key={`${product.id}-${index}`} className="aspect-[3/4]">
            <ProductCard
              product={product}
              onOpenFullscreen={handleOpenFullscreen}
              onToggleWishlist={(id: bigint) => handleToggleWishlist(id.toString())}
              onShare={handleShare}
              isWishlisted={isInWishlist(BigInt(product.id))}
              index={index}
              variant="ultra-compact" // Use ultra-compact variant with only add to cart button
            />

          </div>
        ))}
      </div>
    </div>
  );
}