import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingBag, 
  ShoppingCart,
  Play, 
  Pause, 
  MoreHorizontal,
  X,
  Volume2,
  VolumeX,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Footer } from '@/components/Footer';

// Import images
import heroJewelry from '@/assets/hero-jewelry.jpg';
import jewelry1 from '@/assets/jewelry-1.jpg';
import jewelry2 from '@/assets/jewelry-2.jpg';
import jewelry3 from '@/assets/jewelry-3.jpg';

interface Reel {
  id: string;
  videoUrl?: string; // Add video URL support
  posterImage: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  primaryProductId: string;
  products: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
  }[];
}

// Helper function to get product image
const getProductImage = (product: any) => {
  const primaryImage = product.product_images?.find((img: any) => img.is_primary);
  return primaryImage?.image_url || heroJewelry;
};

// Helper function to get first available image (not video) from product
const getFirstAvailableImage = (product: any) => {
  // First try to find a non-video primary image
  const primaryImage = product.product_images?.find((img: any) => img.is_primary && img.media_type !== 'video');
  if (primaryImage?.image_url) {
    return primaryImage.image_url;
  }
  
  // If no non-video primary image, find any non-video image
  const anyImage = product.product_images?.find((img: any) => img.media_type !== 'video');
  if (anyImage?.image_url) {
    return anyImage.image_url;
  }
  
  // Fallback to hero image if no images found
  return heroJewelry;
};

