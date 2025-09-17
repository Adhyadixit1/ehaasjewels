import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/ProductCard';
import { StoryStrip } from '@/components/StoryStrip';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { FullscreenViewer } from '@/components/FullscreenViewer';
import { StoryViewer } from '@/components/StoryViewer';
import { FeedReelPost } from '@/components/FeedReelPost';
import { Button } from '@/components/ui/button';
import { Grid, List, Heart } from 'lucide-react';
import { AppLoading } from "@/components/AppLoading";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { useMotionBlur } from '@/hooks/useMotionBlur';

// Import generated images
import heroJewelry from '@/assets/hero-jewelry.jpg';
import jewelry1 from '@/assets/jewelry-1.jpg';
import jewelry2 from '@/assets/jewelry-2.jpg';
import jewelry3 from '@/assets/jewelry-3.jpg';

// Updated Product interface to match database
interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  average_rating?: number;
  review_count?: number;
  description?: string;
  short_description?: string;
  product_images?: {
    image_url: string;
    is_primary: boolean;
    media_type?: string; // image | video
  }[];
  categories?: {
    name: string;
  };
}

// Helper: get the best image URL for non-reels contexts (exclude videos)
const getProductImage = (product: Product) => {
  const images = product.product_images || [];
  // Prefer primary non-video image
  const primaryImage = images.find(img => img.is_primary && img.media_type !== 'video');
  if (primaryImage?.image_url) return primaryImage.image_url;
  // Fallback: first non-video image
  const firstImage = images.find(img => img.media_type !== 'video');
  if (firstImage?.image_url) return firstImage.image_url;
  // Last resort: use the first item even if metadata missing
  if (images[0]?.image_url) return images[0].image_url;
  return heroJewelry;
};

// Dynamic feed reels and stories generation based on products
const generateFeedReels = (products: Product[]) => {
  const feedDescriptions = [
    'Perfect jewelry for your evening looks ✨ #GoldenHour #Jewelry #Elegant',
    'New arrivals for the perfect bride 💎 Get ready to shine on your special day! #Bridal #Diamond',
    'Handcrafted with love and precision 💎 #Handmade #Luxury #Jewelry',
    'Traditional meets modern in this stunning piece ✨ #Traditional #Modern #Style',
    'Elegance redefined with our premium collection 👑 #Premium #Elegance #Fashion',
    'Sparkle and shine with our diamond collection 💎 #Diamonds #Sparkle #Luxury',
    'Gold that speaks volumes about your style 🌟 #Gold #Style #Fashion',
    'Crafted for the queens who know their worth 👸 #Queen #Luxury #Premium',
    'Timeless beauty in every piece we create ⏰ #Timeless #Beauty #Crafted',
    'Your style statement starts here ✨ #Style #Statement #Fashion'
  ];

  const feedTitles = [
    'Golden Hour Elegance',
    'Bridal Collection Reveal',
    'Handcrafted Perfection',
    'Traditional Charm',
    'Premium Elegance',
    'Diamond Dreams',
    'Golden Moments',
    'Royal Collection',
    'Timeless Beauty',
    'Style Statement'
  ];

  return products.map((product, index) => {
    // For feed: DO NOT use videos, always use an image
    const imageUrl = getProductImage(product);

    return {
      id: `fr${product.id}`,
      videoUrl: undefined, // no video in feed
      posterImage: imageUrl,
      title: feedTitles[index % feedTitles.length],
      description: feedDescriptions[index % feedDescriptions.length],
      creator: 'Ehsaas Jewellery',
      creatorAvatar: imageUrl,
      likes: Math.floor(Math.random() * 3000) + 500, // Random likes between 500-3500
      isLiked: false, // Always start unliked for new profiles
      timestamp: `${Math.floor(Math.random() * 24) + 1} hours ago`,
      primaryProductId: product.id.toString(),
      products: [{
        id: product.id.toString(),
        name: product.name,
        price: product.sale_price || product.price,
        originalPrice: product.sale_price ? product.price : undefined,
        image: imageUrl
      }]
    };
  });
};

