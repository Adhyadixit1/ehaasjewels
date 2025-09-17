import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { ProductService } from '@/services/ProductService';
import { generateReviews, generateReviewCount } from '@/utils/reviewData';
import { InlineLoading } from '@/components/AppLoading';

interface ProductReview {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_title: string;
  created_at: string;
  is_verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Generate reviews based on product ID (using local generation instead of API calls)
        const reviewCount = generateReviewCount(productId); // Use consistent review count
        const productReviews = generateReviews(productId, reviewCount);
        setReviews(productReviews);
      } catch (err) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const handleReviewChange = (field: string, value: string | number) => {
    setNewReview(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReviewSubmitted(true);
      // Reset form
      setNewReview({
        rating: 5,
        title: '',
        text: ''
      });
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="border-t border-border p-4">
        <InlineLoading message="Loading reviews..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-border p-4">
        <p className="text-red-500">Error loading reviews: {error}</p>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  // Use the generated review count instead of reviews.length for consistency
  const reviewCount = generateReviewCount(productId);

  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Customer Reviews</h3>
        <div className="text-sm text-muted-foreground">
          {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </div>
      </div>
      
      {/* Average Rating */}
      <div className="space-y-4 p-4 bg-muted rounded-lg mb-6">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">/5 • {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</div>
        </div>
        <div className="flex justify-center">
          {renderStars(Math.floor(averageRating))}
        </div>
        {reviewCount === 0 && (
          <p className="text-center text-muted-foreground mt-2">
            Be the first to review this product!
          </p>
        )}
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6 mb-8">
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
                    {renderStars(review.rating)}
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
            
            <button 
              type="submit" 
              disabled={submittingReview}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}