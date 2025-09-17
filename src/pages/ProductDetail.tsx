import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateReviewCount, generateRating, generateReviews } from '@/utils/reviewData';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProductService, ProductVariant } from '@/services/ProductService';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Play,
  User,
  Calendar,
  Shield,
  Truck,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { Footer } from '@/components/Footer';
import LowStockCounter from '@/components/fomo/LowStockCounter';
import SocialProofIndicators from '@/components/fomo/SocialProofIndicators';
import UrgencyMessaging from '@/components/fomo/UrgencyMessaging';
import { getConsistentRating, getConsistentReviewCount, INDIAN_FEMALE_NAMES, getRandomIndianFemaleName } from '@/utils/reviewUtils';

// Import images (you'll need to add these to your assets)
import heroJewelry from '@/assets/hero-jewelry.jpg';
import jewelry1 from '@/assets/jewelry-1.jpg';
import jewelry2 from '@/assets/jewelry-2.jpg';
import jewelry3 from '@/assets/jewelry-3.jpg';

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

interface ProductReview {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_title: string;
  created_at: string;
  is_verified_purchase: boolean;
}

// Hardcoded Indian female reviews
const HARDCODED_REVIEWS: ProductReview[] = [
  {
    id: "1",
    reviewer_name: "Priya Sharma",
    rating: 5,
    review_title: "Absolutely stunning!",
    review_text: "This piece is even more beautiful in person. The craftsmanship is exceptional and the gold finish is perfect. I received so many compliments when I wore it to my sister's wedding.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    reviewer_name: "Anjali Patel",
    rating: 4.5,
    review_title: "Elegant and comfortable",
    review_text: "Beautiful design and very comfortable to wear for long hours. The quality is excellent and it looks exactly like the pictures. Highly recommend for special occasions.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    reviewer_name: "Meera Reddy",
    rating: 5,
    review_title: "Perfect for Indian weddings",
    review_text: "I wore this to my friend's wedding and it was a showstopper! The intricate details and the way it catches the light is mesmerizing. Worth every penny.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    reviewer_name: "Sneha Singh",
    rating: 4.5,
    review_title: "Great quality and design",
    review_text: "The piece is well-made and the gold plating has held up well after multiple wears. The design is elegant and goes with both traditional and contemporary outfits.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    reviewer_name: "Kavita Desai",
    rating: 5,
    review_title: "Exquisite craftsmanship",
    review_text: "The attention to detail is remarkable. This jewelry piece is a work of art. It arrived beautifully packaged and is exactly as described. Very happy with my purchase.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    reviewer_name: "Ritu Gupta",
    rating: 4.5,
    review_title: "Beautiful and elegant",
    review_text: "This is a gorgeous piece of jewelry. The design is unique and the quality is excellent. I've received many compliments on it. It's become my go-to accessory for special events.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    reviewer_name: "Neha Verma",
    rating: 5,
    review_title: "Worth the investment",
    review_text: "This is a premium piece of jewelry that is worth the investment. The craftsmanship is top-notch and it looks luxurious. I'm very pleased with the quality and design.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    reviewer_name: "Pooja Iyer",
    rating: 4.5,
    review_title: "Perfect for festive occasions",
    review_text: "I bought this for Diwali and it was a hit! The design is festive and elegant. The piece is lightweight and comfortable to wear. Great quality and beautiful packaging.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "9",
    reviewer_name: "Divya Nair",
    rating: 5,
    review_title: "Stunning and unique",
    review_text: "This jewelry piece is absolutely stunning. The design is unique and the craftsmanship is excellent. It's become my favorite accessory and I get compliments every time I wear it.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "10",
    reviewer_name: "Sunita Menon",
    rating: 4.5,
    review_title: "High-quality and beautiful",
    review_text: "The quality of this piece is impressive. The gold finish is beautiful and the design is elegant. It's a bit pricey but worth it for the quality and craftsmanship.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "11",
    reviewer_name: "Aishwarya Rao",
    rating: 5,
    review_title: "Perfect for bridal wear",
    review_text: "I wore this for my engagement and it was perfect! The design is bridal-appropriate and the quality is excellent. It complemented my outfit beautifully and I received many compliments.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "12",
    reviewer_name: "Tanvi Joshi",
    rating: 4.5,
    review_title: "Elegant and timeless",
    review_text: "This piece has a timeless elegance to it. The design is classic and the quality is excellent. It's become a staple in my jewelry collection and I wear it often.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "13",
    reviewer_name: "Shruti Pillai",
    rating: 5,
    review_title: "Exceptional quality",
    review_text: "The quality of this jewelry is exceptional. The gold plating is beautiful and the design is intricate. It's a statement piece that elevates any outfit.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "14",
    reviewer_name: "Komal Choudhary",
    rating: 4.5,
    review_title: "Beautiful and well-made",
    review_text: "This is a beautiful piece of jewelry that is well-made. The design is elegant and the quality is good. It's become one of my favorite accessories for special occasions.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "15",
    reviewer_name: "Radhika Agarwal",
    rating: 5,
    review_title: "Perfect for special events",
    review_text: "This jewelry piece is perfect for special events. The design is elegant and the quality is excellent. It's become my go-to accessory for weddings and parties.",
    is_verified_purchase: true,
    created_at: new Date().toISOString(),
  }
];

