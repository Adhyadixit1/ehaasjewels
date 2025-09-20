import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { AudioManager } from '@/utils/AudioManager';

// Helper functions for audio state logging
const getNetworkState = (state: number): string => {
  const states = [
    'NETWORK_EMPTY',      // 0
    'NETWORK_IDLE',       // 1
    'NETWORK_LOADING',    // 2
    'NETWORK_NO_SOURCE'   // 3
  ];
  return states[state] || `UNKNOWN_NETWORK_STATE_${state}`;
};

const getReadyState = (state: number): string => {
  const states = [
    'HAVE_NOTHING',       // 0
    'HAVE_METADATA',      // 1
    'HAVE_CURRENT_DATA',  // 2
    'HAVE_FUTURE_DATA',   // 3
    'HAVE_ENOUGH_DATA'    // 4
  ];
  return states[state] || `UNKNOWN_READY_STATE_${state}`;
};
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
  // Add gallery images for slideshow fallback
  galleryImages?: string[];
  title: string;
  description: string;
  creator: string;
  creatorAvatar: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  primaryProductId: string;
  productId?: number; // Add productId for music fetching
  hasMusic?: boolean; // Flag to indicate if this reel has music
  music_url?: string;
  music_audio_url?: string;
  music_title?: string;
  music_artist?: string;
  music?: {
    url: string;
    title?: string;
    artist?: string;
  };
  products: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    has_music?: boolean;
    music_url?: string;
    music_audio_url?: string;
    music_title?: string;
    music_artist?: string;
    music?: {
      url: string;
      title?: string;
      artist?: string;
    };
  }>;
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

