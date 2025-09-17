import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Download,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import OrderService, { Order } from '@/services/OrderService';

interface OrderItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string;
  color?: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface UserAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
  phone?: string;
}

interface AdminOrder extends Order {
  profiles?: UserProfile;
  shipping_address?: UserAddress;
  order_items?: OrderItem[];
}

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    }
  }, [orderId]);

  const loadOrderDetails = async (id: string) => {
    try {
      setLoading(true);
      console.log('🔍 Loading order details for:', id);
      
      // Fetch order with all related data
      const orderData = await OrderService.getOrderById(id);
      
      if (orderData) {
        console.log('📦 Order data received:', orderData);
        setOrder(orderData);
        console.log('✅ Order details loaded:', orderData);
      } else {
        toast({
          title: 'Order Not Found',
          description: 'The requested order could not be found.',
          variant: 'destructive',
        });
        navigate('/admin/orders');
      }
      
    } catch (error) {
      console.error('❌ Error loading order details:', error);
      toast({
        title: 'Error Loading Order',
        description: error instanceof Error ? error.message : 'Failed to load order details',
        variant: 'destructive',
      });
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      if (!orderId) return;
      
      setUpdatingStatus(true);
      console.log(`🔄 Updating order ${orderId} status to: ${newStatus}`);
      
      await OrderService.updateOrderStatus(orderId, newStatus);
      
      // Refresh order details
      await loadOrderDetails(orderId);
      
      toast({
        title: 'Status Updated',
        description: `Order status updated to ${newStatus}`,
      });
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { bg: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      shipped: { bg: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { bg: 'bg-green-100 text-green-800', icon: Package },
      cancelled: { bg: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const variant = variants[status as keyof typeof variants] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.bg} text-sm py-1 px-3`}>
        <Icon className="w-4 h-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={`${variants[status as keyof typeof variants] || variants.pending} text-sm py-1 px-3`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExportOrder = () => {
    if (!order) return;
    
    // Create order data for export
    const orderData = {
      'Order Number': order.order_number,
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Payment Method': order.payment_method,
      'Subtotal': order.subtotal,
      'Tax': order.tax_amount,
      'Shipping': order.shipping_amount,
      'Discount': order.discount_amount,
      'Total': order.total,
      'Currency': order.currency,
      'Tracking Number': order.tracking_number || '',
      'Created At': order.created_at,
      'Updated At': order.updated_at,
      'Customer Name': `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim(),
      'Customer Email': order.profiles?.email || '',
      'Customer Phone': order.profiles?.phone || '',
      'Shipping Name': `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim(),
      'Shipping Address': `${order.shipping_address?.address_line_1 || ''} ${order.shipping_address?.address_line_2 || ''}`.trim(),
      'Shipping Landmark': order.shipping_address?.landmark || '',
      'Shipping City': order.shipping_address?.city || '',
      'Shipping State': order.shipping_address?.state || '',
      'Shipping Postal Code': order.shipping_address?.postal_code || '',
      'Shipping Phone': order.shipping_address?.phone || ''
    };
    
    // Convert to CSV
    const headers = Object.keys(orderData);
    const values = Object.values(orderData).map(value => `"${value}"`);
    
    const csvContent = [
      headers.join(','),
      values.join(',')
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `order-${order.order_number}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Show error if no order
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Order Not Found</h2>
          <p className="text-muted-foreground">The requested order could not be found.</p>
          <Button onClick={() => navigate('/admin/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
            <p className="text-muted-foreground">Order #{order?.order_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportOrder}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Order #{order.order_number}</CardTitle>
              <CardDescription>
                Placed on {formatDate(order.created_at)}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(order.status)}
              {getPaymentStatusBadge(order.payment_status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Order Value</h3>
              <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Payment Method</h3>
              <p className="text-muted-foreground">
                {order.payment_method ? order.payment_method.toUpperCase() : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Tracking</h3>
              <p className="text-muted-foreground">
                {order.tracking_number || 'Not available'}
              </p>
            </div>
          </div>

          {/* Status Update Actions */}
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3">Update Order Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusUpdate('confirmed')}
                disabled={updatingStatus || order.status === 'confirmed' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled'}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Order
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusUpdate('shipped')}
                disabled={updatingStatus || order.status === 'pending' || order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled'}
              >
                <Truck className="w-4 h-4 mr-2" />
                Mark as Shipped
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusUpdate('delivered')}
                disabled={updatingStatus || order.status === 'pending' || order.status === 'confirmed' || order.status === 'delivered' || order.status === 'cancelled'}
              >
                <Package className="w-4 h-4 mr-2" />
                Mark as Delivered
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={updatingStatus || order.status === 'delivered' || order.status === 'cancelled'}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
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
          <div className="space-y-4">
            {order.order_items && order.order_items.length > 0 ? (
              order.order_items.map((item, index) => (
                <motion.div
                  key={`${item.productId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg"
                >
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {item.productSku || 'N/A'}</p>
                    {/* Display all variant information prominently */}
                    {Object.keys(item).filter(key => 
                      key !== 'productId' && 
                      key !== 'productName' && 
                      key !== 'productSku' && 
                      key !== 'quantity' && 
                      key !== 'unitPrice' && 
                      key !== 'totalPrice' &&
                      item[key as keyof typeof item]
                    ).length > 0 && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {Object.keys(item).map(key => {
                          // Skip non-variant properties
                          if (key === 'productId' || key === 'productName' || key === 'productSku' || 
                              key === 'quantity' || key === 'unitPrice' || key === 'totalPrice') {
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
                              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
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
                </motion.div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No items found for this order</p>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
            )}
            {order.shipping_amount > 0 ? (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_amount)}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            )}
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {order.profiles?.first_name} {order.profiles?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.profiles?.email}</p>
            </div>
            {order.profiles?.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.profiles.phone}</p>
              </div>
            )}
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
          <CardContent className="space-y-3">
            {order.shipping_address ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Recipient</p>
                  <p className="font-medium">
                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {order.shipping_address.address_line_1}
                    {order.shipping_address.address_line_2 && (
                      <>, {order.shipping_address.address_line_2}</>
                    )}
                  </p>
                  {order.shipping_address.landmark && (
                    <p className="text-sm text-muted-foreground">Landmark: {order.shipping_address.landmark}</p>
                  )}
                  <p className="font-medium">
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </p>
                </div>
                {order.shipping_address.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{order.shipping_address.phone}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No shipping address available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}