// Related products
const RELATED_PRODUCTS = [
  {
    id: 'p-2',
    name: 'Diamond Elegance Necklace',
    price: 8999,
    rating: '4.9',
    reviews: 89,
    image: jewelry1,
    description: 'Stunning diamond necklace featuring premium cuts and elegant design.'
  },
  {
    id: 'p-3',
    name: 'Rose Gold Bracelet',
    price: 3799,
    rating: '4.7',
    reviews: 156,
    image: jewelry2,
    description: 'Delicate rose gold bracelet with intricate chain work.'
  },
  {
    id: 'p-4',
    name: 'Pearl Drop Earrings',
    price: 1899,
    rating: '4.6',
    reviews: 203,
    image: jewelry3,
    description: 'Classic pearl earrings with modern sophistication.'
  }
];

export default function ProductDetail() {
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
  const [reviews, setReviews] = useState<Array<{
    id: string;
    reviewer_name: string;
    rating: number;
    review_text: string;
    review_title: string;
    created_at: string;
    is_verified_purchase: boolean;
  }>>(() => generateReviews(id || '', generateReviewCount(id || '')));
  const [newReview, setNewReview] = useState({ rating: 5, title: '', text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  // Touch slider state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  
  // Variant state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantOptions, setVariantOptions] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<Record<string, string>>({});

  const cartQuantity = product ? getItemQuantity(product.id.toString()) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const productId = parseInt(id);
        const productData = await ProductService.getProductById(productId.toString());
        setProduct(productData);
        
        // Generate reviews based on product ID (using local generation instead of API calls)
        const reviewCount = generateReviewCount(productId.toString());
        const productReviews = generateReviews(productId.toString(), reviewCount);
        setReviews(productReviews);
        
        // Fetch variants if they exist
        try {
          const productVariants = await ProductService.getProductVariants(productId);
          const productVariantOptions = await ProductService.getProductVariantOptions(productId);
          
          setVariants(productVariants);
          setVariantOptions(productVariantOptions);
          
          // If variants exist, select the first one by default
          // Prefer the base product variant (no options) if it exists
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
          console.warn('Could not load product variants:', variantError);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Lazy load related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product || !id) return;
      
      try {
        // Add a small delay to prioritize main product loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const related = await ProductService.getRelatedProducts(
          id,
          4 // Reduced from 405 to 4 for better performance
        );
        setRelatedProducts(related);
      } catch (err) {
        // Silently handle errors to reduce console noise
      }
    };

    fetchRelatedProducts();
  }, [product, id]);

  // Handle variant selection
  const handleVariantOptionChange = (optionName: string, value: string) => {
    // Update selected options
    const newSelectedOptions = { ...selectedVariantOptions, [optionName]: value };
    setSelectedVariantOptions(newSelectedOptions);
    
    // Find the matching variant
    const matchingVariant = variants.find(variant => {
      // Check if this is the base product variant (no options)
      if (variant.options.length === 0) {
        // Base product is selected only when no options are selected
        return Object.keys(newSelectedOptions).length === 0;
      }
      
      // For variants with options, check if all options match
      return variant.options.every(option => 
        newSelectedOptions[option.optionName] === option.value
      ) && 
      // Also ensure that the number of options matches to avoid partial matches
      variant.options.length === Object.keys(newSelectedOptions).length;
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      // Update selected image if variant has images
      if (matchingVariant.images.length > 0) {
        const primaryImage = matchingVariant.images.find(img => img.isPrimary);
        const imageIndex = gallery.findIndex(img => 
          img === (primaryImage?.imageUrl || matchingVariant.images[0].imageUrl)
        );
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    } else {
      // If no exact match, select the base variant if available
      const baseVariant = variants.find(v => v.options.length === 0);
      if (baseVariant) {
        setSelectedVariant(baseVariant);
        setSelectedVariantOptions({});
      }
    }
  };

  // Variant selection handler
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
      variantName: variantName, // Add variant name
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
      variantName: variantName, // Add variant name
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
    // Use filtered gallery length (images only)
    setSelectedImageIndex((prev) => (prev + 1) % Math.max(1, gallery.length));
  };

  const prevImage = () => {
    // Use filtered gallery length (images only)
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

  const renderReviewStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  // Helper: determine if a URL is an image (exclude known video extensions and Cloudinary video paths)
  const isImageUrl = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v'];
    if (videoExts.some(ext => lower.endsWith(ext))) return false;
    if (lower.includes('/video/')) return false; // Cloudinary video resource path
    return true;
  };

  // Helper: best image for non-reels contexts (exclude videos)
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
    // As a last resort, if any URL looks like an image, use it; otherwise fallback to placeholder
    const anyImage = images.find(img => isImageUrl(img.image_url));
    if (anyImage?.image_url) return anyImage.image_url;
    return heroJewelry;
  };

  // Format related products for ProductCard component
  const formatRelatedProduct = (product: any) => {
    return {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      originalPrice: product.sale_price,
      rating: product.average_rating?.toFixed(1) || '0.0',
      reviews: product.review_count || 0,
      image: getProductImage(product),
      description: product.short_description || product.description || ''
    };
  };

  // Handle review form changes
  const handleReviewChange = (field: string, value: string | number) => {
    setNewReview(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit a new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setSubmittingReview(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit a review');
      }
      
      await ProductService.submitProductReview(
        product.id,
        user.id,
        newReview.rating,
        newReview.title,
        newReview.text
      );
      
      setReviewSubmitted(true);
      // Reset form
      setNewReview({
        rating: 5,
        title: '',
        text: ''
      });
      
      // Add the new review to the existing reviews instead of fetching from database
      const newReviewData = {
        id: Date.now().toString(),
        reviewer_name: 'You',
        rating: newReview.rating,
        review_title: newReview.title,
        review_text: newReview.text,
        created_at: new Date().toISOString(),
        is_verified_purchase: true
      };
      
      setReviews(prevReviews => {
        // Ensure all items in the array have the same type
        const typedReviews = prevReviews.map(review => ({
          id: review.id,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          review_text: review.review_text,
          review_title: review.review_title,
          created_at: review.created_at,
          is_verified_purchase: review.is_verified_purchase
        }));
        
        return [newReviewData, ...typedReviews];
      });
    } catch (error) {
      // Silently handle errors to reduce console noise
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading product details...</p>
        </div>
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

  // Build gallery excluding videos by media_type and URL checks; fallback to placeholder
  const gallery = (product.product_images || [])
    .filter(img => ((img.media_type && typeof img.media_type === 'string' ? img.media_type.toLowerCase() : 'image') !== 'video') && isImageUrl(img.image_url))
    .map(img => img.image_url)
    .filter(Boolean);
  if (gallery.length === 0) {
    // No image assets available; use placeholder instead of falling back to a video URL
    gallery.push(heroJewelry);
  }
  
  // If a variant is selected, add its images to the gallery
  if (selectedVariant && selectedVariant.images.length > 0) {
    selectedVariant.images.forEach(variantImage => {
      if (!gallery.includes(variantImage.imageUrl)) {
        gallery.push(variantImage.imageUrl);
      }
    });
  }
  
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
          <img
            key={selectedImageIndex}
            src={gallery[selectedImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{ transform: `translateX(${touchDeltaX * 0.3}px)` } as React.CSSProperties}
          />
          
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

      {/* Product Info */}
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
            {/* Show all variants as selectable buttons */}
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
            
            {/* Display the currently selected variant name */}
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
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white" 
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
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-800 hover:bg-gray-50"
            >
              {product.is_active && (selectedVariant ? selectedVariant.stockQuantity > 0 : product.stock_quantity > 0) ? 'Buy Now' : 'Out of Stock'}
            </Button>
          </div>
        </div>

        {/* FOMO Components */}
        <div className="space-y-3">
          {/* Low Stock Counter */}
          <LowStockCounter stockQuantity={selectedVariant ? selectedVariant.stockQuantity : product.stock_quantity} />
          
          {/* Urgency Messaging */}
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

      {/* Description, Specifications, and Reviews Section */}
      <div className="border-t border-border p-4">
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{product.description || product.short_description || 'No description available'}</p>
          
          <div>
            <h3 className="font-semibold mb-2">Specifications</h3>
            <div className="space-y-2">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Customer Reviews</h3>
              <div className="text-sm text-muted-foreground">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </div>
            </div>
            
            {/* Average Rating */}
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <div className="flex flex-col items-center space-y-2">
                <div className="text-3xl font-bold">{rating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">/5 • {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</div>
              </div>
              <div className="flex justify-center">
                {renderStars(Math.floor(rating))}
              </div>
              {reviewCount === 0 && (
                <p className="text-center text-muted-foreground mt-2">
                  Be the first to review this product!
                </p>
              )}
            </div>
            
            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {review.reviewer_name || 'Anonymous User'}
                          </h4>
                          {review.is_verified_purchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {renderReviewStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="font-medium mt-2">{review.review_title}</h5>
                        <p className="text-muted-foreground mt-1">{review.review_text}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : reviewCount > 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Reviews are pending approval.
                </p>
              ) : null}
            </div>

            {/* Review Form */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              {reviewSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <p>Thank you for your review! It will be visible after approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleReviewChange('rating', star)}
                          className="text-2xl focus:outline-none"
                        >
                          <Star
                            className={
                              star <= newReview.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newReview.title}
                      onChange={(e) => handleReviewChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Give your review a title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Review</label>
                    <textarea
                      value={newReview.text}
                      onChange={(e) => handleReviewChange('text', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      rows={4}
                      placeholder="Share your experience with this product"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border p-4">
          <h3 className="font-semibold mb-4">You Might Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {relatedProducts.map((relatedProduct, index) => (
              <div key={relatedProduct.id} className="aspect-[3/4]">
                <ProductCard
                  product={formatRelatedProduct(relatedProduct)}
                  onOpenFullscreen={() => navigate(`/product/${relatedProduct.id}`)}
                  onToggleWishlist={async (id: bigint) => { 
                    // Empty function for now
                    return true; 
                  }}
                  onShare={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: relatedProduct.name,
                        text: relatedProduct.short_description || relatedProduct.description,
                        url: `${window.location.origin}/product/${relatedProduct.id}`,
                      });
                    } else {
                      navigator.clipboard.writeText(`${window.location.origin}/product/${relatedProduct.id}`);
                    }
                  }}
                  isWishlisted={false}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8">
        <Footer />
      </div>

    </div>
  );
}