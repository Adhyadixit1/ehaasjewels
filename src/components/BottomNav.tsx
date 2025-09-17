import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, Bell, User, Play, ShoppingCart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'Home', icon: Home, label: 'Home', route: '/' },
  { id: 'Explore', icon: Search, label: 'Explore', route: '/explore' },
  { id: 'Reels', icon: Play, label: 'Reels', route: '/reels' },
  { id: 'Cart', icon: ShoppingCart, label: 'Cart', route: '/cart' },
  { id: 'Orders', icon: ShoppingBag, label: 'Orders', route: '/orders' },
  { id: 'Profile', icon: User, label: 'Profile', route: '/profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalItems } = useCart();

  const handleTabClick = (tab: typeof tabs[0]) => {
    // Navigate to all pages now that they're implemented
    navigate(tab.route);
    onTabChange(tab.id);
  };
  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40"
    >
      <div className="backdrop-blur-md bg-card/80 border border-border/50 rounded-2xl p-2 shadow-luxury">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className="relative flex-1 flex flex-col items-center py-2 px-1 transition-all duration-200"
              >
                <div className={`p-2 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                  <Icon className="w-5 h-5" />
                  {tab.id === 'Cart' && getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 transition-colors duration-200 ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}