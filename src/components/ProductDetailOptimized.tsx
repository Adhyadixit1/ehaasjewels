import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProductService, ProductVariant } from '@/services/ProductService';
import { ProductCacheService } from '@/services/ProductCacheService';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Minus,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import LowStockCounter from '@/components/fomo/LowStockCounter';
import SocialProofIndicators from '@/components/fomo/SocialProofIndicators';
import UrgencyMessaging from '@/components/fomo/UrgencyMessaging';
import { generateRating, generateReviewCount } from '@/utils/reviewData';
import { FullPageLoading, InlineLoading } from '@/components/AppLoading';

// Lazy load secondary components
const ProductCard = lazy(() => import('./ProductCard').then(module => ({ default: module.ProductCard })));
const ProductReviews = lazy(() => import('./ProductReviews'));
const ProductDescription = lazy(() => import('./ProductDescription'));
const ProductRecommendations = lazy(() => import('./ProductRecommendations'));

// Add a small comment to trigger TypeScript refresh
// TypeScript import fix

interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  average_rating?: number;
  review_count?: number;
  description?: string;
  short_description?: string;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  featured: boolean;
  category_id?: number;
  categories?: {
    name: string;
  };
  product_images?: {
    image_url: string;
    is_primary: boolean;
    media_type?: string;
  }[];
  product_specifications?: {
    spec_name: string;
    spec_value: string;
  }[];
}

