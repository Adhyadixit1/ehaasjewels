import { Heart, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { generateReviewCount, generateRating } from '@/utils/reviewData';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: string;
  reviews: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onOpenFullscreen: (product: Product) => void;
  onToggleWishlist: (id: bigint) => Promise<boolean>;
  onShare: (product: Product) => void;
  isWishlisted: boolean;
  index: number;
  variant?: 'default' | 'compact' | 'ultra-compact'; // Add ultra-compact variant
}

export function ProductCard({ 
  product, 
  onOpenFullscreen, 
  onToggleWishlist, 
  onShare, 
  isWishlisted,
  index,
  variant = 'default' // Default to 'default' variant
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const cartQuantity = getItemQuantity(product.id);

  // Generate consistent review data for this product
  const reviewCount = generateReviewCount(product.id);
  const rating = generateRating(product.id);

  const handleProductNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleImageClick = () => {
    onOpenFullscreen(product);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to use wishlist',
        variant: 'destructive',
      });
      navigate('/profile');
      return;
    }
    
    await onToggleWishlist(BigInt(product.id));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(product);
  };
  
  // Handle card click - navigate to product page
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or link
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  // Determine styles based on variant
  const cardClasses = variant === 'ultra-compact' 
    ? "bg-card rounded-sm overflow-hidden shadow-card hover:shadow-luxury transition-all duration-300 cursor-pointer product-card-ultra-compact h-full flex flex-col"
    : variant === 'compact' 
    ? "bg-card rounded-lg overflow-hidden shadow-card hover:shadow-luxury transition-all duration-300 cursor-pointer product-card-compact h-full flex flex-col"
    : "bg-card rounded-xl overflow-hidden shadow-card hover:shadow-luxury transition-all duration-300 cursor-pointer";
    
  const imageClasses = variant === 'ultra-compact'
    ? "w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 flex-shrink-0"
    : variant === 'compact'
    ? "w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 flex-shrink-0"
    : "w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500";
    
  const contentPadding = variant === 'ultra-compact' ? "p-0.5" : variant === 'compact' ? "p-1.5" : "p-4";
    
  // Increased font sizes for better visibility
  const titleSize = variant === 'ultra-compact' 
    ? "text-[10px] font-bold text-foreground mb-0 hover:text-primary transition-colors duration-200 line-clamp-1"
    : variant === 'compact' 
    ? "text-base font-bold text-foreground mb-0.5 hover:text-primary transition-colors duration-200 line-clamp-1"
    : "text-xl font-bold text-foreground mb-1 hover:text-primary transition-colors duration-200";
    
  const descriptionSize = variant === 'ultra-compact'
    ? "text-[9px] text-muted-foreground mb-0 line-clamp-1"
    : variant === 'compact'
    ? "text-sm text-muted-foreground mb-0.5 line-clamp-1"
    : "text-base text-muted-foreground mb-2 line-clamp-2";
    
  const priceSize = variant === 'ultra-compact'
    ? "text-[10px] font-bold"
    : variant === 'compact'
    ? "text-lg font-bold"
    : "text-xl font-bold";
    
  const ratingSize = variant === 'ultra-compact'
    ? "text-[8px] text-muted-foreground line-clamp-1 hidden"
    : variant === 'compact'
    ? "text-xs text-muted-foreground line-clamp-1"
    : "text-sm text-muted-foreground";
    
  const buttonSize = "sm";

  return (
    <article 
      className={cardClasses}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden group">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className={imageClasses}
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding="async"
          // Responsive sizes: full width on small screens, half on tablets, third on desktop
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          widths={[200, 400, 600, 800, 1200]}
          quality={70}
          fetchPriority={index < 4 ? 'high' : undefined}
        />
        <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Show price and button for ultra-compact variant */}
      {variant === 'ultra-compact' ? (
        <div className={`${contentPadding} flex items-center justify-between gap-1 mb-0`}>
          <span className={`${priceSize} font-bold`} style={{ 
            background: 'linear-gradient(135deg, #DAA520, #B8860B, #FF8C00)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ₹{product.price.toLocaleString()}
          </span>
        </div>
      ) : (
        <div className={`${contentPadding} flex-1 flex flex-col min-h-0 ${variant === 'compact' ? 'mb-1' : 'mb-4'}`}>
          <h3 
            className={titleSize}
          >
            {product.name}
          </h3>
          <p 
            className={descriptionSize}
          >
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <span className={priceSize} style={{ 
              background: 'linear-gradient(135deg, #DAA520, #B8860B, #FF8C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ₹{product.price.toLocaleString()}
            </span>
            <div 
              className={ratingSize}
            >
              ⭐ {rating.toFixed(1)} ({reviewCount} reviews)
            </div>
          </div>
        </div>
      )}
      
      <div className={`${variant === 'ultra-compact' ? 'p-0.5' : contentPadding} pt-0 flex ${variant === 'ultra-compact' ? '' : 'gap-0.5'}`} onClick={e => e.stopPropagation()}>
        <div
          className={variant === 'ultra-compact' ? "w-full" : "flex-[2]"}
        >
          <Button 
            onClick={handleAddToCart}
            className={`w-full ${variant === 'ultra-compact' ? 'bg-pink-200 hover:bg-pink-300 text-gray-800 text-[8px] px-0 py-0 h-6' : variant === 'compact' ? 'bg-pink-200 hover:bg-pink-300 text-gray-800 text-xs px-1 py-1' : 'bg-pink-200 hover:bg-pink-300 text-gray-800'}`}
            size={buttonSize}
          >
            {variant === 'ultra-compact' ? (
              <span className="text-[8px]">Add</span>
            ) : variant === 'compact' ? (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                <span className="text-xs">Add to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span>Add to Cart</span>
              </>
            )}
          </Button>
        </div>
        {variant !== 'ultra-compact' && (
          <>
            <div
              className="flex-shrink-0"
            >
              <Button 
                variant="glass" 
                size={buttonSize}
                onClick={handleWishlistClick}
                className={isWishlisted ? 'text-red-500' : ''}
              >
                <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
            <div
              className="flex-shrink-0"
            >
              <Button 
                variant="glass" 
                size={buttonSize}
                onClick={handleShareClick}
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}