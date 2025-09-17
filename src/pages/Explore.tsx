import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ArrowLeft,
  Heart,
  Share2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { useProducts, useCategories, Product as ProductType } from '@/hooks/useProducts';
import { useWishlist } from '@/contexts/WishlistContext';

// Import images
import heroJewelry from '@/assets/hero-jewelry.jpg';
import jewelry1 from '@/assets/jewelry-1.jpg';
import jewelry2 from '@/assets/jewelry-2.jpg';
import jewelry3 from '@/assets/jewelry-3.jpg';

interface Category {
  id: number;
  name: string;
  image: string;
  description: string;
  slug: string;
}

// Map of category images
const CATEGORY_IMAGES: Record<string, string> = {
  'rings': jewelry1,
  'necklaces': jewelry2,
  'earrings': heroJewelry,
  'bracelets': jewelry3,
  'pendants': jewelry1,
  'sets': jewelry2,
  'bridal': jewelry3,
  'refurbished-sets': jewelry1,
  'necklace-pieces': jewelry2,
  'clutches': jewelry3,
  'hair-accessories': heroJewelry,
  'bridal-accessories': jewelry1,
  'miscellaneous': jewelry2
};

const getCategoryImage = (category: any) => {
  // Try to match by slug first
  if (category.slug && CATEGORY_IMAGES[category.slug.toLowerCase()]) {
    return CATEGORY_IMAGES[category.slug.toLowerCase()];
  }
  
  // Try to match by name
  if (category.name) {
    const lowerName = category.name.toLowerCase();
    if (CATEGORY_IMAGES[lowerName]) {
      return CATEGORY_IMAGES[lowerName];
    }
    
    // Try to match by keywords in the name
    if (lowerName.includes('ring')) return CATEGORY_IMAGES['rings'] || jewelry1;
    if (lowerName.includes('necklace') || lowerName.includes('chain')) return CATEGORY_IMAGES['necklaces'] || jewelry2;
    if (lowerName.includes('earring') || lowerName.includes('hoop')) return CATEGORY_IMAGES['earrings'] || heroJewelry;
    if (lowerName.includes('bracelet') || lowerName.includes('bangle')) return CATEGORY_IMAGES['bracelets'] || jewelry3;
    if (lowerName.includes('pendant')) return CATEGORY_IMAGES['pendants'] || jewelry1;
    if (lowerName.includes('set') || lowerName.includes('bridal')) return CATEGORY_IMAGES['sets'] || jewelry2;
  }
  
  // Default fallback
  return heroJewelry;
};

const getProductImage = (product: ProductType) => {
  // First try to find the primary image
  const primaryImage = product.product_images?.find(img => img.is_primary);
  if (primaryImage?.image_url) {
    return primaryImage.image_url;
  }
  
  // If no primary image, use the first image available
  const firstImage = product.product_images?.[0];
  if (firstImage?.image_url) {
    return firstImage.image_url;
  }
  
  // Fallback to default image
  return heroJewelry;
};

const doesProductMatchCategory = (product: ProductType, category: any) => {
  if (!product.name && !product.description) return false;
  
  const productName = product.name?.toLowerCase() || '';
  const productDesc = product.description?.toLowerCase() || '';
  const productKeywords = product.short_description?.toLowerCase() || '';
  const categoryName = category.name?.toLowerCase() || '';
  const categorySlug = category.slug?.toLowerCase() || '';
  
  const combinedText = `${productName} ${productDesc} ${productKeywords}`;
  
  // Direct match with category name or slug
  if (categoryName && combinedText.includes(categoryName)) return true;
  if (categorySlug && combinedText.includes(categorySlug)) return true;
  
  // Special handling for common category types
  const specialCategories = [
    { category: 'ring', keywords: ['ring'] },
    { category: 'necklace', keywords: ['necklace', 'chain'] },
    { category: 'earring', keywords: ['earring', 'hoop', 'stud'] },
    { category: 'bracelet', keywords: ['bracelet', 'bangle', 'cuff'] },
    { category: 'pendant', keywords: ['pendant', 'charm'] },
    { category: 'set', keywords: ['set', 'collection'] },
    { category: 'bridal', keywords: ['bridal', 'wedding', 'engagement'] }
  ];
  
  for (const special of specialCategories) {
    if (categoryName.includes(special.category) || categorySlug.includes(special.category)) {
      for (const keyword of special.keywords) {
        if (combinedText.includes(keyword)) return true;
      }
    }
  }
  
  // Split category name into words and match each significant word
  const categoryKeywords = categoryName.split(' ').filter(word => word.length > 2);
  for (const keyword of categoryKeywords) {
    if (combinedText.includes(keyword)) return true;
  }
  
  // Additional matching for specific terms
  if (categoryName.includes('jewelry') || categoryName.includes('jewellery')) {
    return combinedText.includes('jewelry') || combinedText.includes('jewellery');
  }
  
  return false;
};

