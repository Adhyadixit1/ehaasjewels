import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProductService } from '@/services/ProductService';
import ProductCarousel from '@/components/ui/ProductCarousel';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: string;
  reviews: number;
  image: string;
  description: string;
}

interface CartUpsellProps {
  cartItems: any[];
}

const CartUpsell: React.FC<CartUpsellProps> = ({ cartItems }) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [frequentlyBoughtTogether, setFrequentlyBoughtTogether] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpsellProducts = async () => {
      if (cartItems.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get related products with error handling
        if (cartItems.length > 0) {
          try {
            const firstItemId = cartItems[0].id.split('-')[0]; // Extract product ID from cart item ID
            const relatedProducts = await ProductService.getRelatedProducts(firstItemId, 3);
            setRelatedProducts(relatedProducts.map(convertToProductCardFormat));
          } catch (error) {
            console.error('Error fetching related products:', error);
            setRelatedProducts([]);
          }
        }

        // Get featured products as frequently bought together suggestions
        try {
          const featuredProducts = await ProductService.getFeaturedProducts(4);
          setFrequentlyBoughtTogether(featuredProducts.map(convertToProductCardFormat));
        } catch (error) {
          console.error('Error fetching featured products:', error);
          setFrequentlyBoughtTogether([]);
        }

        // Get additional recommendations
        try {
          const allProductsResponse = await ProductService.getProducts(1, 6);
          setRecommendations(allProductsResponse.products.map(convertToProductCardFormat));
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        }

      } catch (error) {
        console.error('Error fetching upsell products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpsellProducts();
  }, [cartItems]);

  // Convert product data to match ProductCard interface
  const convertToProductCardFormat = (product: any): Product => {
    const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                       product.product_images?.[0]?.image_url || 
                       '/placeholder.svg';
    
    return {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      rating: '4.5', // Default rating
      reviews: Math.floor(Math.random() * 100) + 1, // Random review count
      image: primaryImage,
      description: product.description || product.short_description || ''
    };
  };

  // Mock handlers for ProductCard
  const handleOpenFullscreen = (product: Product) => {
    // Navigate to product detail page
    window.location.href = `/product/${product.id}`;
  };

  const handleToggleWishlist = async (id: bigint) => {
    // Mock wishlist toggle
    return false;
  };

  const handleShare = (product: Product) => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Combine all products into one carousel with unique IDs
  const allProducts = [...frequentlyBoughtTogether, ...relatedProducts, ...recommendations]
    .slice(0, 4)
    .map((product, index) => ({
      ...product,
      id: `${product.id}-${index}` // Create unique ID to avoid key conflicts
    }));

  return (
    <div className="space-y-1">
      {/* Combined Products Carousel */}
      {allProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProductCarousel
            products={allProducts}
            title="You May Also Like"
            onOpenFullscreen={handleOpenFullscreen}
            onToggleWishlist={handleToggleWishlist}
            onShare={handleShare}
            isWishlisted={false}
          />
        </motion.div>
      )}
    </div>
  );
};

export default CartUpsell;