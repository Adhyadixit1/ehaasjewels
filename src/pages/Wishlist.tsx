import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  Grid3X3,
  List,
  Filter,
  X,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';
import { generateReviewCount, generateRating } from '@/utils/reviewData';

interface WishlistItem {
  id: string;
  productId: string; // Added productId for removal
  name: string;
  price: number;
  originalPrice?: number;
  rating: string;
  reviews: number;
  image: string;
  description: string;
  category: string;
  dateAdded: string;
  inStock: boolean;
  priceDropPercentage?: number;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistItems: wishlistDbItems, removeFromWishlist, isLoading } = useWishlist();
  const { products: allProducts } = useProducts(1, 1000); // Load all products to get wishlist product details
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('Wishlist');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'priceHigh' | 'priceLow' | 'name'>('recent');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('Home');
    } else if (location.pathname === '/explore') {
      setActiveTab('Explore');
    } else if (location.pathname === '/wishlist') {
      setActiveTab('Wishlist');
    }
  }, [location.pathname]);

  // Map wishlist items to product details
  const wishlistProductItems = wishlistDbItems.map(wishlistItem => {
    const product = allProducts?.find(p => p.id.toString() === wishlistItem.product_id.toString());
    
    // Get primary image from product_images array
    const primaryImage = product?.product_images?.find(img => img.is_primary);
    const imageUrl = primaryImage?.image_url || product?.image_url || '';
    
    // Generate consistent review data to match feed/explore
    const productId = product?.id.toString() || wishlistItem.product_id.toString();
    const reviewCount = generateReviewCount(productId);
    const rating = generateRating(productId);
    
    return {
      id: wishlistItem.id.toString(),
      productId: wishlistItem.product_id.toString(), // Add productId for removal
      name: product?.name || 'Unknown Product',
      price: product?.price || 0,
      originalPrice: product?.sale_price ? product.price : undefined,
      rating: rating.toFixed(1),
      reviews: reviewCount,
      image: imageUrl,
      description: product?.short_description || '',
      category: product?.categories?.name || 'uncategorized',
      dateAdded: wishlistItem.created_at,
      inStock: product?.is_active && (product?.stock_quantity || 0) > 0,
      priceDropPercentage: product?.sale_price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : undefined
    };
  });

  const categories = Array.from(new Set(wishlistProductItems.map(item => item.category))) as string[];

  const filteredAndSortedItems = wishlistProductItems
    .filter(item => filterCategory === 'all' || item.category === filterCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'priceHigh':
          return b.price - a.price;
        case 'priceLow':
          return a.price - b.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(BigInt(productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleShare = async (item: WishlistItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const handleProductClick = (item: WishlistItem) => {
    navigate(`/product/${item.id}`);
  };

  const addToCart = (item: WishlistItem) => {
    console.log('Add to cart:', item);
    // Add to cart logic here
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">My Wishlist</h1>
              <span className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">
                {wishlistProductItems.length}
              </span>
            </div>
            <div className="w-16"></div> {/* Spacer */}
          </div>

          {/* Controls */}
          <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            <div className="flex items-center justify-between gap-4 min-w-max">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-border rounded-md px-2 py-1 bg-background whitespace-nowrap"
                >
                  <option value="recent">Recently Added</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="name">Name A-Z</option>
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-sm border border-border rounded-md px-2 py-1 bg-background whitespace-nowrap"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Price Drop Alerts */}
      {wishlistProductItems.some(item => item.priceDropPercentage) && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {wishlistProductItems.filter(item => item.priceDropPercentage).length} items have price drops!
            </span>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      <div className="p-4">
        {filteredAndSortedItems.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredAndSortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-luxury transition-all duration-300 relative"
                >
                  {/* Price Drop Badge */}
                  {item.priceDropPercentage && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-10">
                      -{item.priceDropPercentage}%
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  <button 
                    onClick={() => handleProductClick(item)}
                    className="block w-full group"
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">
                          {item.rating} ({item.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black text-sm">₹{item.price.toLocaleString()}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(item.dateAdded)}
                      </p>
                    </div>
                  </button>
                  
                  <div className="px-3 pb-3 flex gap-2">
                    <Button 
                      className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-800"
                      size="sm" 
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                    >
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      {item.inStock ? 'Add to Cart' : 'Notify Me'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShare(item)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-300 relative"
                >
                  {/* Price Drop Badge */}
                  {item.priceDropPercentage && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      -{item.priceDropPercentage}%
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleProductClick(item)}
                      className="flex-shrink-0 group"
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Out</span>
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="flex-1">
                      <button
                        onClick={() => handleProductClick(item)}
                        className="text-left w-full mb-2"
                      >
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                      </button>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">
                          {item.rating} ({item.reviews} reviews)
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-black">
                            ₹{item.price.toLocaleString()}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Added {formatDate(item.dateAdded)}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-800"
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                        >
                          <ShoppingBag className="w-4 h-4 mr-1" />
                          {item.inStock ? 'Add to Cart' : 'Notify Me'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(item)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromWishlist(item.productId)}
                        >
                          <Heart className="w-4 h-4 fill-current text-primary" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Wishlist is Empty</h3>
            <p className="text-muted-foreground mb-6">
              {filterCategory === 'all' 
                ? "Save items you love to your wishlist."
                : `No ${filterCategory} items in your wishlist.`
              }
            </p>
            <Button onClick={() => navigate('/explore')}>
              Start Shopping
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}