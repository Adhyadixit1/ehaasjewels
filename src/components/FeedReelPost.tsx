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
  ShoppingBag,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { supabase } from '@/integrations/supabase/client';

interface ShoppableProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface ProductMusic {
  id: string;
  title: string | null;
  artist: string | null;
  audio_url: string;
  start_at_seconds: number;
  end_at_seconds: number | null;
}

interface ReelPost {
  id: string;
  videoUrl?: string;
  posterImage: string;
  // Optional gallery for image-only reels
  galleryImages?: string[];
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  isLiked?: boolean;
  products: ShoppableProduct[];
  primaryProductId: string; // The main product this reel promotes
  timestamp: string;
  productId?: number; // Add productId to fetch music
  hasMusic?: boolean; // Flag to indicate if this reel has music
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
  const [isMuted, setIsMuted] = useState(false); // Start unmuted by default
  const [showProducts, setShowProducts] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Controls visibility — hidden until tapped
  const [showControls, setShowControls] = useState(false);
  // Slideshow state for image-only posts
  const [slideIndex, setSlideIndex] = useState(0);
  const [music, setMusic] = useState<ProductMusic | null>(null);
  const [isMusicLoading, setIsMusicLoading] = useState(false);
  const imageSlides = (post.galleryImages && post.galleryImages.length > 0)
    ? post.galleryImages
    : [post.posterImage];

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
    const newMutedState = !isMuted;
    if (hasVideo && videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
      
      // If unmuting, try to play the audio
      if (!newMutedState && audioRef.current.paused) {
        audioRef.current.play().catch(e => {
          console.error('Error playing audio when unmuting:', e);
          // If autoplay is blocked, keep it muted
          if (e.name === 'NotAllowedError') {
            audioRef.current!.muted = true;
            audioRef.current!.play().catch(() => {});
          }
        });
      }
    }
    setIsMuted(newMutedState);
  };

  // Fetch product music when component mounts if this reel has music enabled
  useEffect(() => {
    const fetchMusic = async () => {
      // Only fetch music if this reel has music enabled
      if (!post.hasMusic || !post.productId) return;
      
      setIsMusicLoading(true);
      try {
        const { data, error } = await supabase
          .from('product_music')
          .select('*')
          .eq('product_id', post.productId)
          .eq('is_active', true)
          .order('priority', { ascending: true })
          .limit(1)
          .single();
        
        if (data && !error) {
          setMusic(data);
        }
      } catch (error) {
        console.error('Error fetching product music:', error);
      } finally {
        setIsMusicLoading(false);
      }
    };

    fetchMusic();
  }, [post.productId, post.hasMusic]);

  // Sync audio with video if music is available
  useEffect(() => {
    // Only set up audio sync if this reel has music
    if (!post.hasMusic || !hasVideo || !videoRef.current || !audioRef.current || !music) return;
    
    const video = videoRef.current;
    const audio = audioRef.current;
    
    // Ensure audio is ready to play
    const handleCanPlay = () => {
      console.log('Audio can play');
      audio.currentTime = music.start_at_seconds || 0;
      if (!video.paused && audio.paused) {
        audio.play().catch(e => console.error('Error playing audio on canplay:', e));
      }
    };
    
    const handlePlay = () => {
      console.log('Video play event');
      if (audio.paused) {
        audio.currentTime = music.start_at_seconds || 0;
        audio.play().catch(e => {
          console.error('Error playing audio:', e);
          // If autoplay with sound fails, try muted autoplay
          if (e.name === 'NotAllowedError') {
            audio.muted = true;
            audio.play().catch(() => {});
          }
        });
      }
    };
    
    const handlePause = () => {
      console.log('Video pause event');
      if (!audio.paused) {
        audio.pause();
      }
    };
    
    const handleTimeUpdate = () => {
      if (music.end_at_seconds && audio.currentTime >= music.end_at_seconds) {
        audio.currentTime = music.start_at_seconds || 0;
        audio.play().catch(e => console.error('Error looping audio:', e));
      }
    };
    
    // Set initial volume and muted state
    audio.volume = 1.0;
    audio.muted = isMuted;
    
    // Add event listeners
    audio.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    // Start playing if video is already playing
    if (!video.paused) {
      handlePlay();
    }
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      
      // Pause audio when unmounting
      if (!audio.paused) {
        audio.pause();
      }
    };
  }, [hasVideo, music, post.hasMusic, isMuted]);

  // Autoplay only when the reel is in view
  useEffect(() => {
    if (!hasVideo || !containerRef.current || !videoRef.current) return;

    const node = containerRef.current;
    const video = videoRef.current;

    // Set muted based on state (default to false for unmuted)
    video.muted = isMuted;
    
    // Try to autoplay with sound
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // If autoplay with sound fails, try muted autoplay
        if (error.name === 'NotAllowedError') {
          video.muted = true;
          video.play().catch(() => {});
          setIsMuted(true);
        }
      });
    }

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

  // Auto-hide controls after a short delay once shown
  useEffect(() => {
    if (!showControls) return;
    const t = setTimeout(() => setShowControls(false), 2000);
    return () => clearTimeout(t);
  }, [showControls]);

  // Auto-advance slideshow for image-only posts. Keep it non-intrusive: no touch handlers.
  useEffect(() => {
    if (hasVideo) return;
    if (!imageSlides || imageSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % imageSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hasVideo, imageSlides]);

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
        {/* Hidden audio element for music - only render if this reel has music */}
        {post.hasMusic && music && hasVideo && (
          <audio 
            ref={audioRef} 
            src={music.audio_url} 
            loop={!music.end_at_seconds}
            muted={isMuted}
            preload="auto"
            className="hidden"
            crossOrigin="anonymous"
          />
        )}
        
        <div
          ref={containerRef}
          onClick={(e) => {
            setShowControls(true);
            handleVideoClick();
          }}
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
              preload="auto"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onPlay={() => {
                setIsPlaying(true);
                // Try to unmute when video starts playing
                if (videoRef.current && isMuted) {
                  videoRef.current.muted = false;
                  setIsMuted(false);
                }
              }}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            // Image slideshow element (non-intrusive)
            <div className="w-full h-full relative">
              <img
                src={imageSlides[slideIndex]}
                alt={post.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
              {imageSlides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imageSlides.map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === slideIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Music Info - only show if this reel has music */}
        {post.hasMusic && music && hasVideo && (
          <div className="absolute bottom-24 left-4 right-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg max-w-xs">
            <Music className="h-4 w-4 flex-shrink-0" />
            <div className="truncate">
              <p className="text-sm font-medium truncate">{music.title || 'Untitled Track'}</p>
              {music.artist && <p className="text-xs text-gray-300 truncate">{music.artist}</p>}
            </div>
          </div>
        )}
      </div>

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