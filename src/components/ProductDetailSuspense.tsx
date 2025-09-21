import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
// import { ProductCacheService } from '@/services/ProductCacheService';
import { ProductService, ProductData } from '@/services/ProductService';
// import { ProductDetailSplash } from '@/components/ProductDetailSplash';
import { FullPageLoading } from '@/components/AppLoading';

// Lazy load the optimized product detail component
const ProductDetailOptimized = lazy(() => import('@/components/ProductDetailOptimized'));

export function ProductDetailSuspense() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullComponent, setShowFullComponent] = useState(false);

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

          // Add to recently viewed
          // ProductCacheService.addRecentlyViewedProduct(productData);
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

  // Show loading immediately with Ehsaas logo
  if (loading) {
    return <FullPageLoading message="Loading product details..." />;
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

  // Load full component when ready
  return (
    <Suspense fallback={<FullPageLoading message="Loading product details..." />}>
      <ProductDetailOptimized />
    </Suspense>
  );
}