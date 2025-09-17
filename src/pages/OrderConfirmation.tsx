import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Truck, MapPin, Calendar, ArrowLeft, Home, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import OrderService from '@/services/OrderService';
import { useAuth } from '@/contexts/AuthContext';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { toast } = useToast();
  const { refreshAuth, isAuthenticated, user } = useAuth();
  const [orderData, setOrderData] = useState<any>(null); // State for actual order data
  const [loading, setLoading] = useState(true);
  const [estimatedDelivery] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  // Fetch actual order data and ensure auth state is stable
  useEffect(() => {
    const fetchOrderData = async () => {
      if (orderId) {
        try {
          console.log('📦 Fetching order data for confirmation page...');
          console.log('🔑 Current auth state - isAuthenticated:', isAuthenticated, 'user:', user?.email);
          
          // Ensure authentication state is refreshed and stable
          if (isAuthenticated) {
            console.log('🔑 Refreshing authentication state for stability...');
            await refreshAuth();
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait for auth to settle
          }
          
          // Try to fetch the actual order
          const order = await OrderService.getOrderById(orderId);
          console.log('📦 Order data fetched:', order);
          console.log('📦 Order items from service:', order?.items);
          console.log('📦 Order order_items from service:', order?.order_items);
          
          if (order) {
            // Extract shipping address information
            const shippingAddress = order.shipping_address || {} as any;
            const fullName = `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim() || 'Customer';
            
            // Check if this is a guest order
            const isGuestOrder = OrderService.isGuestUser(order.user_id);
            
            const orderItems = order.items || order.order_items || [];
            console.log('📦 Final order items to display:', orderItems);
            console.log('📦 Order items length:', orderItems.length);
            
            setOrderData({
              id: order.id,
              orderNumber: order.order_number,
              status: order.status,
              items: orderItems,
              total: order.total,
              subtotal: order.subtotal,
              shippingAddress: {
                name: fullName,
                address: shippingAddress.address_line_1 || 'Address not available',
                city: shippingAddress.city || 'City',
                state: shippingAddress.state || 'State',
                pincode: shippingAddress.postal_code || '000000',
                landmark: shippingAddress.landmark || ''
              },
              paymentMethod: order.payment_method || 'Cash on Delivery',
              orderDate: new Date(order.created_at).toLocaleDateString('en-IN'),
              trackingNumber: order.tracking_number || order.order_number,
              isGuest: isGuestOrder
            });
          } else {
            // Fallback to mock data
            setOrderData({
              id: orderId,
              orderNumber: orderId,
              status: 'confirmed',
              items: [],
              total: 0,
              subtotal: 0,
              shippingAddress: {
                name: 'Customer',
                address: 'Address not available',
                city: 'City',
                state: 'State',
                pincode: '000000',
                landmark: ''
              },
              paymentMethod: 'Cash on Delivery',
              orderDate: new Date().toLocaleDateString('en-IN'),
              trackingNumber: orderId,
              isGuest: true
            });
          }
        } catch (error) {
          console.error('Error fetching order:', error);
          // Fallback to mock data
          setOrderData({
            id: orderId,
            orderNumber: orderId,
            status: 'confirmed',
            items: [],
            total: 0,
            subtotal: 0,
            shippingAddress: {
              name: 'Customer',
              address: 'Address not available',
              city: 'City',
              state: 'State',
              pincode: '000000',
              landmark: ''
            },
            paymentMethod: 'Cash on Delivery',
            orderDate: new Date().toLocaleDateString('en-IN'),
            trackingNumber: orderId,
            isGuest: true
          });
        }
      } else {
        // Fallback to mock data
        setOrderData({
          id: 'EJ' + Date.now().toString().slice(-8),
          orderNumber: 'EJ' + Date.now().toString().slice(-8),
          status: 'confirmed',
          items: [],
          total: 0,
          subtotal: 0,
          shippingAddress: {
            name: 'Customer',
            address: 'Address not available',
            city: 'City',
            state: 'State',
            pincode: '000000',
            landmark: ''
          },
          paymentMethod: 'Cash on Delivery',
          orderDate: new Date().toLocaleDateString('en-IN'),
          trackingNumber: 'EJ' + Date.now().toString().slice(-8),
          isGuest: true
        });
      }
      setLoading(false);
    };

    fetchOrderData();
  }, [orderId]);

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number' || isNaN(price)) {
      return '₹0';
    }
    return `₹${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const trackingSteps = [
    { status: 'Order Confirmed', completed: true, icon: CheckCircle },
    { status: 'Processing', completed: false, icon: Package },
    { status: 'Shipped', completed: false, icon: Truck },
    { status: 'Delivered', completed: false, icon: MapPin }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/50"
      >
        <div className="py-1 pb-0">
          <div className="flex items-center justify-between">
            <div className="ml-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-luxury">Order Confirmation</h1>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="px-4 py-6">
        {/* Success Message */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed Successfully!</h2>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order ID</span>
                <span className="font-medium">{orderData?.orderNumber || orderData?.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Order Date</span>
                <span className="font-medium">{orderData?.orderDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(orderData?.status)}>
                  {orderData?.status?.charAt(0).toUpperCase() + orderData?.status?.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tracking Number</span>
                <span className="font-medium">{orderData?.trackingNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expected Delivery</span>
                <div className="text-right">
                  <div className="font-medium">{estimatedDelivery}</div>
                  <div className="text-xs text-green-600">Free Shipping</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {orderData?.items && orderData.items.length > 0 ? (
                <div className="space-y-4">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 border border-border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        {/* Display all variant information prominently */}
                        {Object.keys(item).filter(key => 
                          key !== 'id' && 
                          key !== 'productName' && 
                          key !== 'unitPrice' && 
                          key !== 'totalPrice' && 
                          key !== 'quantity' &&
                          item[key as keyof typeof item]
                        ).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Object.keys(item).map(key => {
                              // Skip non-variant properties
                              if (key === 'id' || key === 'productName' || key === 'unitPrice' || 
                                  key === 'totalPrice' || key === 'quantity') {
                                return null;
                              }
                              
                              // Only display properties that have values
                              const value = item[key as keyof typeof item];
                              if (!value) return null;
                              
                              // Format the property name (capitalize first letter)
                              const formattedName = key.charAt(0).toUpperCase() + key.slice(1);
                              
                              return (
                                <span 
                                  key={key} 
                                  className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full"
                                >
                                  {formattedName}: {String(value)}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.unitPrice)}</p>
                            <p className="text-sm text-muted-foreground">
                              Total: {formatPrice(item.totalPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{(() => {
                        const paymentMethod = orderData?.paymentMethod;
                        console.log('🔍 Payment method for order:', paymentMethod);
                        const isCashOnDelivery = paymentMethod && (
                          paymentMethod.toLowerCase().includes('cash') ||
                          paymentMethod.toLowerCase().includes('cod') ||
                          paymentMethod.toLowerCase().includes('delivery')
                        );
                        console.log('🔍 Is cash on delivery:', isCashOnDelivery);
                        return isCashOnDelivery ? 'to be Paid' : 'Total Paid';
                      })()}</span>
                      <span className="text-luxury">{formatPrice(orderData?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-luxury mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Order Confirmed!</h3>
                  <p className="text-muted-foreground mb-4">
                    Order details will be sent to your email shortly.
                  </p>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{(() => {
                        const paymentMethod = orderData?.paymentMethod;
                        console.log('🔍 Payment method for order:', paymentMethod);
                        const isCashOnDelivery = paymentMethod && (
                          paymentMethod.toLowerCase().includes('cash') ||
                          paymentMethod.toLowerCase().includes('cod') ||
                          paymentMethod.toLowerCase().includes('delivery')
                        );
                        console.log('🔍 Is cash on delivery:', isCashOnDelivery);
                        return isCashOnDelivery ? 'to be Paid' : 'Total Paid';
                      })()}</span>
                      <span className="text-luxury">{formatPrice(orderData?.total || 0)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-600 text-white' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          step.completed ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.status}
                        </p>
                        {step.completed && (
                          <p className="text-sm text-green-600">Completed</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{orderData?.shippingAddress?.name}</p>
                <p>{orderData?.shippingAddress?.address}</p>
                {orderData?.shippingAddress?.landmark && (
                  <p className="text-muted-foreground">Landmark: {orderData?.shippingAddress?.landmark}</p>
                )}
                <p>{orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state}</p>
                <p>{orderData?.shippingAddress?.pincode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </div>

          {/* Help Section */}
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Need help with your order?
              </p>
              <p className="text-sm">
                Contact us at{' '}
                <a href="mailto:support@ehsaasjewellery.com" className="text-primary underline">
                  support@ehsaasjewellery.com
                </a>
                {' '}or call{' '}
                <a href="tel:+919876543210" className="text-primary underline">
                  +91 98765 43210
                </a>
              </p>
              {orderData?.isGuest && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-muted">
                  A guest account has been created for you. You can access your order details later by signing in with the email we've sent to your phone number.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;