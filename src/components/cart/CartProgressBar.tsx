import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { Truck } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: {
    type: 'products' | 'order';
    value: number;
  };
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    maxAmount?: number;
  };
  achieved: boolean;
  color: string;
}

const CartProgressBar = () => {
  const { cartItems, getTotalPrice, getTotalItems, getDiscountAmount } = useCart();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    // Define hardcoded milestones
    const hardcodedMilestones: Milestone[] = [
      {
        id: 'milestone-1',
        title: 'Halfway There',
        description: '20% off upto ₹200',
        icon: <Truck className="w-4 h-4" />,
        requirement: {
          type: 'products',
          value: 2
        },
        discount: {
          type: 'percentage',
          value: 20,
          maxAmount: 200
        },
        achieved: false,
        color: 'from-pink-400 to-pink-600'
      },
      {
        id: 'milestone-2',
        title: 'Full Cart Bonus',
        description: 'Flat ₹300 off',
        icon: <Truck className="w-4 h-4" />,
        requirement: {
          type: 'products',
          value: 3
        },
        discount: {
          type: 'fixed',
          value: 300
        },
        achieved: false,
        color: 'from-pink-500 to-pink-700'
      }
    ];

    // Check milestone achievements
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    const updatedMilestones = hardcodedMilestones.map(milestone => {
      let achieved = false;
      
      if (milestone.requirement.type === 'products') {
        achieved = totalItems >= milestone.requirement.value;
      } else if (milestone.requirement.type === 'order') {
        achieved = totalPrice > 0; // Any non-empty order
      }

      return { ...milestone, achieved };
    });

    setMilestones(updatedMilestones);

    // Calculate applied discount (auto-apply the best available discount)
    const applicableDiscounts = updatedMilestones
      .filter(m => m.achieved)
      .map(m => {
        if (m.discount.type === 'percentage') {
          const discountAmount = Math.min(
            (totalPrice * m.discount.value) / 100,
            m.discount.maxAmount || Infinity
          );
          return discountAmount;
        } else {
          return m.discount.value;
        }
      });

    const bestDiscount = Math.max(...applicableDiscounts, 0);
  }, [cartItems, getTotalPrice, getTotalItems]);

  const calculateProgress = () => {
    const totalItems = getTotalItems();
    
    // Progress structure:
    // 0-1 products: 0% (empty)
    // 2 products: 50% (midway)
    // 3+ products: 100% (end)
    if (totalItems <= 1) {
      return 0;
    } else if (totalItems === 2) {
      return 50;
    } else {
      return 100;
    }
  };

  const progress = calculateProgress();
  const achievedMilestones = milestones.filter(m => m.achieved).length;
  const totalMilestones = milestones.length;

  return (
    <div className="w-full mb-4">
      {/* Progress Bar with Milestone Bubbles */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <motion.div
            className="h-full bg-pink-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Moving Cargo Van */}
        <motion.div
          className="absolute top-0 -translate-y-full -translate-x-1/2"
          style={{ left: `${progress}%` }}
          animate={{ 
            left: `${progress}%`,
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{ 
            left: { duration: 0.5, ease: "easeOut" },
            rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
          }}
        >
          <Truck className="w-6 h-6 text-pink-700" />
        </motion.div>
        
        {/* Milestone Checkpoints */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between">
          {/* Checkpoint 1 at 50% (2 products) */}
          <div className="absolute" style={{ left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className={`w-4 h-4 rounded-full border-2 border-white ${
              getTotalItems() >= 2 ? 'bg-pink-600' : 'bg-gray-300'
            }`} />
          </div>
          
          {/* Checkpoint 2 at 100% (3 products) */}
          <div className="absolute" style={{ left: '100%', transform: 'translate(-50%, -50%)' }}>
            <div className={`w-4 h-4 rounded-full border-2 border-white ${
              getTotalItems() >= 3 ? 'bg-pink-600' : 'bg-gray-300'
            }`} />
          </div>
        </div>
      </div>
      
      {/* Progress Messages */}
      <div className="mt-2 text-xs text-black text-center">
        {getTotalItems() <= 1 && (
          <span>Add one more product to get 20% off upto ₹200</span>
        )}
        {getTotalItems() === 2 && (
          <span>Add one more product to get ₹300 off</span>
        )}
        {getTotalItems() >= 3 && (
          <span className="text-pink-600 font-medium">🎉 All discounts unlocked!</span>
        )}
      </div>
      
      {/* Applied Discount */}
      {getDiscountAmount() > 0 && (
        <div className="mt-1 text-xs text-pink-600 font-medium text-center">
          Discount applied: -₹{getDiscountAmount().toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CartProgressBar;
