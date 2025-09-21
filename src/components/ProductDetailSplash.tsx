import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { ProductCacheService } from '@/services/ProductCacheService';
import { ProductService, ProductData } from '@/services/ProductService';

export function ProductDetailSplash() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProductPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch minimal product data for preview
        const productData = await ProductService.getProductById(id);

        if (productData) {
          setProduct(productData);
          setLoading(false);
        } else {
          setError('Product not found');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching product preview:', err);
        setError('Failed to load product');
        setLoading(false);
      }
    };

    fetchProductPreview();
  }, [id]);

  // Show splash screen with product image immediately
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with back button */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="ml-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Product image area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto animate-pulse"></div>
            </div>
          </div>
          
          {/* Product info skeleton */}
          <div className="p-4 bg-background">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if needed
  if (error && !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show product splash with actual data
  if (product && loading) {
    const primaryImage = product.product_images?.find(img => img.is_primary) || 
                         product.product_images?.[0] || 
                         null;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with back button */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="ml-3 flex-1 font-medium truncate">
            {product.name}
          </div>
          <div className="flex gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product image */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            {primaryImage ? (
              <img 
                src={primaryImage.image_url} 
                alt={product.name}
                className="object-contain max-h-full max-w-full"
                onLoad={() => console.log('Image loaded')}
              />
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-500">No image available</p>
              </div>
            )}
          </div>
          
          {/* Product info */}
          <div className="p-4 bg-background">
            <h1 className="text-xl font-bold mb-1">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1 text-sm font-medium">
                  {product.average_rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.review_count || 0} reviews)
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold">
                ₹{product.sale_price ? product.sale_price.toLocaleString() : product.price.toLocaleString()}
              </span>
              {product.sale_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium mb-3">
              Add to Cart
            </button>
            <button className="w-full py-3 border border-primary text-primary rounded-lg font-medium">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If we have product and not loading, render nothing (let the main component take over)
  return null;
}

// Icons for the splash screen
function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function Share2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function ShoppingBag({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}