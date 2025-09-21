import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProductService, ProductData, ProductVariant } from '@/services/ProductService';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingBag,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FullPageLoading, InlineLoading } from '@/components/AppLoading';

// Lazy load heavy components
const ProductReviews = lazy(() => import('./ProductReviews').then(module => ({ default: module.default })));
const ProductDescription = lazy(() => import('./ProductDescription').then(module => ({ default: module.default })));
const ProductRecommendations = lazy(() => import('./ProductRecommendations').then(module => ({ default: module.default })));

// Import optimized components
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductActions } from './ProductActions';

import { generateRating, generateReviewCount } from '@/utils/reviewData';
import { Footer } from './Footer';

// Add a small comment to trigger TypeScript refresh
// TypeScript import fix

interface Product extends ProductData {
  // Extending ProductData for full compatibility
  // Note: ProductData uses camelCase properties, so no additional properties needed
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

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Check cache first
        // let productData = ProductCacheService.getCachedProduct(id);

        // if (!productData) {
          // Use optimized parallel API call
        const { product, variants } = await ProductService.getProductWithVariants(id);
          // Cache the product
          // if (productData) {
          //   ProductCacheService.cacheProduct(id, productData);
          //   ProductCacheService.addRecentlyViewedProduct(productData);
          // }
        // }
        
        if (product) {
          setProduct(product);
          setVariants(variants);
          setLoading(false);

          // Add to recently viewed
          // ProductCacheService.addRecentlyViewedProduct(product);
        } else {
          setError('Product not found');
          setLoading(false);
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

  // Compute current and original prices so the smaller value is shown as current price
  const computePrices = (p: Product | null, variant: ProductVariant | null) => {
    // Early return if product is null
    if (!p) {
      return { current: 0, original: undefined as number | undefined };
    }

    const base = variant?.price ?? p.price;
    const alt = p.comparePrice;
    if (alt == null || alt === base) {
      return { current: base, original: undefined as number | undefined };
    }
    const current = Math.min(base, alt);
    const original = Math.max(base, alt);
    return { current, original };
  };

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
    
    const { current } = computePrices(product, selectedVariant);

    addToCart({
      id: selectedVariant ? `${product.id.toString()}-${selectedVariant.id}` : product.id.toString(),
      name: product.name,
      price: current,
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
    
    const { current } = computePrices(product, selectedVariant);

    addToCart({
      id: selectedVariant ? `${product.id.toString()}-${selectedVariant.id}` : product.id.toString(),
      name: product.name,
      price: current,
      image: getProductImage(product),
      variantName: variantName,
      ...variantProperties,
    }, quantity);
    
    // Navigate to cart page instead of checkout
    navigate('/cart');
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

  // Cleanup effect for memory leak prevention
  useEffect(() => {
    return () => {
      // Cleanup any resources if needed
      setProduct(null);
      setVariants([]);
      setSelectedVariant(null);
      setSelectedVariantOptions({});
    };
  }, []);

  // Optimized handlers with proper cleanup
  const handleShare = useCallback(async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: product.description || product.shortDescription || '',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Silently handle share errors - user cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.warn('Share failed:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Product link has been copied to clipboard',
        });
      } catch (error) {
        console.warn('Clipboard access failed:', error);
      }
    }
  }, [product, toast]);

  // Memoized expensive calculations
  const gallery = useMemo(() => getGalleryImages(), [product?.product_images]);

  const specifications = useMemo(() =>
    product?.product_specifications?.reduce((acc, spec) => {
      acc[spec.spec_name] = spec.spec_value;
      return acc;
    }, {} as { [key: string]: string }) || {},
    [product?.product_specifications]
  );

  // Only compute prices when product is available
  const { current: currentPrice, original: originalPrice } = useMemo(() => {
    if (!product) {
      return { current: 0, original: undefined as number | undefined };
    }
    return computePrices(product, selectedVariant);
  }, [product, selectedVariant]);

  const rating = useMemo(() => generateRating(id || ''), [id]);
  const reviewCount = useMemo(() => generateReviewCount(id || ''), [id]);

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

  return (
    <div className="page-scroll bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold text-base line-clamp-1">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleWishlist(product.id.toString())}
            >
              <Heart className={`w-5 h-5 ${wishlist.has(product.id.toString()) ? 'fill-current text-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative mr-1"
              onClick={() => navigate('/cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                  {cartQuantity > 9 ? '9+' : cartQuantity}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Optimized Product Gallery */}
      <ProductGallery
        images={gallery}
        productName={product.name}
        priorityImage={gallery.length > 0 ? gallery[0] : undefined}
      />

      {/* Optimized Product Info */}
      <ProductInfo
        product={product}
        selectedVariant={selectedVariant}
        rating={rating}
        reviewCount={reviewCount}
        currentPrice={currentPrice}
        originalPrice={originalPrice}
        variants={variants}
        onVariantSelect={handleVariantSelect}
      />

      {/* Optimized Product Actions */}
      <div className="p-4">
        <ProductActions
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          cartQuantity={cartQuantity}
          isActive={product.isActive}
        />
      </div>

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

      {/* Deferred Secondary Content */}
      <Suspense fallback={
        <div className="p-4">
          <InlineLoading message="Loading product details..." />
        </div>
      }>
        <ProductDescription
          description={product.description || product.shortDescription || 'No description available'}
          specifications={specifications}
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