export default function ProductDetailOptimized() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  // Touch slider state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  
  // Variant state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({});

  const cartQuantity = product ? getItemQuantity(product.id.toString()) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Check cache first
        let productData = ProductCacheService.getCachedProduct(id);
        
        if (!productData) {
          // Fetch from API if not in cache
          productData = await ProductService.getProductById(id);
          // Cache the product
          if (productData) {
            ProductCacheService.cacheProduct(id, productData);
            ProductCacheService.addRecentlyViewedProduct(productData);
          }
        }
        
        if (productData) {
          setProduct(productData);
          
          // Fetch variants if they exist
          try {
            const productVariants = await ProductService.getProductVariants(productData.id);
            const productVariantOptions = await ProductService.getProductVariantOptions(productData.id);
            
            setVariants(productVariants);
            // Set default selected options
            if (productVariants.length > 0) {
              const baseVariant = productVariants.find(v => v.options.length === 0);
              const variantToSelect = baseVariant || productVariants[0];
              
              setSelectedVariant(variantToSelect);
              const defaultOptions: Record<string, string> = {};
              variantToSelect.options.forEach(option => {
                defaultOptions[option.optionName] = option.value;
              });
              setSelectedVariantOptions(defaultOptions);
            }
          } catch (variantError) {
            // Silently handle variant errors
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Create variant properties object to pass all variant options
    const variantProperties: Record<string, string> = {};
    let variantName = '';
    
    if (selectedVariant) {
      // Add the variant name
      variantName = selectedVariant.name || '';
      
      selectedVariant.options.forEach(option => {
        // Use the original option name as the property name
        const propertyName = option.optionName.toLowerCase().replace(/\s+/g, '');
        variantProperties[propertyName] = option.value;
      });
    }
    
    addToCart({
      id: selectedVariant ? `${product.id.toString()}-${selectedVariant.id}` : product.id.toString(),
      name: product.name,
      price: selectedVariant?.price || product.sale_price || product.price,
      image: getProductImage(product),
      variantName: variantName,
      ...variantProperties,
    }, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    // Create variant properties object to pass all variant options
    const variantProperties: Record<string, string> = {};
    let variantName = '';
    
    if (selectedVariant) {
      // Add the variant name
      variantName = selectedVariant.name || '';
      
      selectedVariant.options.forEach(option => {
        // Use the original option name as the property name
        const propertyName = option.optionName.toLowerCase().replace(/\s+/g, '');
        variantProperties[propertyName] = option.value;
      });
    }
    
    addToCart({
      id: selectedVariant ? `${product.id.toString()}-${selectedVariant.id}` : product.id.toString(),
      name: product.name,
      price: selectedVariant?.price || product.sale_price || product.price,
      image: getProductImage(product),
      variantName: variantName,
      ...variantProperties,
    }, quantity);
    navigate('/checkout');
  };

  const toggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to use wishlist',
        variant: 'destructive',
      });
      navigate('/profile');
      return;
    }
    
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const handleShare = async () => {
    if (!product) return;
    
    const shareData = {
      title: product.name,
      text: product.description || product.short_description || '',
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Silently handle share errors
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const nextImage = () => {
    if (!product?.product_images) return;
    const gallery = getGalleryImages();
    setSelectedImageIndex((prev) => (prev + 1) % Math.max(1, gallery.length));
  };

  const prevImage = () => {
    if (!product?.product_images) return;
    const gallery = getGalleryImages();
    const len = Math.max(1, gallery.length);
    setSelectedImageIndex((prev) => (prev - 1 + len) % len);
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const onTouchEnd = () => {
    const threshold = 50; // px to trigger swipe
    if (touchDeltaX > threshold) {
      prevImage();
    } else if (touchDeltaX < -threshold) {
      nextImage();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  // Helper: determine if a URL is an image
  const isImageUrl = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v'];
    if (videoExts.some(ext => lower.endsWith(ext))) return false;
    if (lower.includes('/video/')) return false;
    return true;
  };

  // Get gallery images (only images, no videos)
  const getGalleryImages = () => {
    if (!product?.product_images) return [];
    
    return product.product_images
      .filter(img => ((img.media_type && typeof img.media_type === 'string' ? img.media_type.toLowerCase() : 'image') !== 'video') && isImageUrl(img.image_url))
      .map(img => img.image_url)
      .filter(Boolean) as string[];
  };

  // Helper: best image for non-reels contexts
  const getProductImage = (product: any) => {
    // If a variant is selected and has images, use the variant's primary image
    if (selectedVariant && selectedVariant.images.length > 0) {
      const primaryImage = selectedVariant.images.find(img => img.isPrimary);
      if (primaryImage?.imageUrl) return primaryImage.imageUrl;
      return selectedVariant.images[0].imageUrl;
    }
    
    const images = (product.product_images || []) as Array<{ image_url: string; is_primary: boolean; media_type?: string }>;
    const primaryImage = images.find(img => img.is_primary && (img.media_type || 'image').toLowerCase() !== 'video' && isImageUrl(img.image_url));
    if (primaryImage?.image_url) return primaryImage.image_url;
    const firstImage = images.find(img => (img.media_type || 'image').toLowerCase() !== 'video' && isImageUrl(img.image_url));
    if (firstImage?.image_url) return firstImage.image_url;
    return '';
  };

  // Handle variant selection
  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // For variants with options, set the selected options
    if (variant.options.length > 0) {
      const newSelectedOptions: Record<string, string> = {};
      variant.options.forEach(option => {
        newSelectedOptions[option.optionName] = option.value;
      });
      setSelectedVariantOptions(newSelectedOptions);
    } else {
      // For base product variant, clear selected options
      setSelectedVariantOptions({});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <FullPageLoading message="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">Error loading product: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const gallery = getGalleryImages();
  const specifications = product.product_specifications?.reduce((acc, spec) => {
    acc[spec.spec_name] = spec.spec_value;
    return acc;
  }, {} as { [key: string]: string });
  
  // Generate consistent review data for this product
  const rating = generateRating(id || '');
  const reviewCount = generateReviewCount(id || '');
  
  // Determine current product price (variant price takes precedence)
  const currentPrice = selectedVariant?.price || product.sale_price || product.price;
  const originalPrice = product.sale_price ? product.price : undefined;

  return (
    <div className="page-scroll bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWishlist(product.id.toString())}
            >
              <Heart className={`w-4 h-4 ${wishlist.has(product.id.toString()) ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Product Gallery */}
      <div className="relative">
        <div
          className="aspect-square bg-gray-100 relative overflow-hidden touch-scroll select-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {gallery.length > 0 && (
            <img
              key={selectedImageIndex}
              src={gallery[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
              style={{ transform: `translateX(${touchDeltaX * 0.3}px)` } as React.CSSProperties}
            />
          )}
          
          {/* Gallery Navigation */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Gallery */}
        <div className="flex gap-2 p-4 overflow-x-auto">
          {gallery.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedImageIndex ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <img
                src={image}
                alt={`${product.name} view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info - Critical Above-the-Fold Content */}
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
                    onClick={() => handleVariantSelect(variant)}
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
              {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Quantity:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-muted"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 border-x border-border">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-muted"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-800" 
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.is_active || (selectedVariant ? selectedVariant.stockQuantity <= 0 : product.stock_quantity <= 0)}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {product.is_active && (selectedVariant ? selectedVariant.stockQuantity > 0 : product.stock_quantity > 0) ? (
                cartQuantity > 0 ? `In Cart (${cartQuantity + quantity})` : `Add ${quantity} to Cart`
              ) : (
                'Out of Stock'
              )}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleBuyNow}
              disabled={!product.is_active || (selectedVariant ? selectedVariant.stockQuantity <= 0 : product.stock_quantity <= 0)}
            >
              {product.is_active && (selectedVariant ? selectedVariant.stockQuantity > 0 : product.stock_quantity > 0) ? 'Buy Now' : 'Out of Stock'}
            </Button>
          </div>
        </div>

        {/* FOMO Components */}
        <div className="space-y-3">
          <LowStockCounter stockQuantity={selectedVariant ? selectedVariant.stockQuantity : product.stock_quantity} />
          <UrgencyMessaging />
        </div>

        {/* Social Proof Indicators */}
        <SocialProofIndicators 
          productId={id || ''} 
          rating={rating} 
          reviewCount={reviewCount} 
        />

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
          <div className="text-center">
            <Shield className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">1 Year Warranty</div>
          </div>
          <div className="text-center">
            <Truck className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">Free Shipping</div>
          </div>
          <div className="text-center">
            <RotateCcw className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-xs text-muted-foreground">Easy Returns</div>
          </div>
        </div>
      </div>

      {/* Deferred Secondary Content */}
      <Suspense fallback={
        <div className="p-4">
          <InlineLoading message="Loading product details..." />
        </div>
      }>
        <ProductDescription 
          description={product.description || product.short_description || 'No description available'}
          specifications={specifications || {}}
        />
      </Suspense>

      <Suspense fallback={
        <div className="p-4 border-t border-border">
          <InlineLoading message="Loading reviews..." />
        </div>
      }>
        <ProductReviews productId={product.id.toString()} />
      </Suspense>

      {/* Related Products - Deferred with Lazy Loading */}
      <Suspense fallback={
        <div className="border-t border-border p-4">
          <InlineLoading message="Loading recommendations..." />
        </div>
      }>
        <ProductRecommendations currentProductId={product.id.toString()} />
      </Suspense>

      {/* Footer */}
      <div className="mt-8">
        <Footer />
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <a
          href="https://wa.me/916354346228?text=Hi, Can you tell me more about this product"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 mb-1"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
        <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded shadow-sm max-w-[120px] text-center">
          Hi, Can you tell me more about this product
        </span>
      </div>
    </div>
  );
}