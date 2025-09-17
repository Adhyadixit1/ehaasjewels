import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShoppingBag, MapPin } from 'lucide-react';

interface RecentPurchase {
  name: string;
  location: string;
  product: string;
  timeAgo: string;
}

const RECENT_PURCHASES: RecentPurchase[] = [
  { name: "Priya Sharma", location: "Mumbai", product: "Gold Necklace", timeAgo: "2 minutes ago" },
  { name: "Ananya Patel", location: "Delhi", product: "Diamond Ring", timeAgo: "5 minutes ago" },
  { name: "Deepa Reddy", location: "Bangalore", product: "Silver Earrings", timeAgo: "8 minutes ago" },
  { name: "Meera Iyer", location: "Chennai", product: "Ruby Pendant", timeAgo: "12 minutes ago" },
  { name: "Sakshi Deshmukh", location: "Pune", product: "Pearl Bracelet", timeAgo: "15 minutes ago" },
  { name: "Kavitha Krishnan", location: "Hyderabad", product: "Gold Bangles", timeAgo: "18 minutes ago" },
  { name: "Riya Banerjee", location: "Kolkata", product: "Platinum Chain", timeAgo: "22 minutes ago" },
  { name: "Pooja Shah", location: "Ahmedabad", product: "Designer Necklace", timeAgo: "25 minutes ago" },
  { name: "Anjali Rathore", location: "Jaipur", product: "Kundan Set", timeAgo: "28 minutes ago" },
  { name: "Simran Kaur", location: "Chandigarh", product: "Gold Kangan", timeAgo: "32 minutes ago" },
];

const RecentPurchasesTicker: React.FC = () => {
  const [currentPurchase, setCurrentPurchase] = useState<RecentPurchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showRandomPurchase = () => {
    const randomIndex = Math.floor(Math.random() * RECENT_PURCHASES.length);
    setCurrentPurchase(RECENT_PURCHASES[randomIndex]);
    setIsVisible(true);
  };

  useEffect(() => {
    // Start showing purchases after 3 seconds
    const initialTimer = setTimeout(() => {
      showRandomPurchase();
    }, 3000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 4000); // Show for 4 seconds

      return () => clearTimeout(hideTimer);
    } else if (currentPurchase) {
      // Schedule next purchase after current one is hidden
      const nextTimer = setTimeout(() => {
        showRandomPurchase();
      }, Math.random() * 10000 + 15000); // 15-25 seconds gap

      return () => clearTimeout(nextTimer);
    }
  }, [isVisible, currentPurchase]);

  return (
    <AnimatePresence>
      {isVisible && currentPurchase && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.5 }}
          className="fixed top-24 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Recent Purchase</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {currentPurchase.name} bought {currentPurchase.product}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{currentPurchase.location}</span>
                <span>•</span>
                <span>{currentPurchase.timeAgo}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecentPurchasesTicker;
