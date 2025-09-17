import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Heart, 
  Send, 
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';

interface ShoppableProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface ReelPost {
  id: string;
  videoUrl?: string;
  posterImage: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  isLiked?: boolean;
  products: ShoppableProduct[];
  primaryProductId: string; // The main product this reel promotes
  timestamp: string;
}

interface FeedReelPostProps {
  post: ReelPost;
  onToggleLike: (postId: string) => void;
  onToggleWishlist: (postId: string) => void;
  onProductClick: (productId: string) => void;
  onOpenFullReel: (postId: string) => void;
  index: number;
}

export function FeedReelPost({ 
  post, 
  onToggleLike, 
  onToggleWishlist,
  onProductClick, 
  onOpenFullReel,
  index 
}: FeedReelPostProps) {
  const navigate = useNavigate();
  const { isInWishlist } = useWishlist();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if the post has a video URL
  const hasVideo = !!post.videoUrl;

  const togglePlay = () => {
    if (hasVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (hasVideo && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Autoplay only when the reel is in view
  useEffect(() => {
    if (!hasVideo || !containerRef.current || !videoRef.current) return;

    const node = containerRef.current;
    const video = videoRef.current;

    // Ensure muted to allow autoplay on mobile
    video.muted = true;
    setIsMuted(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            // In view — play
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            // Out of view — pause
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      observer.disconnect();
      video.pause();
    };
  }, [hasVideo]);

  const handleLike = () => {
    onToggleLike(post.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const handleProductClick = (product: ShoppableProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    onProductClick(product.id);
  };

  const handleVideoClick = () => {
    // Navigate to the primary product when video/image is clicked
    const primaryProduct = post.products.find(p => p.id === post.primaryProductId) || post.products[0];
    onProductClick(primaryProduct.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-card rounded-xl overflow-hidden shadow-card mb-6 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.creatorAvatar}
            alt={post.creator}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-sm font-hindi">{post.creator}</p>
            <p className="text-muted-foreground text-xs">{post.timestamp}</p>
          </div>
        </div>
      </div>

      {/* Video/Image Content */}
      <div className="relative aspect-[4/5] bg-black overflow-hidden w-full">
        <div
          ref={containerRef}
          onClick={handleVideoClick}
          className="relative w-full h-full cursor-pointer group"
        >
          {hasVideo ? (
            // Video element
            <video
              ref={videoRef}
              src={post.videoUrl}
              poster={post.posterImage}
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            // Image element
            <img
              src={post.posterImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          
          {/* Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            {hasVideo && !isPlaying && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </motion.div>
            )}
          </div>

          {/* Volume Control */}
          {hasVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="absolute bottom-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Product Tags */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%]">
            {post.products.slice(0, 3).map((product) => (
              <button
                key={product.id}
                onClick={(e) => handleProductClick(product, e)}
                className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full hover:bg-black/70 transition-colors truncate max-w-[120px]"
              >
                {product.name}
              </button>
            ))}
            {post.products.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProducts(!showProducts);
                }}
                className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full hover:bg-black/70 transition-colors"
              >
                +{post.products.length - 3}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Products List */}
      {showProducts && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 py-3 border-t border-border"
        >
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {post.products.map((product) => (
              <div 
                key={product.id}
                className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                onClick={(e) => handleProductClick(product, e)}
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-luxury">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="p-2">
                  <ShoppingBag className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 group"
            >
              <Heart 
                className={`w-6 h-6 transition-colors ${
                  post.isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-foreground group-hover:text-red-500'
                }`} 
              />
              <span className="text-sm font-medium">{post.likes.toLocaleString()}</span>
            </button>
            
            <button onClick={handleShare} className="group">
              <Send className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
          
          <button 
            onClick={() => onToggleWishlist(post.primaryProductId)}
            className="group"
          >
            <Heart className={`w-6 h-6 transition-colors ${
              isInWishlist(/^\d+$/.test(post.primaryProductId) ? BigInt(post.primaryProductId) : BigInt(0)) 
                ? 'fill-primary text-primary' 
                : 'text-foreground group-hover:text-primary'
            }`} />
          </button>
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <button 
            onClick={() => onProductClick(post.primaryProductId)}
            className="text-left w-full hover:text-primary transition-colors duration-200"
          >
            <p className="font-semibold text-sm">{post.title}</p>
          </button>
          <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
        </div>
      </div>
    </motion.article>
  );
}