import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/ContactModal';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

interface Story {
  id: string;
  title: string;
  image: string;
  productId: string;
}

interface StoryViewerProps {
  stories: Story[];
  currentStoryIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StoryViewer({
  stories,
  currentStoryIndex,
  onClose,
  onNext,
  onPrev
}: StoryViewerProps) {
  const startX = useRef<number | null>(null);
  const currentStory = stories[currentStoryIndex];
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const { addToCart, getItemQuantity, getTotalItems } = useCart();
  const navigate = useNavigate();
  const cartQuantity = getItemQuantity(currentStory.productId);
  const totalCartItems = getTotalItems();

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart({
      id: currentStory.productId,
      name: currentStory.title,
      price: 2499, // You can make this dynamic based on story data
      image: currentStory.image
    });
    
    // Show floating cart notification
    setShowFloatingCart(true);
    setTimeout(() => setShowFloatingCart(false), 3000);
  };

  // Handle buy now
  const handleBuyNow = () => {
    addToCart({
      id: currentStory.productId,
      name: currentStory.title,
      price: 2499,
      image: currentStory.image
    });
    navigate('/checkout');
  };

  // Handle product name click
  const handleProductClick = () => {
    navigate(`/product/${currentStory.productId}`);
  };

  // Handle close attempt - show contact modal first
  const handleCloseAttempt = () => {
    setShowContactModal(true);
  };

  // Actual close after contact modal
  const handleFinalClose = () => {
    setShowContactModal(false);
    onClose();
  };

  // Prevent background scrolling when story viewer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX.current;
    
    if (deltaX < -60) onNext();
    if (deltaX > 60) onPrev();
    
    startX.current = null;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleCloseAttempt();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'ArrowLeft') onPrev();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Story Container - Full screen with scroll isolation */}
      <div className="relative h-full w-full overflow-hidden">
        
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <Button variant="glass" size="sm" onClick={handleCloseAttempt}>
            <X className="w-4 h-4" />
            Close
          </Button>
          
          {/* Story Progress Indicators */}
          <div className="flex gap-1 flex-1 mx-4">
            {stories.map((_, index) => (
              <div
                key={index}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  index === currentStoryIndex 
                    ? 'bg-primary' 
                    : index < currentStoryIndex 
                      ? 'bg-primary/60' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          <div className="text-sm text-white/80 font-medium">
            {currentStoryIndex + 1} / {stories.length}
          </div>
        </div>

        {/* Floating Cart Icon */}
        {totalCartItems > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/cart')}
            className="fixed bottom-20 right-6 z-30 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            </div>
          </motion.button>
        )}

        {/* Navigation Arrows */}
        {currentStoryIndex > 0 && (
          <button 
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm text-white hover:bg-background/40 transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {currentStoryIndex < stories.length - 1 && (
          <button 
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm text-white hover:bg-background/40 transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Story Content - Single Page, No Scroll */}
        <div className="h-full w-full overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {/* Story Image - Smaller, not full height */}
              <div className="relative h-[55vh] w-full flex-shrink-0">
                <img
                  src={currentStory.image}
                  alt={currentStory.title}
                  className="w-full h-full object-contain bg-black/20"
                  loading="eager"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
              </div>

              {/* Product Details Section */}
              <div className="flex-1 bg-background p-4 pb-8 flex flex-col justify-between">
                {/* Breadcrumb */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-xs text-muted-foreground mb-2"
                >
                  Home {'>'} Collections {'>'} {currentStory.title}
                </motion.div>

                {/* Product Name */}
                <button 
                  onClick={handleProductClick}
                  className="text-left w-full"
                >
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl font-bold text-foreground mb-2 underline decoration-primary hover:text-primary transition-colors duration-200"
                  >
                    {currentStory.title}
                  </motion.h2>
                </button>

                {/* Product Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-muted-foreground text-sm mb-4 line-clamp-3"
                >
                  Discover our exquisite {currentStory.title.toLowerCase()} collection featuring handcrafted pieces with premium materials and timeless elegance.
                </motion.p>

                {/* Price and Rating */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center justify-between mb-4"
                >
                  <div className="text-xl font-bold text-black">₹2,499</div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-muted-foreground">4.8 (127)</span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mb-6"
                >
                  <div className="flex gap-2">
                    <button 
                      onClick={handleAddToCart}
                      className="flex-1 bg-pink-200 hover:bg-pink-300 text-gray-800 py-2.5 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {cartQuantity > 0 ? `Cart (${cartQuantity})` : 'Add Cart'}
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      className="flex-1 bg-green-600 text-white py-2.5 px-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                    >
                      Buy Now
                    </button>
                    <button className="p-2.5 border border-border rounded-lg hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Cart Notification */}
      <AnimatePresence>
        {showFloatingCart && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 left-4 right-4 z-30 bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-3"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Added to Cart!</p>
              <p className="text-sm opacity-90">{currentStory.title}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cart')}
              className="text-white hover:bg-white/20"
            >
              View Cart
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        onConfirm={handleFinalClose}
      />
    </motion.div>
  );
}