// Generate real reels data from products
const generateReelsFromProducts = (products: any[]) => {
  const feedDescriptions = [
    'Perfect jewelry for your evening looks ✨',
    'New arrivals for the perfect bride 💎',
    'Handcrafted with love and precision 💎',
    'Traditional meets modern in this stunning piece ✨',
    'Elegance redefined with our premium collection 👑',
    'Sparkle and shine with our diamond collection 💎',
    'Gold that speaks volumes about your style 🌟',
    'Crafted for the queens who know their worth 👸',
    'Timeless beauty in every piece we create ⏰',
    'Your style statement starts here ✨'
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
    // Check if the product has a video
    const primaryImage = product.product_images?.find((img: any) => img.is_primary);
    const hasVideo = primaryImage?.media_type === 'video';
    let imageUrl = primaryImage?.image_url || heroJewelry;
    
    // Handle Cloudinary video URLs - ensure proper format
    let videoUrl = undefined;
    if (hasVideo && imageUrl) {
      // If it's a Cloudinary URL, ensure it has proper video format
      if (imageUrl.includes('cloudinary.com')) {
        // Remove any existing format and add .mp4
        videoUrl = imageUrl.replace(/\.(mp4|mov|webm|avi).*$/, '') + '.mp4';
        // Also ensure it has video/upload in the URL
        if (!videoUrl.includes('/video/upload/')) {
          videoUrl = videoUrl.replace('/image/upload/', '/video/upload/');
        }
      } else {
        // For non-Cloudinary URLs, just ensure .mp4 extension
        videoUrl = imageUrl.includes('.mp4') ? imageUrl : `${imageUrl}.mp4`;
      }
    }

    return {
      id: `fr${product.id}`,
      videoUrl: videoUrl,
      posterImage: imageUrl,
      title: feedTitles[index % feedTitles.length],
      description: feedDescriptions[index % feedDescriptions.length],
      creator: 'Ehsaas Jewellery',
      creatorAvatar: getFirstAvailableImage(product), // Use first available image for avatar
      likes: Math.floor(Math.random() * 3000) + 500,
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

export default function Reels() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // Add video ref
  const pendingAutoPlay = useRef(false);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Add muted state
  const [showProducts, setShowProducts] = useState(false);
  const [reelStates, setReelStates] = useState<Reel[]>([]);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isDeepLinked, setIsDeepLinked] = useState(false);
  const [videoError, setVideoError] = useState(false); // Add video error state
  const lastScrollTime = useRef<number>(0);
  const scrollCooldown = 500;
  const touchStartY = useRef<number>(0);
  const touchThreshold = 50;
  
  // Animation state for sliding
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);
  
  // Get current reel
  const currentReel = reelStates[currentReelIndex];
  
  // Check if current reel has video
  const hasVideo = !!currentReel?.videoUrl;
  
  // Fetch products from database
  const { products, loading, error } = useProducts(1, 20);

  // Generate reels when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const generatedReels = generateReelsFromProducts(products);
      setReelStates(generatedReels);

      // If a deep link is present (?reel=<id>), open that exact reel
      const params = new URLSearchParams(window.location.search);
      const reelParam = params.get('reel');
      if (reelParam) {
        setIsDeepLinked(true);
        const idx = generatedReels.findIndex(r => r.id === reelParam);
        if (idx >= 0) {
          setCurrentReelIndex(idx);
        }
      }
    }
  }, [products]);

  // Handle video playback when reel changes (defer autoplay until canplay)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentReel?.videoUrl) return;

    // Reset video error state for new reel
    setVideoError(false);

    // Prepare video for stable autoplay
    video.pause();
    setIsPlaying(false);
    video.currentTime = 0;
    video.muted = true;
    setIsMuted(true);

    const onCanPlay = () => {
      // Avoid duplicate play() calls
      if (pendingAutoPlay.current) return;
      pendingAutoPlay.current = true;
      
      video.play().then(() => {
        setIsPlaying(true);
        console.log('Video playing successfully');
      }).catch((error) => {
        console.warn('Autoplay blocked, will play on user interaction:', error);
        // Autoplay may be blocked; keep paused state
        setIsPlaying(false);
      }).finally(() => {
        // Allow future autoplay attempts on next reel change
        pendingAutoPlay.current = false;
      });
    };

    const onError = (e: Event) => {
      console.error('Video loading error:', e);
      setVideoError(true);
      // Try to reload the video with a different approach
      setTimeout(() => {
        if (video) {
          const src = video.currentSrc || video.src;
          if (src) {
            video.pause();
            // Try with different format or parameters
            const newSrc = src.includes('.mp4') ? 
              src.replace('.mp4', '.mov') : 
              `${src}.mp4`;
            video.src = newSrc;
            video.load();
          }
        }
      }, 1000);
    };

    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('error', onError, { once: true });

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.pause();
    };
  }, [currentReelIndex, currentReel?.videoUrl]);

  // Pause video when page/tab is hidden to reduce jank on resume
  useEffect(() => {
    const onVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else if (currentReel?.videoUrl) {
        // Attempt resume when returning
        video.muted = true;
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [currentReel?.videoUrl]);

  // Keep URL in sync with current reel (deep link)
  useEffect(() => {
    if (reelStates.length === 0) return;
    const reelId = reelStates[currentReelIndex]?.id;
    if (!reelId) return;

    const params = new URLSearchParams(window.location.search);
    params.set('reel', reelId);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [currentReelIndex, reelStates]);

  // Handle navigation between reels - Instant vertical scrolling with animations
  const handleNextReel = () => {
    const now = Date.now();
    if (reelStates.length === 0 || now - lastScrollTime.current < scrollCooldown) return;
    lastScrollTime.current = now;
    
    setSlideDirection('up');
    setCurrentReelIndex((prev) => (prev + 1) % reelStates.length);
  };

  const handlePrevReel = () => {
    const now = Date.now();
    if (reelStates.length === 0 || now - lastScrollTime.current < scrollCooldown) return;
    lastScrollTime.current = now;
    
    setSlideDirection('down');
    setCurrentReelIndex((prev) => (prev - 1 + reelStates.length) % reelStates.length);
  };

  const togglePlay = () => {
    if (currentReel?.videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
      setIsPlaying(!isPlaying);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (currentReel?.videoUrl && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">ए</span>
          </div>
          <p className="mt-4 text-foreground font-medium">Loading reels...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">Error loading reels: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!currentReel || reelStates.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-foreground">No reels available</p>
          <Button onClick={() => navigate('/')} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  const primaryProduct = currentReel.products.find(p => p.id === currentReel.primaryProductId) || currentReel.products[0];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 h-screen w-screen bg-black overflow-hidden"
      onTouchStart={(e) => {
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        // Allow default behavior for scrolling but track movement
        // Prevent scrolling of the page
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;
        
        if (Math.abs(deltaY) > touchThreshold) {
          if (deltaY > 0) {
            handleNextReel();
          } else {
            handlePrevReel();
          }
        }
      }}
    >
      {/* Instant Sliding Animation Container */}
      <motion.div
        key={currentReelIndex}
        initial={{ 
          y: slideDirection === 'up' ? '100%' : slideDirection === 'down' ? '-100%' : '0%',
          opacity: 0
        }}
        animate={{ 
          y: '0%',
          opacity: 1
        }}
        transition={{ 
          duration: 0.2, 
          ease: 'easeOut' 
        }}
        className="absolute inset-0"
      >
          {/* Background Media */}
          <div className="absolute inset-0">
          {hasVideo && !videoError ? (
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            poster={currentReel.posterImage}
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            disablePictureInPicture
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedData={() => {
              // Video loaded successfully
              if (videoRef.current && !isPlaying) {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                  console.log('Autoplay blocked, video will play on user interaction');
                });
              }
            }}
            onWaiting={() => {
              // Network hiccup — keep muted, try resuming when ready
              const v = videoRef.current; if (!v) return;
              v.muted = true;
              setIsMuted(true);
            }}
            onStalled={() => {
              // Attempt a small nudge to resume
              const v = videoRef.current; if (!v) return;
              const t = v.currentTime;
              v.currentTime = Math.max(0, t - 0.01);
            }}
            onCanPlayThrough={() => {
              // If paused due to buffering, try resuming
              const v = videoRef.current; if (!v) return;
              if (v.paused && isPlaying) {
                v.play().then(() => setIsPlaying(true)).catch((error) => {
                  console.error('Failed to resume video:', error);
                });
              }
            }}
            onError={(e) => {
              console.error('Video error:', e);
              setVideoError(true);
              // As a last resort, reload the element src once
              const v = videoRef.current; if (!v) return;
              const src = v.currentSrc || v.src;
              if (src) {
                v.pause();
                // Try with different format - add .mp4 if not present
                const newSrc = src.includes('.mp4') ? src : `${src}.mp4`;
                v.src = newSrc;
                v.load();
                // Note: v.load() is synchronous, so we can't catch errors directly
                // Add a small delay to check if loading succeeded
                setTimeout(() => {
                  if (v.error) {
                    console.error('Failed to reload video with new format');
                  }
                }, 100);
              }
            }}
          />
        ) : (
          <img
            src={currentReel.posterImage}
            alt={currentReel.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-white hover:text-white/90"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-white font-semibold text-lg">{currentReel.title}</h1>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-white/90"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Left Side - View Details */}
      <div className="absolute left-4 bottom-[176px] z-10 flex flex-col items-center space-y-4">
        {/* View Details Button with Profile Bubble - Sideways Layout */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20"
        >
          {/* Profile Bubble */}
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
            <img
              src={currentReel.creatorAvatar}
              alt={currentReel.creator}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* View Details Button */}
          <Button
            onClick={() => navigate(`/product/${primaryProduct.id}`)}
            className="text-white text-xs font-medium bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-4 py-1.5 transition-all duration-200 border border-white/30"
            size="sm"
          >
            View Details
          </Button>
        </motion.div>
      </div>

      {/* Right Side - Actions */}
      <div className="absolute right-4 bottom-[176px] z-10 flex flex-col items-center space-y-6">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setReelStates(prev => prev.map((reel, i) => 
                i === currentReelIndex 
                  ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
                  : reel
              ));
            }}
            className="text-white hover:text-white/90 p-3"
          >
            <Heart className={`w-6 h-6 ${currentReel.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <span className="text-white text-xs mt-1">{currentReel.likes.toLocaleString()}</span>
        </div>
        
        {/* Comment Button - using Share for now */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.set('reel', currentReel.id);
              const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
              if (navigator.share) {
                navigator.share({
                  title: currentReel.title,
                  text: currentReel.description,
                  url: shareUrl,
                });
              } else {
                navigator.clipboard.writeText(shareUrl);
              }
            }}
            className="text-white hover:text-white/90 p-3"
          >
            <Share2 className="w-6 h-6" />
          </Button>
          <span className="text-white text-xs mt-1">Share</span>
        </div>
        
        {/* Shopping Cart Button */}
        <div className="flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" as const 
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProducts(true)}
              className="text-white hover:text-white/90 p-3 relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {/* Cart badge */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
            </Button>
          </motion.div>
          <span className="text-white text-xs mt-1 font-semibold">Add to Cart</span>
          
          {/* Product Price Display */}
          <div className="mt-2 text-center">
            <div className="bg-gray-600/20 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block">
              <span className="text-white text-sm font-bold">₹{primaryProduct.price.toLocaleString()}</span>
              {primaryProduct.originalPrice && (
                <div className="text-white/70 text-xs line-through">₹{primaryProduct.originalPrice.toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content - Simplified for shopping reel */}
      <div className="absolute bottom-[49px] left-0 right-0 z-10 p-3">
        {/* Product Name */}
        <div className="mb-2">
          <h3 className="text-white font-semibold text-lg">{primaryProduct?.name || 'Product Name'}</h3>
        </div>
        
        {/* Simplified Description - Only show description without creator info */}
        <div className="">
          <p className="text-white text-sm mb-14">
            {expandedDescription 
              ? currentReel.description 
              : currentReel.description.length > 100 
                ? `${currentReel.description.substring(0, 100)}...` 
                : currentReel.description}
            {currentReel.description.length > 100 && (
              <button 
                onClick={() => setExpandedDescription(!expandedDescription)}
                className="text-white/80 text-xs ml-1 hover:text-white transition-colors"
              >
                {expandedDescription ? 'See less' : 'See more'}
              </button>
            )}
          </p>
          
        </div>
        
      </div>

      {/* Centered Play/Pause Controls */}
      <div className="absolute inset-0 flex items-center justify-center z-15">
        <div className="flex space-x-4">
          {/* Volume Control for Videos */}
          {hasVideo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:text-white/90 bg-black/30 backdrop-blur-sm rounded-full p-3"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="text-white hover:text-white/90 bg-black/30 backdrop-blur-sm rounded-full p-4"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </Button>
        </div>
      </div>

      {/* Product Sidebar */}
      <AnimatePresence>
        {showProducts && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-background z-30 shadow-2xl"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="text-lg font-semibold">Featured Product</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProducts(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Product Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Product Image */}
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={primaryProduct.image}
                      alt={primaryProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div>
                    <h3 className="text-xl font-bold mb-2">{primaryProduct.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-black">
                        ₹{primaryProduct.price.toLocaleString()}
                      </span>
                      {primaryProduct.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{primaryProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {primaryProduct.originalPrice && (
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                          {Math.round(((primaryProduct.originalPrice - primaryProduct.price) / primaryProduct.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-6">
                      {currentReel.description}
                    </p>
                    
                    <div className="space-y-3">
                      <Button 
                        className="w-full"
                        onClick={() => {
                          navigate(`/product/${primaryProduct.id}`);
                          setShowProducts(false);
                        }}
                      >
                        View Product Details
                      </Button>
                      <Button 
                        className="w-full bg-pink-200 hover:bg-pink-300 text-gray-800"
                        onClick={() => {
                          // Add to cart functionality would go here
                          setShowProducts(false);
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Scroll Down Indicator */}
      <motion.div 
        className="scroll-down-indicator absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        exit={{ opacity: 0, y: 20 }}
        onAnimationComplete={() => {
          // Auto-hide after 2.5 seconds
          setTimeout(() => {
            const element = document.querySelector('.scroll-down-indicator');
            if (element) {
              (element as HTMLElement).style.display = 'none';
            }
          }, 2500);
        }}
      >
        <motion.span 
          className="text-white text-xs opacity-30"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll down
        </motion.span>
        <motion.div 
          className="flex flex-col items-center space-y-1"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-4 h-4 text-white opacity-30" />
          <ChevronDown className="w-4 h-4 text-white opacity-30" />
        </motion.div>
      </motion.div>

      {/* Navigation - Vertical scrolling with wheel and touch */}
      <div 
        className="absolute inset-0 z-5"
        onWheel={(e) => {
          // Don't call preventDefault() to avoid passive event listener error
          if (Math.abs(e.deltaY) > 10) { // Minimum threshold to prevent accidental scrolls
            if (e.deltaY > 0) {
              handleNextReel(); // Scroll down
            } else {
              handlePrevReel(); // Scroll up
            }
          }
        }}
      />
      </motion.div>
    </div>
  );
}