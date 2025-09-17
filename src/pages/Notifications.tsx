import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell,
  Package,
  Heart,
  Tag,
  Star,
  Gift,
  Truck,
  Clock,
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';

// Import images
import heroJewelry from '@/assets/hero-jewelry.jpg';
import jewelry1 from '@/assets/jewelry-1.jpg';
import jewelry2 from '@/assets/jewelry-2.jpg';
import jewelry3 from '@/assets/jewelry-3.jpg';

interface Notification {
  id: string;
  type: 'order' | 'wishlist' | 'promotion' | 'review' | 'general';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  image?: string;
  actionUrl?: string;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Order Delivered!',
    message: 'Your order #LUX-2024-001 has been delivered successfully.',
    time: '2 hours ago',
    isRead: false,
    image: heroJewelry,
    actionUrl: '/orders'
  },
  {
    id: 'n2',
    type: 'promotion',
    title: 'Flash Sale Alert! 🔥',
    message: 'Up to 50% off on selected jewelry. Sale ends in 6 hours!',
    time: '4 hours ago',
    isRead: false,
    image: jewelry1,
    actionUrl: '/explore'
  },
  {
    id: 'n3',
    type: 'wishlist',
    title: 'Price Drop Alert',
    message: 'Diamond Elegance Necklace in your wishlist is now 20% off!',
    time: '1 day ago',
    isRead: false,
    image: jewelry2,
    actionUrl: '/wishlist'
  },
  {
    id: 'n4',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #LUX-2024-002 is on its way. Track your package.',
    time: '2 days ago',
    isRead: true,
    image: jewelry3,
    actionUrl: '/orders'
  },
  {
    id: 'n5',
    type: 'review',
    title: 'Rate Your Purchase',
    message: 'How was your experience with Heritage Gold Hoops?',
    time: '3 days ago',
    isRead: true,
    image: heroJewelry
  },
  {
    id: 'n6',
    type: 'general',
    title: 'New Collection Launch',
    message: 'Explore our latest Bridal Collection with exclusive designs.',
    time: '5 days ago',
    isRead: true,
    image: jewelry1,
    actionUrl: '/explore'
  },
  {
    id: 'n7',
    type: 'promotion',
    title: 'Welcome Bonus!',
    message: 'Get ₹500 off on your next purchase. Use code WELCOME500',
    time: '1 week ago',
    isRead: true
  }
];

const notificationIcons = {
  order: Package,
  wishlist: Heart,
  promotion: Tag,
  review: Star,
  general: Bell
};

const notificationColors = {
  order: 'text-blue-500 bg-blue-50',
  wishlist: 'text-pink-500 bg-pink-50',
  promotion: 'text-green-500 bg-green-50',
  review: 'text-yellow-500 bg-yellow-50',
  general: 'text-gray-500 bg-gray-50'
};

export default function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Notifications');
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | Notification['type']>('all');

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('Home');
    } else if (location.pathname === '/explore') {
      setActiveTab('Explore');
    } else if (location.pathname === '/notifications') {
      setActiveTab('Notifications');
    }
  }, [location.pathname]);

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead;
    return notification.type === selectedFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getTimeAgo = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto gap-2">
            {(['all', 'unread', 'order', 'wishlist', 'promotion', 'review', 'general'] as const).map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className="whitespace-nowrap"
              >
                {filter === 'all' ? 'All' :
                 filter === 'unread' ? 'Unread' :
                 filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification, index) => {
            const NotificationIcon = notificationIcons[notification.type];
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`relative rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                  notification.isRead 
                    ? 'bg-card border-border' 
                    : 'bg-primary/5 border-primary/20'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notificationColors[notification.type]}`}>
                      <NotificationIcon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm ${notification.isRead ? 'text-foreground' : 'text-foreground'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.time)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                        {notification.message}
                      </p>

                      {/* Notification Image */}
                      {notification.image && (
                        <div className="mt-3">
                          <img
                            src={notification.image}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button for actionable notifications */}
                {notification.actionUrl && (
                  <div className="px-4 pb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                    >
                      {notification.type === 'order' ? 'View Order' :
                       notification.type === 'wishlist' ? 'View Wishlist' :
                       notification.type === 'promotion' ? 'Shop Now' :
                       'View Details'}
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-muted-foreground">
              {selectedFilter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : selectedFilter === 'all'
                ? "You don't have any notifications yet."
                : `No ${selectedFilter} notifications found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}