export default function Explore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Explore');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Use wishlist context instead of local state
  const { wishlistItems, isInWishlist, toggleWishlist } = useWishlist();
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { products, loading: productsLoading, error: productsError, total, totalPages } = useProducts(page, 15, selectedCategory || undefined);

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('Home');
    } else if (location.pathname === '/explore') {
      setActiveTab('Explore');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Reset pagination and displayed products when category or search changes
    setPage(1);
    setDisplayedProducts([]);
    setHasMore(true);
  }, [selectedCategory, searchQuery]);

  const handleScroll = useCallback(() => {
    // Only trigger pagination when we're not loading and have more items
    if (isLoadingMore || !hasMore) return;
    
    // Check if we've scrolled to the bottom
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Trigger when we're close to the bottom (within 100px)
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setPage(prevPage => prevPage + 1);
    }
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    // Throttle scroll events for better performance
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (page === 1) {
      setDisplayedProducts(products);
    } else {
      // Avoid duplicates by checking if products are already in the list
      const newProducts = products.filter(
        newProduct => !displayedProducts.some(
          existingProduct => existingProduct.id === newProduct.id
        )
      );
      setDisplayedProducts(prev => [...prev, ...newProducts]);
    }
    // Update hasMore flag based on whether we have more products to load
    setHasMore(products.length > 0 && page < totalPages);
  }, [products, page, totalPages]);

  const formattedCategories: Category[] = categories.map(category => ({
    id: category.id,
    name: category.name || 'Unnamed Category',
    image: getCategoryImage(category),
    description: category.description || `Beautiful ${category.name || 'jewelry'} collection`,
    slug: category.slug || ''
  }));

  const formattedProducts = displayedProducts.map((product, index) => ({
    id: product.id.toString(),
    name: product.name || 'Untitled Product',
    price: product.price || 0,
    originalPrice: product.sale_price || undefined,
    rating: product.rating ? product.rating.toFixed(1) : '0.0',
    reviews: product.review_count || 0,
    image: getProductImage(product),
    description: product.short_description || product.description || '',
    category: product.categories?.name || 'miscellaneous'
  }));

  const filteredProducts = formattedProducts.filter(product => {
    if (selectedCategory) {
      // Find the original product data to check category_id
      const productData = displayedProducts.find(p => p.id.toString() === product.id);
      
      // If product has a direct category_id match, show it
      if (productData && productData.category_id === selectedCategory) {
        return true;
      }
      
      // Otherwise, try to match by category name/keywords
      const category = categories.find(c => c.id === selectedCategory);
      if (category && productData && doesProductMatchCategory(productData, category)) {
        return true;
      }
      
      // If neither condition is met, don't show the product
      return false;
    }
    
    if (searchQuery) {
      return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.category.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });


  const handleShare = async (product: any) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const openFullscreenProduct = (product: any) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed at top */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">Explore</h1>
            <div className="w-16"></div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {selectedCategory && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Filter
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Categories Section */}
      {!selectedCategory && (
        <section className="p-4">
          <h2 className="text-lg font-semibold mb-4">Shop by Category</h2>
          {categoriesLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categoriesError ? (
            <div className="text-center py-10 text-red-500">
              Error loading categories: {categoriesError}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {formattedCategories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className="group relative overflow-hidden rounded-xl bg-card shadow-card hover:shadow-luxury transition-all duration-300"
                >
                  <div className="aspect-[4/3] relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={index > 4 ? "lazy" : "eager"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-sm mb-1">{category.name}</h3>
                      <p className="text-white/80 text-xs mb-1">{category.description}</p>
                      {/* Item count was removed as requested */}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Selected Category Header */}
      {selectedCategory && (
        <section className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
            </div>
          </div>
        </section>
      )}

      {/* Products Grid/List */}
      <section className="p-4">
        <AnimatePresence mode="wait">
          {selectedCategory || searchQuery ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {productsLoading && page === 1 ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : productsError ? (
                <div className="text-center py-10 text-red-500">
                  Error loading products: {productsError}
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onOpenFullscreen={openFullscreenProduct}
                        onToggleWishlist={toggleWishlist}
                        onShare={handleShare}
                        isWishlisted={isInWishlist(BigInt(product.id))}
                        index={index}
                      />
                    ))}
                  </div>
                  
                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {/* End of results message */}
                  {!isLoadingMore && page >= totalPages && filteredProducts.length > 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      You've reached the end of the collection
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Discover Amazing Products</h3>
              <p className="text-muted-foreground mb-6">
                Choose a category above or use the search bar to find what you're looking for
              </p>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Extra spacing for bottom nav */}
      <div className="h-20"></div>

      {/* Bottom Navigation - Fixed at bottom */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}