const generateStories = (products: Product[]) => {
  const storyTitles = [
    'Spring Collection',
    'Bridal Luxe',
    'Classic Elegance',
    'Modern Trends',
    'Royal Heritage',
    'Diamond Dreams',
    'Gold Rush',
    'Vintage Charm',
    'Contemporary Style',
    'Festive Special'
  ];

  // Use products in original order for stories
  const orderedProducts = [...products];
  
  return orderedProducts.map((product, index) => ({
    id: `s-${product.id}`,
    title: storyTitles[index % storyTitles.length],
    image: getProductImage(product),
    productId: product.id.toString()
  }));
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTotalItems } = useCart();
  const { wishlistItems, wishlistCount, toggleWishlist: toggleWishlistItem, isInWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('Home');
  const [viewMode, setViewMode] = useState<'feed' | 'grid'>('feed');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [reelStates, setReelStates] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const isScrolling = useMotionBlur();

  // Fetch products with pagination
  const productsResponse = useProducts(page, 15); // Load 15 products at a time
  const allProducts = productsResponse.products;
  const productsLoading = productsResponse.loading;
  const productsError = productsResponse.error;
  const total = productsResponse.total;
  
  // Use products in original order
  const useProductsInOrder = useCallback((products: Product[]) => {
    return [...products];
  }, []);
  

  // Update active tab based on current location
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('Home');
    } else if (location.pathname === '/explore') {
      setActiveTab('Explore');
    } else if (location.pathname === '/reels') {
      setActiveTab('Reels');
    } else if (location.pathname === '/cart') {
      setActiveTab('Cart');
    } else if (location.pathname === '/orders') {
      setActiveTab('Orders');
    } else if (location.pathname === '/notifications') {
      setActiveTab('Notifications');
    } else if (location.pathname === '/wishlist') {
      setActiveTab('Wishlist');
    } else if (location.pathname === '/profile') {
      setActiveTab('Profile');
    }
  }, [location.pathname]);

  // Removed scroll event listener to prevent scroll interference

  // Load more products when page changes (deduplicate by id)
  useEffect(() => {
    if (allProducts.length) {
      if (page === 1) {
        // First page: use products in original order
        setDisplayedProducts([...allProducts]);
      } else {
        // Subsequent pages: merge with existing
        setDisplayedProducts(prev => {
          const merged = [...prev, ...allProducts];
          const uniqueById = new Map<number, Product>();
          for (const p of merged) uniqueById.set(p.id, p);
          return Array.from(uniqueById.values());
        });
      }
    }
  }, [allProducts, page]);

  // Update hasMore based on current displayedProducts vs total
  useEffect(() => {
    setHasMore(displayedProducts.length < total);
  }, [displayedProducts.length, total]);

  // Handle sharing
  const handleShare = async (product: Product) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Handle share cancellation
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  // Toggle reel like
  const toggleReelLike = (reelId: string) => {
    setReelStates(prev => 
      prev.map(reel => 
        reel.id === reelId 
          ? { 
              ...reel, 
              isLiked: !reel.isLiked,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
            }
          : reel
      )
    );
  };

  // Open full reel
  const openFullReel = (reelId: string) => {
    navigate('/reels');
  };

  // Toggle wishlist
  const toggleWishlist = async (productId: number) => {
    try {
      await toggleWishlistItem(BigInt(productId));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (!selectedProduct || !displayedProducts.length) return;
    const currentIndex = displayedProducts.findIndex(p => p.id === selectedProduct.id);
    const nextIndex = (currentIndex + 1) % displayedProducts.length;
    setSelectedProduct(displayedProducts[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedProduct || !displayedProducts.length) return;
    const currentIndex = displayedProducts.findIndex(p => p.id === selectedProduct.id);
    const prevIndex = (currentIndex - 1 + displayedProducts.length) % displayedProducts.length;
    setSelectedProduct(displayedProducts[prevIndex]);
  };

  // Generate dynamic content when products are loaded (in original order)
  useEffect(() => {
    if (displayedProducts.length > 0) {
      const dynamicReels = generateFeedReels(displayedProducts);
      const dynamicStories = generateStories(displayedProducts);
      
      // Use reels and stories in original order
      setReelStates(dynamicReels);
      setStories(dynamicStories);
    }
  }, [displayedProducts]);

  // Helper function to format product for ProductCard component
  const formatProductForCard = (product: Product) => {
    // Generate review count between 90-100
    const reviewCount = 90 + (product.id % 11); // 90-100 reviews
    const randomRating = (Math.random() * 0.5 + 4.5); // 4.5-5.0
    
    return {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      rating: randomRating.toFixed(1),
      reviews: reviewCount,
      image: getProductImage(product),
      description: product.description || product.short_description || ''
    };
  };

  const openFullscreenProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Story handlers
  const openStory = (storyIndex: number) => {
    setSelectedStoryIndex(storyIndex);
  };

  const closeStory = () => {
    setSelectedStoryIndex(null);
  };

  const nextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    }
  };

  const prevStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground pb-28 w-full overflow-x-hidden ${isScrolling ? 'motion-blur' : ''}`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-md"
      >
        <div className="py-1"> {/* Reduced padding */}
          <div className="flex items-center justify-between">
            <div className="ml-3">
              <h1 className="text-4xl font-bold tracking-wider" style={{ 
                fontFamily: 'Brush Script MT, cursive',
                background: 'linear-gradient(135deg, #DAA520, #B8860B, #FF8C00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '0.05em',
                fontWeight: 400,
                fontStyle: 'italic'
              }}>
                ehsaas
              </h1>
            </div>
            <div className="flex gap-2">  {/* Removed mb-4 */}
              <Button
                variant={viewMode === 'feed' ? 'premium' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('feed')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'premium' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wishlist')}
                className="relative"
              >
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Stories */}
      <div className="pt-16"> {/* Reduced padding for smaller header */}
        <StoryStrip stories={stories} onOpenStory={openStory} />
      </div>

      {/* Main Content */}
      <main className="px-2 w-full pt-4">
        {productsLoading && page === 1 ? (
          <div className="flex justify-center items-center py-20">
            <AppLoading message="Loading products..." size="md" />
          </div>
        ) : productsError ? (
          <div className="text-center py-20">
            <p className="text-red-500">Error loading products: {productsError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {displayedProducts.map((product, index) => (
                <div
                  key={`grid-${product.id}-${index}`}
                  className="w-full"
                >
                  <ProductCard
                    product={formatProductForCard(product)}
                    onOpenFullscreen={() => openFullscreenProduct(product)}
                    onToggleWishlist={async () => { await toggleWishlist(product.id); return true; }}
                    onShare={() => handleShare(product)}
                    isWishlisted={isInWishlist(BigInt(product.id))}
                    index={index}
                  />
                </div>
              ))}
            </div>
            {isLoading && (
              <div className="flex justify-center py-6">
                <AppLoading message="Loading more..." size="sm" />
              </div>
            )}
            {/* Load More Button after 15 cards */}
            {displayedProducts.length >= 15 && hasMore && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex justify-center py-8"
              >
                <Button 
                  onClick={() => setPage(prevPage => prevPage + 1)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Load More Products
                </Button>
              </motion.div>
            )}
            {/* End of results message */}
            {!hasMore && displayedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center py-6 text-muted-foreground"
              >
                You've reached the end of the collection
              </motion.div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Products only in feed (no posts/reels) */}
            {displayedProducts.map((product, index) => (
              <div
                key={`product-${product.id}-${index}`}
                className="w-full"
              >
                <div className="w-full">
                  <ProductCard
                    product={formatProductForCard(product)}
                    onOpenFullscreen={() => openFullscreenProduct(product)}
                    onToggleWishlist={async () => { await toggleWishlist(product.id); return true; }}
                    onShare={() => handleShare(product)}
                    isWishlisted={isInWishlist(BigInt(product.id))}
                    index={0}
                    variant="compact"
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center py-6">
                <AppLoading message="Loading more..." size="sm" />
              </div>
            )}
            {/* Load More Button after 15 cards in feed view */}
            {displayedProducts.length >= 15 && hasMore && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex justify-center py-8"
              >
                <Button 
                  onClick={() => setPage(prevPage => prevPage + 1)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Load More Products
                </Button>
              </motion.div>
            )}
            {/* End of results message */}
            {!hasMore && displayedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center py-6 text-muted-foreground"
              >
                You've reached the end of the collection
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Story Viewer */}
      <AnimatePresence>
        {selectedStoryIndex !== null && (
          <StoryViewer
            stories={stories}
            currentStoryIndex={selectedStoryIndex}
            onClose={closeStory}
            onNext={nextStory}
            onPrev={prevStory}
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {selectedProduct && (
          <FullscreenViewer
            product={formatProductForCard(selectedProduct)}
            onClose={() => setSelectedProduct(null)}
            onNext={handleNext}
            onPrev={handlePrev}
            onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
            onShare={() => handleShare(selectedProduct)}
            isWishlisted={isInWishlist(BigInt(selectedProduct.id))}
          />
        )}
      </AnimatePresence>

      {/* Footer - only show when products are loaded */}
      {!productsLoading && displayedProducts.length > 0 && <Footer />}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;