// Helper: get all non-video gallery images
const getProductGalleryImages = (product: any): string[] => {
  const imgs = (product.product_images || []) as Array<{ image_url: string; media_type?: string }>;
  return imgs
    .filter((img) => (img.media_type || 'image').toLowerCase() !== 'video')
    .map((img) => img.image_url)
    .filter(Boolean);
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
    // Check if the product has a video in the primary media
    const primaryImage = product.product_images?.find((img: any) => img.is_primary);
    const hasVideo = primaryImage?.media_type === 'video';
    const galleryImages = getProductGalleryImages(product);
    // Poster should be a non-video image if available, else fallback
    const posterImage = galleryImages[0] || heroJewelry;
    
    // Derive video URL from the primary video media (not from poster)
    let videoUrl = undefined as string | undefined;
    if (hasVideo && primaryImage?.image_url) {
      const baseUrl = primaryImage.image_url as string;
      if (baseUrl.includes('cloudinary.com')) {
        // Normalize to mp4 and ensure /video/upload/
        videoUrl = baseUrl.replace(/\.(mp4|mov|webm|avi).*$/, '') + '.mp4';
        if (!videoUrl.includes('/video/upload/')) {
          videoUrl = videoUrl.replace('/image/upload/', '/video/upload/');
        }
      } else {
        videoUrl = baseUrl.includes('.mp4') ? baseUrl : `${baseUrl}.mp4`;
      }
    }

    // Debug log for product being processed - log the entire product for inspection
    console.log(`Processing product ${product.id} - ${product.name}`, {
      has_music: product.has_music,
      music_url: product.music_url,
      music: product.music,
      music_title: product.music_title,
      music_artist: product.music_artist,
      // Log all product properties to help with debugging
      allProductProperties: Object.keys(product)
    });
    
    // Check if product has music - check multiple possible fields
    // Also check for any music-related fields directly on the product
    const hasMusic = !!(
      product.has_music === true || 
      product.music_url || 
      (product.music && product.music.url) ||
      product.audio_url ||
      product.music_audio_url
    );
    
    // Get music data from various possible locations in the product
    const musicData = product.music || {};
    const musicUrl = (
      product.music_url || 
      musicData.url || 
      product.audio_url || 
      product.music_audio_url ||
      null
    );
    
    const musicTitle = (
      product.music_title || 
      musicData.title || 
      'Background Music'
    );
      
    const musicArtist = (
      product.music_artist || 
      musicData.artist || 
      'Ehsaas Jewels'
    );
    
    console.log(`Music data for product ${product.id}:`, {
      hasMusic,
      musicUrl,
      musicTitle,
      musicArtist,
      musicData,
      // Log the final values being used
      finalMusicUrl: musicUrl,
      finalMusicTitle: musicTitle,
      finalMusicArtist: musicArtist
    });
    
    return {
      id: `fr${product.id}`,
      videoUrl: videoUrl,
      posterImage,
      galleryImages,
      title: feedTitles[index % feedTitles.length],
      description: feedDescriptions[index % feedDescriptions.length],
      creator: 'Ehsaas Jewellery',
      creatorAvatar: getFirstAvailableImage(product), // Use first available image for avatar
      likes: Math.floor(Math.random() * 3000) + 500,
      isLiked: false, // Always start unliked for new profiles
      timestamp: `${Math.floor(Math.random() * 24) + 1} hours ago`,
      primaryProductId: product.id.toString(),
      productId: product.id, // Add productId for music fetching
      hasMusic, // Set the hasMusic flag
      music: hasMusic && musicUrl ? {
        url: musicUrl,
        title: musicTitle,
        artist: musicArtist
      } : undefined,
      products: [{
        id: product.id.toString(),
        name: product.name,
        // Generic mapping: smaller value is current price, larger is compare-at
        ...(() => {
          const base = Number(product.price ?? 0);
          const alt = product.sale_price;
          if (alt == null || alt === base) {
            return { price: base, originalPrice: undefined };
          }
          const current = Math.min(base, Number(alt));
          const original = Math.max(base, Number(alt));
          return { price: current, originalPrice: original };
        })(),
        image: posterImage
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
  const [isMuted, setIsMuted] = useState(true);
  const audioManagerRef = useRef<AudioManager | null>(null); // Start unmuted to allow audio playback
  // Background media preloading caches
  const preloadedImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const preloadedVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const prefetchLinksRef = useRef<Set<string>>(new Set());
  const [music, setMusic] = useState<{
    url: string;
    title?: string;
    artist?: string;
    startAt?: number;
    endAt?: number | null;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [reelStates, setReelStates] = useState<Reel[]>([]);

  // Helper: add <link rel="prefetch"> for a URL
  const addPrefetch = useCallback((url: string) => {
    if (!url || prefetchLinksRef.current.has(url)) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    prefetchLinksRef.current.add(url);
  }, []);

  // Helper: preload an image and cache it
  const preloadImage = useCallback(async (url?: string | null) => {
    if (!url) return;
    if (preloadedImagesRef.current.has(url)) return;
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image preload failed'));
      img.decoding = 'async';
      img.src = url;
      preloadedImagesRef.current.set(url, img);
    }).catch(() => {});
  }, []);

  // Helper: preload a video metadata/buffer and cache it
  const preloadVideo = useCallback(async (url?: string | null) => {
    if (!url) return;
    if (preloadedVideosRef.current.has(url)) return;
    await new Promise<void>((resolve, reject) => {
      const v = document.createElement('video');
      v.preload = 'auto';
      v.muted = true;
      v.playsInline = true as any;
      v.src = url;
      const onCanPlay = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); reject(new Error('Video preload failed')); };
      const cleanup = () => {
        v.removeEventListener('canplay', onCanPlay);
        v.removeEventListener('error', onError);
      };
      v.addEventListener('canplay', onCanPlay, { once: true });
      v.addEventListener('error', onError, { once: true });
      // Kick off load
      try { v.load(); } catch {}
      preloadedVideosRef.current.set(url, v);
    }).catch(() => {});
  }, []);

  // Preload next reels' media to improve perceived performance
  useEffect(() => {
    if (!reelStates || reelStates.length === 0) return;
    const PRELOAD_AHEAD = 2;
    const PRELOAD_BEHIND = 1; // for quick reverse scrolls

    const indicesToPreload = new Set<number>();
    for (let i = 1; i <= PRELOAD_AHEAD; i++) {
      const idx = currentReelIndex + i;
      if (idx < reelStates.length) indicesToPreload.add(idx);
    }
    for (let i = 1; i <= PRELOAD_BEHIND; i++) {
      const idx = currentReelIndex - i;
      if (idx >= 0) indicesToPreload.add(idx);
    }

    // Trigger preloads
    indicesToPreload.forEach((idx) => {
      const reel = reelStates[idx];
      if (!reel) return;
      // Poster and gallery
      preloadImage(reel.posterImage);
      if (Array.isArray(reel.galleryImages)) {
        // Preload first few gallery images
        for (let i = 0; i < Math.min(2, reel.galleryImages.length); i++) {
          preloadImage(reel.galleryImages[i]);
        }
      }
      // Video
      if (reel.videoUrl) {
        preloadVideo(reel.videoUrl);
      }
      // Music/audio
      const musicUrl = (reel as any).music?.url || (reel as any).music_audio_url || (reel as any).music_url;
      if (musicUrl) addPrefetch(musicUrl);
    });

    // Prune caches to keep memory bounded
    const minKeep = Math.max(0, currentReelIndex - PRELOAD_BEHIND);
    const maxKeep = Math.min(reelStates.length - 1, currentReelIndex + PRELOAD_AHEAD);
    const urlsInWindow = new Set<string>();
    for (let i = minKeep; i <= maxKeep; i++) {
      const r = reelStates[i]; if (!r) continue;
      if (r.posterImage) urlsInWindow.add(r.posterImage);
      if (Array.isArray(r.galleryImages)) r.galleryImages.slice(0, 2).forEach(u => urlsInWindow.add(u));
      if (r.videoUrl) urlsInWindow.add(r.videoUrl);
      const au = (r as any).music?.url || (r as any).music_audio_url || (r as any).music_url;
      if (au) urlsInWindow.add(au);
    }

    // Remove images not in window
    preloadedImagesRef.current.forEach((_, url) => {
      if (!urlsInWindow.has(url)) {
        preloadedImagesRef.current.delete(url);
      }
    });
    // Remove videos not in window
    preloadedVideosRef.current.forEach((v, url) => {
      if (!urlsInWindow.has(url)) {
        try { v.src = ''; v.load(); } catch {}
        preloadedVideosRef.current.delete(url);
      }
    });
    // Note: we don't remove prefetch <link>s aggressively; they are cheap

    return () => {
      // No-op; caches persist across index changes
    };
  }, [currentReelIndex, reelStates, addPrefetch, preloadImage, preloadVideo]);

  // Cleanup caches on unmount
  useEffect(() => {
    return () => {
      preloadedVideosRef.current.forEach((v) => { try { v.src = ''; v.load(); } catch {} });
      preloadedVideosRef.current.clear();
      preloadedImagesRef.current.clear();
      // Optionally remove prefetch links
      // We leave them as-is since browsers GC them; implement if needed
    };
  }, []);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isDeepLinked, setIsDeepLinked] = useState(false);
  const [videoError, setVideoError] = useState(false); // Add video error state
  // Slideshow state for non-video reels
  const [slideIndex, setSlideIndex] = useState(0);
  // Controls visibility (play/pause and volume) — hidden until tapped
  const [showControls, setShowControls] = useState(false);
  // Require a user gesture before attempting audio playback
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const lastScrollTime = useRef<number>(0);
  // Increase cooldown to allow longer card scroll feel (similar to Instagram)
  const scrollCooldown = 900;
  const touchStartY = useRef<number>(0);
  // Increase threshold to require a more intentional swipe
  const touchThreshold = 90;
  // Fade control refs
  const fadeRAF = useRef<number | null>(null);
  const fadeTimeout = useRef<number | null>(null);
  const prevIndexRef = useRef<number>(0);
  // Used to cancel in-flight fades when rapidly switching reels
  const fadeContextIdRef = useRef<number>(0);
  // Used to cancel entire transition sequences on fast scrolling
  const transitionIdRef = useRef<number>(0);
  // Guard to avoid triggering multiple pre-fades during the same gesture
  const preFadeActiveRef = useRef<boolean>(false);
  
  // Animation state for sliding
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);
  
  // Get current reel
  const currentReel = reelStates[currentReelIndex];
  
  // Check if current reel has video
  const hasVideo = !!currentReel?.videoUrl;
  const gallerySlides = currentReel?.galleryImages && currentReel.galleryImages.length > 0
    ? currentReel.galleryImages
    : currentReel?.posterImage
      ? [currentReel.posterImage]
      : [];
  
  // Fetch products from database
  const { products, loading, error } = useProducts(1, 20);

  // Generate reels when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      console.log('Products loaded, generating reels:', products);
      const generatedReels = generateReelsFromProducts(products);
      
      // Log product 52's data for debugging
      const product52 = products.find(p => p.id === 52);
      if (product52) {
        console.log('Product 52 data:', {
          id: product52.id,
          name: product52.name,
          has_music: product52.has_music,
          music_url: product52.music_url,
          music: product52.music,
          product_images: product52.product_images
        });
      }
      
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

  // Reset slideshow index on reel change
  useEffect(() => {
    setSlideIndex(0);
  }, [currentReelIndex]);

  // Auto-advance slideshow for image-only or video-error reels
  useEffect(() => {
    if (hasVideo && !videoError) return;
    if (!gallerySlides || gallerySlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % gallerySlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [hasVideo, videoError, gallerySlides]);

  // Auto-hide controls after a short delay once shown
  useEffect(() => {
    if (!showControls) return;
    const t = setTimeout(() => setShowControls(false), 2500);
    return () => clearTimeout(t);
  }, [showControls]);

  // Listen for first user interaction to allow media playback
  useEffect(() => {
    if (hasUserInteracted) return;
    const onFirstInteract = () => setHasUserInteracted(true);
    document.addEventListener('pointerdown', onFirstInteract, { once: true });
    document.addEventListener('keydown', onFirstInteract, { once: true });
    return () => {
      document.removeEventListener('pointerdown', onFirstInteract as any);
      document.removeEventListener('keydown', onFirstInteract as any);
    };
  }, [hasUserInteracted]);

  // Fetch music for the current reel
  const fetchMusic = useCallback(async () => {
    if (!currentReel) {
      console.log('No current reel');
      return;
    }

    console.log('Fetching music for reel (Supabase):', {
      reelId: currentReel.id,
      productId: currentReel.productId || currentReel.primaryProductId,
      hasMusic: currentReel.hasMusic
    });

    try {
      // First, check if we have a product ID to fetch music for
      const productIdRaw = currentReel.productId ?? currentReel.primaryProductId;
      if (productIdRaw === undefined || productIdRaw === null) {
        console.log('No product ID found for reel:', currentReel.id);
        setMusic(null);
        return;
      }
      const productId = typeof productIdRaw === 'string' ? Number(productIdRaw) : productIdRaw;
      if (Number.isNaN(productId)) {
        console.warn('Product ID is not a valid number:', productIdRaw);
        setMusic(null);
        return;
      }

      // Query Supabase product_music table directly
      console.log('Querying Supabase for music with productId:', productId, 'type:', typeof productId);
      
      // Now try the actual query
      const query = supabase
        .from('product_music')
        .select('audio_url,title,artist,start_at_seconds,end_at_seconds')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .limit(1);
        
      console.log('Executing Supabase query:', {
        table: 'product_music',
        select: 'audio_url,title,artist,start_at_seconds,end_at_seconds',
        filters: {
          product_id: { value: productId, type: typeof productId },
          is_active: true
        },
        order: 'priority (asc)',
        limit: 1
      });
      
      const { data, error, status, statusText } = await query;
      
      console.log('Supabase response:', {
        status,
        statusText,
        data,
        error,
        hasData: !!data,
        isArray: Array.isArray(data),
        dataLength: Array.isArray(data) ? data.length : 'not an array',
        hasAudioUrl: Array.isArray(data) && data.length > 0 ? 'audio_url' in data[0] : 'no data'
      });

      if (error) {
        console.error('Supabase product_music query error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
          // status is not a standard property of PostgrestError
        });
        setMusic(null);
        return;
      }

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
      console.log('Processed row:', row);
      
      if (!row || !row.audio_url) {
        console.log('No active music rows found for product:', productId, {
          rowExists: !!row,
          hasAudioUrl: row ? 'audio_url' in row : false,
          rowKeys: row ? Object.keys(row) : 'no row'
        });
        setMusic(null);
        return;
      }

      setMusic({
        url: row.audio_url,
        title: row.title || 'Background Music',
        artist: row.artist || 'Ehsaas Jewels',
        startAt: row.start_at_seconds || 0,
        endAt: row.end_at_seconds ?? null,
      });
      
    } catch (error) {
      console.error('Error in fetchMusic:', error);
      setMusic(null);
    }
  }, [currentReel]);

  // Helper to fade volume
  const fadeVolume = useCallback((
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number = 0
  ): Promise<void> => {
    if (durationMs <= 0) {
      audio.volume = to;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      if (!audio) return resolve();
      if (fadeRAF.current) cancelAnimationFrame(fadeRAF.current);
      
      // Ensure volume stays within valid range
      const startVolume = Math.max(0, Math.min(1, from));
      const endVolume = Math.max(0, Math.min(1, to));
      // Capture current fade context id; if a new fade starts, cancel this one
      const myFadeId = ++fadeContextIdRef.current;
      
      const start = performance.now();
      const step = (now: number) => {
        // Cancel if a newer fade started
        if (myFadeId !== fadeContextIdRef.current) {
          resolve();
          return;
        }
        const elapsed = now - start;
        let t = Math.min(1, elapsed / durationMs);
        
        // Calculate new volume, ensuring it stays in [0, 1] range
        let newVolume = startVolume + (endVolume - startVolume) * t;
        newVolume = Math.max(0, Math.min(1, newVolume));
        
        try {
          audio.volume = newVolume;
        } catch (e) {
          console.warn('Error setting volume:', e);
          cancelAnimationFrame(fadeRAF.current!);
          resolve();
          return;
        }
        
        if (t < 1) {
          fadeRAF.current = requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      
      // Set initial volume
      audio.volume = startVolume;
      fadeRAF.current = requestAnimationFrame(step);
    });
  }, []);

  // Prefade current audio as soon as user begins a scroll gesture
  const preFadeCurrentAudio = useCallback(async () => {
    if (preFadeActiveRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) return;
    preFadeActiveRef.current = true;
    try {
      audio.muted = false;
      // Faster fade to ensure audio stops before next reel loads
      await fadeVolume(audio, audio.volume, 0, 200);
      // Ensure audio is fully stopped after fade
      audio.pause();
      audio.currentTime = 0;
    } catch {}
  }, [fadeVolume]);

  // Set music when reel changes
  useEffect(() => {
    console.log('Music useEffect triggered', {
      currentReelId: currentReel?.id,
      hasMusic: currentReel?.hasMusic,
      productId: currentReel?.productId,
      musicData: currentReel?.music
    });

    // If the current reel already has music data, use it directly
    if (currentReel?.music?.url) {
      console.log('Using music from reel data:', {
        reelId: currentReel.id,
        musicUrl: currentReel.music.url,
        title: currentReel.music.title,
        artist: currentReel.music.artist
      });
      setMusic({
        url: currentReel.music.url,
        title: currentReel.music.title || 'Background Music',
        artist: currentReel.music.artist || 'Ehsaas Jewels'
      });
      return;
    }

    // Otherwise, try to fetch the music
    fetchMusic();
  }, [currentReel?.id, currentReel?.productId, currentReel?.hasMusic, currentReel?.music, fetchMusic]);

  // Handle playback when reel changes with sequenced fade-out -> unload -> fade-in
  useEffect(() => {
    // reset pre-fade guard for the new reel
    preFadeActiveRef.current = false;
    const video = videoRef.current;
    const audio = audioRef.current;
    
    // Bump transition id to cancel any prior transitions
    const myTransitionId = ++transitionIdRef.current;
    
    // Reset states for new reel
    setVideoError(false);
    setIsPlaying(true);
    
    const onVideoError = (e: Event) => {
      console.error('Video loading error:', e);
      setVideoError(true);
    };
    
    const fadeOutAndStopPrevious = async () => {
      const indexChanged = prevIndexRef.current !== currentReelIndex;
      if (!indexChanged || !audioManagerRef.current) return;
      
      try {
        // Stop with fade out
        await audioManagerRef.current.stop(true);
      } catch (error) {
        console.warn('Error stopping previous audio:', error);
      }
    };
    
    const startAudioPlayback = async () => {
      if (!music?.url || !audioManagerRef.current) return;
      if (pendingAutoPlay.current) return;
      pendingAutoPlay.current = true;
      
      try {
        // Short delay to avoid thrash during rapid index changes
        await new Promise(r => setTimeout(r, 50));
        if (myTransitionId !== transitionIdRef.current) return;
        
        // Start playback with fade in
        await audioManagerRef.current.play(music.url, { fadeIn: true });
        await audioManagerRef.current.setMuted(isMuted);
        
        if (myTransitionId !== transitionIdRef.current) return;
      } catch (err) {
        console.warn('Audio playback failed:', err);
      } finally {
        pendingAutoPlay.current = false;
      }
    };
    
    const startVideoPlayback = async () => {
      const v = videoRef.current;
      if (!v || !currentReel?.videoUrl) return;
      
      if (v.readyState < 3) {
        // Wait for video to have enough data to play
        await new Promise<void>((resolve) => {
          const onCanPlay = () => {
            v.removeEventListener('canplay', onCanPlay);
            resolve();
          };
          v.addEventListener('canplay', onCanPlay, { once: true });
        });
      }
      
      // Ensure video is muted for autoplay and set volume to 0 (we only want audio from audio element)
      v.muted = true;
      v.volume = 0;
      
      try {
        await v.play();
        console.log('Video playback started');
      } catch (err) {
        console.warn('Video autoplay failed, trying with muted:', err);
        // Try again with muted if first attempt fails
        try { v.muted = true; await v.play(); } catch (e2) {}
      }
      setIsPlaying(true);
    };
    
    const run = async () => {
      // Sequence: fade-out prev -> stop -> start next with delayed fade-in
      await fadeOutAndStopPrevious();
      if (myTransitionId !== transitionIdRef.current) return; // cancelled
      
      // Start audio if available
      if (music?.url) {
        await startAudioPlayback();
      }
      if (myTransitionId !== transitionIdRef.current) return;
      
      // Then handle video
      if (currentReel?.videoUrl) {
        await startVideoPlayback();
      }
    };
    
    // If we have a video element, still attach listeners as backup
    if (video && currentReel?.videoUrl) {
      video.addEventListener('error', onVideoError);
      if (video.readyState >= 3) {
        run();
      } else {
        // If not ready yet, kick off once it can play some data
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay);
          if (myTransitionId === transitionIdRef.current) run();
        };
        video.addEventListener('canplay', onCanPlay);
      }
    } else {
      // No video, just run audio transition
      run();
    }
    
    return () => {
      if (fadeRAF.current) cancelAnimationFrame(fadeRAF.current);
      if (fadeTimeout.current) window.clearTimeout(fadeTimeout.current);
      if (video) {
        video.removeEventListener('error', onVideoError);
      }
    };
  }, [currentReel?.videoUrl, music?.url, hasUserInteracted, currentReelIndex]);

  // Track last active index to avoid re-running transitions on non-changes
  useEffect(() => {
    prevIndexRef.current = currentReelIndex;
  }, [currentReelIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeRAF.current) {
        cancelAnimationFrame(fadeRAF.current);
      }
      if (fadeTimeout.current) {
        clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  // Handle video error and retry with different format
  const handleVideoError = (e: Event) => {
    console.error('Video loading error:', e);
    const video = videoRef.current;
    if (!video) return;
    
    setVideoError(true);
    
    // Try to reload the video with a different approach
    setTimeout(() => {
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
    }, 1000);
  };

  // Pause video when page/tab is hidden to reduce jank on resume
  useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      
      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else if (currentReel?.videoUrl) {
        // Attempt to resume playback when tab becomes visible again
        video.play().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
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

  // Handle navigation between reels with proper audio cleanup
  const handleNextReel = async () => {
    const now = Date.now();
    if (reelStates.length === 0 || now - lastScrollTime.current < scrollCooldown) return;
    lastScrollTime.current = now;
    
    // Strongly stop and unload any playing media to avoid bleed-over
    strongStopAllMedia();
    // Clear current music reference to avoid playing during transition
    setMusic(null);
    // Cancel any in-flight transitions
    transitionIdRef.current++;
    
    // Small delay to ensure clean transition
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setSlideDirection('up');
    setCurrentReelIndex((prev) => (prev + 1) % reelStates.length);
  };

  const handlePrevReel = async () => {
    const now = Date.now();
    if (reelStates.length === 0 || now - lastScrollTime.current < scrollCooldown) return;
    lastScrollTime.current = now;
    
    // Strongly stop and unload any playing media to avoid bleed-over
    strongStopAllMedia();
    // Clear current music reference to avoid playing during transition
    setMusic(null);
    // Cancel any in-flight transitions
    transitionIdRef.current++;
    
    // Small delay to ensure clean transition
    await new Promise(resolve => setTimeout(resolve, 50));
    
    setSlideDirection('down');
    setCurrentReelIndex((prev) => (prev - 1 + reelStates.length) % reelStates.length);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    
    if (video && currentReel?.videoUrl) {
      if (isPlaying) {
        video.pause();
        if (audio) audio.pause();
      } else {
        video.play().catch(console.error);
        if (audio) audio.play().catch(console.error);
      }
    } else if (audio && music?.url) {
      // For slideshows with music
      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    if (audioManagerRef.current) {
      await audioManagerRef.current.setMuted(newMutedState);
    }
    // Keep video muted always; we use separate audio track
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
    setIsMuted(newMutedState);
  };


  // Strongly ensure no media from previous reel continues playing
  const strongStopAllMedia = useCallback(() => {
    try {
      const a = audioRef.current;
      if (a) {
        try { a.pause(); } catch {}
        try { a.currentTime = 0; } catch {}
        try { a.muted = true; } catch {}
        try { a.src = ''; a.load(); } catch {}
        try { a.volume = 0; } catch {}
      }
    } catch {}
    try {
      const v = videoRef.current;
      if (v) {
        try { v.pause(); } catch {}
        try { v.currentTime = 0; } catch {}
        try { v.muted = true; } catch {}
      }
    } catch {}
    pendingAutoPlay.current = false;
  }, []);

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
      style={{
        overscrollBehaviorY: 'none',
        WebkitOverflowScrolling: 'auto',
        touchAction: 'none',
      } as React.CSSProperties}
      onTouchStart={(e) => {
        touchStartY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        // Track movement; if user clearly started a swipe, start fading audio
        const dy = touchStartY.current - e.touches[0].clientY;
        if (Math.abs(dy) > 10) {
          e.stopPropagation();
          // Prevent native scrolling behaviors like pull-to-refresh and rubber-banding
          e.preventDefault();
          // Start fading audio smoothly during scroll
          preFadeCurrentAudio();
        }
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
      {/* Tap to enable sound overlay */}
      {music?.url && !hasUserInteracted && (
        <div className="absolute inset-0 z-30 flex items-end justify-center pb-24 pointer-events-none">
          <div className="bg-black/60 text-white text-sm px-3 py-2 rounded-full">
            Tap to enable sound
          </div>
        </div>
      )}
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
          duration: 0.38, 
          ease: 'easeOut' 
        }}
        className="absolute inset-0"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
          {/* Audio Element for Music */}
      {music?.url && (
        <audio
          ref={audioRef}
          src={music.url}
          loop
          preload="auto"
          crossOrigin="anonymous"
          onPlay={() => console.log('Audio playback started:', music.url)}
          onPause={() => console.log('Audio playback paused')}
          onError={(e) => {
            const audio = e.target as HTMLAudioElement;
            const error = audio.error;
            const errorInfo = {
              errorCode: error?.code,
              errorMessage: error?.message,
              errorType: error?.code === 1 ? 'MEDIA_ERR_ABORTED' :
                         error?.code === 2 ? 'MEDIA_ERR_NETWORK' :
                         error?.code === 3 ? 'MEDIA_ERR_DECODE' :
                         error?.code === 4 ? 'MEDIA_ERR_SRC_NOT_SUPPORTED' :
                         'UNKNOWN_ERROR'
            };
            console.error('Audio error:', errorInfo);
          }}
          onCanPlayThrough={() => {
            // If paused but should be playing, resume
            const v = videoRef.current;
            if (v && v.paused && isPlaying) {
              v.play().catch(console.warn);
            }
          }}
          onLoadedMetadata={() => {
            const audioElement = audioRef.current;
            if (!audioElement) return;
            
            // Safely access audioTracks with type assertion
            const audioTracks = 'audioTracks' in audioElement 
              ? (audioElement as any).audioTracks?.length 
              : 'N/A';
              
            console.log('Audio metadata loaded:', {
              duration: audioElement.duration,
              audioTracks,
              volume: audioElement.volume,
              muted: audioElement.muted,
              readyState: getReadyState(audioElement.readyState),
              networkState: getNetworkState(audioElement.networkState)
            });
          }}
          onStalled={() => console.warn('Audio stalled - buffering data')}
          onWaiting={() => console.log('Audio waiting for data')}
          onPlaying={() => console.log('Audio playing')}
          onEnded={() => console.log('Audio ended')}
          onEmptied={() => console.warn('Audio emptied - media has been reset')}
          onSuspend={() => console.log('Audio loading suspended')}
          onAbort={() => console.warn('Audio loading aborted')}
          className="hidden"
        />
      )}
      
      {/* Background Media */}
      <div
        className="absolute inset-0"
        onWheel={(e) => {
          // Desktop: start fading audio on scroll
          if (Math.abs(e.deltaY) > 10) {
            preFadeCurrentAudio();
            // Prevent default to avoid page scroll
            e.preventDefault();
            // Handle the scroll after a small delay
            setTimeout(() => {
              if (e.deltaY > 0) {
                handleNextReel();
              } else {
                handlePrevReel();
              }
            }, 50);
          }
        }}
        onClick={() => {
          setShowControls(true);
          if (!hasUserInteracted) {
            setHasUserInteracted(true);
            // Try to start audio/video immediately after interaction
            try {
              if (audioRef.current && music?.url) {
                audioRef.current.muted = false;
                audioRef.current.play().catch(() => {
                  // Fallback to muted if still blocked
                  audioRef.current!.muted = true;
                  audioRef.current!.play().catch(() => {});
                });
              }
              if (videoRef.current && currentReel?.videoUrl) {
                // Prefer unmuted if audio is separate; browsers may still require muted
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
              }
            } catch {}
          }
        }}
      >
          {hasVideo && !videoError ? (
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            poster={currentReel.posterImage}
            loop
            playsInline
            autoPlay
            muted
            preload="auto"
            disablePictureInPicture
            className="w-full h-full object-cover"
            onPlay={() => {
              setIsPlaying(true);
              // Sync audio with video when video plays
              if (audioRef.current && !audioRef.current.paused) {
                audioRef.current.currentTime = videoRef.current?.currentTime || 0;
                audioRef.current.play().catch(console.error);
              }
            }}
            onPause={() => {
              setIsPlaying(false);
              // Pause audio when video pauses
              if (audioRef.current) {
                audioRef.current.pause();
              }
            }}
            onLoadedData={() => {
              // Video loaded successfully
              const v = videoRef.current;
              if (v && v.paused && isPlaying) {
                v.play().catch(console.warn);
              }
            }}
            onWaiting={() => {
              // Network hiccup — ensure muted
              const v = videoRef.current;
              if (v) v.muted = true;
            }}
            onStalled={() => {
              // Attempt a small nudge to resume
              const v = videoRef.current;
              if (v) v.currentTime = Math.max(0, (v.currentTime - 0.1));
            }}
            onCanPlayThrough={() => {
              // If paused but should be playing, resume
              const v = videoRef.current;
              if (v && v.paused && isPlaying) {
                v.play().catch(console.warn);
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
          // Non-intrusive image slideshow fallback
          <div className="w-full h-full relative">
            {gallerySlides.length > 0 && (
              <img
                src={gallerySlides[slideIndex]}
                alt={currentReel.title}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            )}
            {gallerySlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {gallerySlides.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === slideIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
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
        
        <div className="flex items-center space-x-2">
          {/* Mute/Unmute Button */}
          {music && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white/90 relative group"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:text-white/90"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
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

      {/* Centered Play/Pause Controls - visible only when tapped */}
      {hasVideo && showControls && (
        <div className="absolute inset-0 flex items-center justify-center z-15">
          <div className="flex space-x-4">
            {/* Volume Control for Videos and Music */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="text-white hover:text-white/90 bg-black/30 backdrop-blur-sm rounded-full p-3 relative group"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
              {currentReel.music && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  ♫
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs whitespace-nowrap px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {currentReel.music ? 'Toggle Music' : 'Toggle Sound'}
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
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
      )}

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
              <div className="flex-1 overflow-y-auto p-4" style={{ touchAction: 'auto' }}>
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