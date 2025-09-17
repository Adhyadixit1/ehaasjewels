import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  Star,
  MoreHorizontal,
  User,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OrderService, { Order } from '@/services/OrderService';
import { ProductService } from '@/services/ProductService';
import OrderCacheService from '@/services/OrderCacheService';

interface OrderItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string; // Product variant size
  color?: string; // Product variant color
  variantId?: number; // Product variant ID
}

interface DisplayOrder {
  id: number;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    label: 'Order Pending'
  },
  confirmed: {
    icon: CheckCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    label: 'Confirmed'
  },
  shipped: {
    icon: Truck,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    label: 'Shipped'
  },
  delivered: {
    icon: Package,
    color: 'text-green-500',
    bg: 'bg-green-50',
    label: 'Delivered'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    label: 'Cancelled'
  }
};

export default function Orders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('Orders');
  const [selectedFilter, setSelectedFilter] = useState<'all' | DisplayOrder['status']>('all');
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [variantImages, setVariantImages] = useState<Record<number, string>>({});
  const [productData, setProductData] = useState<Record<number, any>>({});

  // Location effect
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('Home');
    } else if (location.pathname === '/explore') {
      setActiveTab('Explore');
    } else if (location.pathname === '/orders') {
      setActiveTab('Orders');
    }
  }, [location.pathname]);

  // Auth effect
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadUserOrders();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  // Orders effect
  useEffect(() => {
    if (orders.length > 0) {
      fetchProductData();
      fetchVariantImages();
    }
  }, [orders]);

  // Smooth scrolling effect
  useEffect(() => {
    // Enable smooth scrolling for the entire document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Cleanup on component unmount
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const loadUserOrders = async () => {
    try {
      // Check if we have cached data and use it immediately
      const cachedOrders = OrderCacheService.getCachedOrders();
      if (cachedOrders && cachedOrders.length > 0) {
        console.log('📦 Using cached orders data (fast load)');
        setOrders(cachedOrders);
        setLoading(false);
        
        // Background refresh: Update cache in background without blocking UI
        setTimeout(async () => {
          try {
            console.log('🔄 Background refreshing orders data...');
            await refreshOrdersData();
          } catch (error) {
            console.warn('Background refresh failed, using cached data:', error);
          }
        }, 1000); // 1 second delay to ensure smooth UI
      } else {
        // No cache available, load from API
        setLoading(true);
        await refreshOrdersData();
      }
    } catch (error) {
      console.error('❌ Error in loadUserOrders:', error);
      toast({
        title: 'Error Loading Orders',
        description: error instanceof Error ? error.message : 'Failed to load orders',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // Separate function for refreshing orders data from API
  const refreshOrdersData = async () => {
    try {
      console.log('🛒 Loading user orders from API...');
      
      const userOrders = await OrderService.getUserOrders();
      
      // Transform orders to display format
      const displayOrders: DisplayOrder[] = userOrders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at,
        status: order.status as DisplayOrder['status'],
        total: order.total,
        items: order.items?.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          size: item.size, // Include variant size if available
          color: item.color, // Include variant color if available
          // variantId is not in the OrderItem interface, using productId instead
        })) || [],
        trackingNumber: order.tracking_number || undefined
      }));
      
      // Cache the orders data
      OrderCacheService.cacheOrders(displayOrders);
      
      setOrders(displayOrders);
      console.log(`✅ Loaded and cached ${displayOrders.length} orders`);
    } catch (error) {
      console.error('❌ Error loading orders from API:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch product data for all ordered products
  const fetchProductData = async () => {
    try {
      const allProductIds = orders.flatMap(order => 
        order.items.map(item => item.productId)
      );
      
      if (allProductIds.length === 0) return;
      
      // Create a set to avoid duplicate requests
      const uniqueProductIds = [...new Set(allProductIds)];
      
      // Fetch product details for each product ID
      const productDataMap: Record<number, any> = {};
      
      for (const productId of uniqueProductIds) {
        try {
          const product = await ProductService.getProductById(productId.toString());
          productDataMap[productId] = product;
        } catch (error) {
          console.warn(`Failed to fetch product ${productId}:`, error);
        }
      }
      
      setProductData(productDataMap);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  // Fetch variant images for all ordered variants
  const fetchVariantImages = async () => {
    try {
      // Since we don't have a getProductVariantById method, we'll skip this for now
      // This would need to be implemented in the ProductService if needed
      console.log('Skipping variant image fetching - method not available');
    } catch (error) {
      console.error('Error fetching variant images:', error);
    }
  };

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const handleOrderClick = (order: DisplayOrder) => {
    // Navigate to order detail page (to be implemented)
    console.log('Order clicked:', order);
  };

  const handleReorder = (order: DisplayOrder) => {
    console.log('Reorder:', order);
    // Add reorder logic here
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Dummy functions for ProductCard props
  const handleOpenFullscreen = (product: any) => {
    console.log('Open fullscreen for product:', product);
  };

  const handleToggleWishlist = async (id: bigint) => {
    console.log('Toggle wishlist for product:', id);
    return false;
  };

  const handleShare = (product: any) => {
    console.log('Share product:', product);
  };

  // Smooth scroll to top when filter changes
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle filter change with smooth scrolling
  const handleFilterChange = (filter: 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered') => {
    setSelectedFilter(filter);
    scrollToTop();
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading orders...'}
          </p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-4">
            <User className="w-16 h-16 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Login Required</h2>
            <p className="text-muted-foreground">
              Please log in to view your orders and purchase history.
            </p>
          </div>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/profile')} 
              className="w-full"
            >
              <User className="w-4 h-4 mr-2" />
              Login / Sign Up
            </Button>
            <Button 
              onClick={() => navigate('/explore')} 
              variant="outline"
              className="w-full"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">My Orders</h1>
            <div className="w-16"></div> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto p-4 gap-2">
          {(['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const).map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(filter)}
              className="whitespace-nowrap"
            >
              {filter === 'all' ? 'All Orders' : statusConfig[filter].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => {
            const StatusIcon = statusConfig[order.status].icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-card rounded-xl border border-border p-4 shadow-sm"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">#{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig[order.status].bg}`}>
                      <StatusIcon className={`w-3 h-3 ${statusConfig[order.status].color}`} />
                      <span className={`text-xs font-medium ${statusConfig[order.status].color}`}>
                        {statusConfig[order.status].label}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, itemIndex) => (
                    <div key={`${item.productId}-${itemIndex}`} className="flex gap-3 items-center">
                      <div className="w-20 h-24 flex-shrink-0">
                        {productData[item.productId] ? (
                          <div className="w-full h-full rounded-lg overflow-hidden">
                            <img 
                              src={productData[item.productId].image || productData[item.productId].images?.[0]?.url || '/placeholder.svg'} 
                              alt={productData[item.productId].name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">
                          <a 
                            href={`/product/${item.productId}`} 
                            className="text-primary hover:underline"
                          >
                            {item.productName}
                          </a>
                        </h4>
                        {/* Display all variant information prominently */}
                        {Object.keys(item).filter(key => 
                          key !== 'productId' && 
                          key !== 'productName' && 
                          key !== 'productSku' && 
                          key !== 'quantity' && 
                          key !== 'unitPrice' && 
                          key !== 'totalPrice' &&
                          key !== 'variantId' &&
                          item[key as keyof OrderItem]
                        ).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.keys(item).map(key => {
                              // Skip non-variant properties
                              if (key === 'productId' || key === 'productName' || key === 'productSku' || 
                                  key === 'quantity' || key === 'unitPrice' || key === 'totalPrice' ||
                                  key === 'variantId') {
                                return null;
                              }
                              
                              // Only display properties that have values
                              const value = item[key as keyof OrderItem];
                              if (!value) return null;
                              
                              // Format the property name (capitalize first letter)
                              const formattedName = key.charAt(0).toUpperCase() + key.slice(1);
                              
                              return (
                                <span 
                                  key={key} 
                                  className="text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
                                >
                                  {formattedName}: {String(value)}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">SKU: {item.productSku}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary">
                          ₹{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        <Star className="w-4 h-4 mr-1" />
                        Rate
                      </Button>
                    )}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReorder(order)}
                      >
                        Reorder
                      </Button>
                    )}
                    {(order.status === 'shipped' || order.status === 'confirmed') && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleOrderClick(order)}
                      >
                        Track Order
                      </Button>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                {order.estimatedDelivery && order.status !== 'delivered' && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                    <p className="text-sm font-medium">{formatDate(order.estimatedDelivery)}</p>
                    {order.trackingNumber && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-6">
              {selectedFilter === 'all' 
                ? "You haven't placed any orders yet." 
                : `No ${selectedFilter} orders found.`
              }
            </p>
            <Button onClick={() => navigate('/explore')}>
              Start Shopping
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Bottom spacing */}
      <div className="h-20"></div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}