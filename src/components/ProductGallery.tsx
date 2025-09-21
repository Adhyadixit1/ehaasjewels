import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function for optimized image URLs
const getOptimizedImageUrl = (url: string, width: number, quality = 80) => {
  if (!url) return '';

  // Check if it's a Cloudinary URL
  if (url.includes('/upload/')) {
    // Add optimization parameters for Cloudinary
    return url.replace('/upload/', `/upload/w_${width},h_${width},c_fill,q_${quality},f_webp/`);
  }

  return url;
};

interface ProductGalleryProps {
  images: string[];
  productName: string;
  priorityImage?: string; // First image to preload
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  priorityImage
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  const galleryImages = useMemo(() => images.filter(Boolean), [images]);

  const nextImage = useCallback(() => {
    if (galleryImages.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % Math.max(1, galleryImages.length));
  }, [galleryImages.length]);

  const prevImage = useCallback(() => {
    if (galleryImages.length === 0) return;
    const len = Math.max(1, galleryImages.length);
    setSelectedImageIndex((prev) => (prev - 1 + len) % len);
  }, [galleryImages.length]);

  // Touch handlers with passive listeners for better performance
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  }, [touchStartX]);

  const onTouchEnd = useCallback(() => {
    const threshold = 50;
    if (touchDeltaX > threshold) {
      prevImage();
    } else if (touchDeltaX < -threshold) {
      nextImage();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  }, [touchDeltaX, prevImage, nextImage]);

  // Preload priority image
  React.useEffect(() => {
    if (priorityImage && galleryImages.length > 0) {
      // Only preload if this is the first image (above the fold)
      const firstImage = galleryImages[0];
      if (firstImage && priorityImage === firstImage) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getOptimizedImageUrl(priorityImage, 800);
        link.fetchPriority = 'high';

        // Add to document head
        document.head.appendChild(link);

        // Cleanup function to remove the preload link
        return () => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        };
      }
    }
  }, [priorityImage, galleryImages]);

  if (galleryImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Image Display */}
      <div
        className="aspect-square bg-gray-100 relative overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {galleryImages.map((image, index) => (
          <img
            key={index}
            src={getOptimizedImageUrl(image, 800)}
            srcSet={[
              `${getOptimizedImageUrl(image, 400)} 400w`,
              `${getOptimizedImageUrl(image, 800)} 800w`,
              `${getOptimizedImageUrl(image, 1200)} 1200w`
            ].join(', ')}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            alt={`${productName} view ${index + 1}`}
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
              index === selectedImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}

        {/* Gallery Navigation */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white/90 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Gallery - Lazy load thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {galleryImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
              index === selectedImageIndex ? 'border-primary' : 'border-gray-200'
            }`}
          >
            <img
              src={getOptimizedImageUrl(image, 128)}
              alt={`${productName} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
