import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  ShoppingBag,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import images
import heroJewelry from '@/assets/hero-jewelry.jpg';
import jewelry1 from '@/assets/jewelry-1.jpg';
import jewelry2 from '@/assets/jewelry-2.jpg';
import jewelry3 from '@/assets/jewelry-3.jpg';

interface ShoppableProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface Reel {
  id: string;
  videoUrl?: string; // For demo, we'll use images
  posterImage: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  views: string;
  products: ShoppableProduct[];
  isLiked?: boolean;
}

interface ShoppableReelsProps {
  reels?: Reel[];
  onProductClick: (productId: string) => void;
  onToggleWishlist: (productId: string) => void;
  wishlist: Set<string>;
}

// Sample reels data
const SAMPLE_REELS: Reel[] = [
  {
    id: 'r1',
    posterImage: heroJewelry,
    title: 'Golden Hour Elegance',
    description: 'Perfect jewelry for your evening looks ✨',
    creator: 'Ehsaas Jewellery',
    creatorAvatar: jewelry1,
    likes: 1240,
    views: '12.4K',
    products: [
      {
        id: 'p1',
        name: 'Heritage Gold Hoops',
        price: 2499,
        originalPrice: 3199,
        image: heroJewelry
      },
      {
        id: 'p2',
        name: 'Gold Chain Necklace',
        price: 3799,
        image: jewelry2
      }
    ],
    isLiked: false
  },
  {
    id: 'r2',
    posterImage: jewelry1,
    title: 'Bridal Collection Reveal',
    description: 'New arrivals for the perfect bride 💎',
    creator: 'Ehsaas Bridal',
    creatorAvatar: jewelry2,
    likes: 2180,
    views: '25.3K',
    products: [
      {
        id: 'p3',
        name: 'Diamond Elegance Set',
        price: 15999,
        originalPrice: 19999,
        image: jewelry1
      }
    ],
    isLiked: true
  },
  {
    id: 'r3',
    posterImage: jewelry2,
    title: 'Vintage Restoration',
    description: 'Watch us restore this 1920s masterpiece',
    creator: 'Ehsaas Heritage',
    creatorAvatar: jewelry3,
    likes: 3450,
    views: '41.2K',
    products: [
      {
        id: 'p4',
        name: 'Vintage Royal Set',
        price: 8999,
        originalPrice: 12999,
        image: jewelry2
      },
      {
        id: 'p5',
        name: 'Pearl Drop Earrings',
        price: 1899,
        image: jewelry3
      }
    ],
    isLiked: false
  }
];

export function ShoppableReels({ 
  reels, 
  onProductClick, 
  onToggleWishlist, 
  wishlist 
}: ShoppableReelsProps) {
  const navigate = useNavigate();
  
  // Use sample reels if none provided
  const reelsData = reels || SAMPLE_REELS;
  
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [reelStates, setReelStates] = useState(
    reelsData.map(reel => ({ ...reel }))
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const currentReel = reelStates[currentReelIndex];

  // Auto-advance to next reel
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        handleNextReel();
      }, 8000); // 8 seconds per reel
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentReelIndex]);

  const handleNextReel = () => {
    setCurrentReelIndex((prev) => (prev + 1) % reelStates.length);
    setShowProducts(false);
  };

  const handlePrevReel = () => {
    setCurrentReelIndex((prev) => (prev - 1 + reelStates.length) % reelStates.length);
    setShowProducts(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = () => {
    setReelStates(prev => 
      prev.map((reel, index) => 
        index === currentReelIndex 
          ? { 
              ...reel, 
              isLiked: !reel.isLiked,
              likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
            }
          : reel
      )
    );
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reels?reel=${encodeURIComponent(currentReel.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentReel.title,
          text: currentReel.description,
          url: shareUrl,
        });
      } catch (error) {
        // Share cancelled or unsupported
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (e) {
        console.warn('Clipboard share failed');
      }
    }
  };

  const handleProductClick = (product: ShoppableProduct) => {
    navigate(`/product/${product.id}`);
  };

  // Touch handlers for swipe navigation
  const startY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const deltaY = startY.current - endY;

    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        handleNextReel();
      } else {
        handlePrevReel();
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Shoppable Reels</h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div 
        ref={containerRef}
        className="relative h-[500px] bg-black overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReelIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Reel Video/Image */}
            <div className="relative w-full h-full">
              <img
                src={currentReel.posterImage}
                alt={currentReel.title}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
              
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                )}
              </button>
            </div>

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <img
                  src={currentReel.creatorAvatar}
                  alt={currentReel.creator}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <div>
                  <p className="text-white font-medium text-sm">{currentReel.creator}</p>
                  <p className="text-white/80 text-xs">{currentReel.views} views</p>
                </div>
              </div>
              
              <button
                onClick={toggleMute}
                className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            {/* Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-4 z-10">
              <button
                onClick={toggleLike}
                className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex flex-col items-center justify-center"
              >
                <Heart className={`w-6 h-6 ${currentReel.isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                <span className="text-white text-xs mt-1">{currentReel.likes}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Share2 className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => setShowProducts(!showProducts)}
                className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <ShoppingBag className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-20 z-10">
              <h3 className="text-white font-semibold text-lg mb-1">{currentReel.title}</h3>
              <p className="text-white/90 text-sm mb-3">{currentReel.description}</p>
              
              {/* Products Quick View */}
              {currentReel.products.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {currentReel.products.slice(0, 3).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="flex-shrink-0 bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 min-w-[140px]"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="text-left">
                        <p className="text-white text-xs font-medium truncate">{product.name}</p>
                        <p className="text-white/80 text-xs">₹{product.price.toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                className="h-full bg-white"
                initial={{ width: '0%' }}
                animate={{ width: isPlaying ? '100%' : '0%' }}
                transition={{ duration: 8, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Products Sidebar */}
        <AnimatePresence>
          {showProducts && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-background border-l border-border z-20"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Shop This Reel</h3>
                  <button
                    onClick={() => setShowProducts(false)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {currentReel.products.map((product) => (
                    <div
                      key={product.id}
                      className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-primary font-semibold">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                              <span className="text-muted-foreground text-xs line-through">
                                ₹{product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleProductClick(product)}
                              className="flex-1"
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onToggleWishlist(product.id)}
                            >
                              <Heart className={`w-4 h-4 ${wishlist.has(product.id) ? 'fill-current text-primary' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          {reelStates.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReelIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentReelIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}