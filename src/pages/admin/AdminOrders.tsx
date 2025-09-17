import { useState, useEffect, Fragment } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  Truck,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOrders, useOrderStats, useUpdateOrderStatus, useRealtimeOrders } from '@/hooks/useAdminQueries';
import OrderService from '@/services/OrderService';
import { useNavigate } from 'react-router-dom';
import { exportOrdersToCSV, exportSelectedOrdersToCSV } from '@/utils/orderExport';

interface AdminOrder {
  id: number;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  items: number;
  total: number;
  shippingAddress?: string;
  shippingLandmark?: string;
  shippingPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());

  // Use real-time orders hook
  useRealtimeOrders();

  // Use React Query hooks for real-time data fetching
  const { 
    data: ordersData = { orders: [], total: 0 }, 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useOrders(currentPage, pageSize);
  
  const { 
    data: statistics = {
      totalOrders: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      totalRevenue: 0
    }, 
    isLoading: statsLoading,
    error: statsError 
  } = useOrderStats();

  const updateOrderStatusMutation = useUpdateOrderStatus();
  
  const loading = authLoading || ordersLoading || statsLoading;
  const hasError = ordersError || statsError;

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
      <Badge className={variant.bg}>
        <Icon className="w-3 h-3 mr-1" />
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
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleViewOrder = (orderId: number) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // Selection functionality
  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === transformedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(transformedOrders.map(order => order.id)));
    }
  };

  const handleBulkExport = async () => {
    try {
      const selectedOrderData = transformedOrders.filter(order => selectedOrders.has(order.id));
      
      if (selectedOrderData.length === 0) {
        return;
      }

      // Get the original order data with full details
      const originalOrders = ordersData.orders.filter(order => 
        selectedOrderData.some(selectedOrder => selectedOrder.id === order.id)
      );

      await exportSelectedOrdersToCSV(
        Array.from(selectedOrders),
        `selected_orders_export_${new Date().toISOString().split('T')[0]}.csv`
      );
      
    } catch (error) {
      console.error('Bulk export error:', error);

    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedOrders(new Set()); // Clear selection when changing pages
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
    setSelectedOrders(new Set()); // Clear selection when changing page size
  };

  // Transform orders to match our interface
  const transformedOrders: AdminOrder[] = ordersData.orders.map(order => {
    // Debug: Log the shipping address data to see if phone is available
    console.log('🔍 Order shipping address:', order.shipping_address);
    console.log('🔍 Order profile phone:', order.profiles?.phone);
    
    const shippingPhone = order.shipping_address?.phone || order.profiles?.phone || '';
    console.log('🔍 Extracted shipping phone:', shippingPhone);
    
    return {
      id: order.id,
      orderNumber: order.order_number,
      customer: {
        name: order.profiles 
          ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() 
          : 'Unknown Customer',
        email: order.profiles?.email || 'No email',
        phone: order.profiles?.phone || order.shipping_address?.phone || '',
      },
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method || 'N/A',
      items: order.order_items?.length || 0,
      total: order.total,
      shippingAddress: order.shipping_address 
        ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}, ${order.shipping_address.address_line_1}${order.shipping_address.address_line_2 ? `, ${order.shipping_address.address_line_2}` : ''}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postal_code}`
        : 'No address',
      shippingLandmark: order.shipping_address?.landmark,
      shippingPhone: shippingPhone, // Use the extracted phone from either shipping address or profile
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  });

  // Filter orders based on search and filters
  const filteredOrders = transformedOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Show error message if there are errors
  useEffect(() => {
    if (hasError && !loading) {
      console.error('Orders/Stats errors:', { ordersError, statsError });

    }
  }, [hasError, loading, ordersError, statsError]);

  // Use real statistics from database
  const { totalOrders, pendingOrders, shippedOrders, deliveredOrders, totalRevenue } = statistics;

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      await updateOrderStatusMutation.mutateAsync({ orderId, newStatus });
      
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);

    }
  };

  const handleExportOrders = async () => {
    try {
      const filteredOrders = transformedOrders.filter(order => {
        const matchesSearch = !searchQuery || 
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
        
        return matchesSearch && matchesStatus && matchesPayment;
      });

      if (filteredOrders.length === 0) {
        return;
      }

      // Get the original order data with full details
      const originalOrders = ordersData.orders.filter(order => 
        filteredOrders.some(filteredOrder => filteredOrder.id === order.id)
      );

      await exportOrdersToCSV(
        originalOrders,
        `orders_export_${new Date().toISOString().split('T')[0]}.csv`
      );
      
    } catch (error) {
      console.error('Export error:', error);

    }
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading orders...'}
          </p>
        </div>
      </div>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground">
            {!isAuthenticated 
              ? 'Please log in to access the admin orders.' 
              : 'Admin access required to view orders.'}
          </p>
          <Button onClick={() => window.location.href = '/admin/login'}>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Order Management</h2>
          <p className="text-sm text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBulkExport}
            disabled={selectedOrders.size === 0}
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export ({selectedOrders.size})
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportOrders} className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export All
          </Button>
          <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => refetchOrders()} disabled={loading} className="text-xs">
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-lg sm:text-2xl font-bold">{totalOrders}</p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{statistics.pendingOrders}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{statistics.pendingOrders}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Shipped</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{statistics.shippedOrders}</p>
              </div>
              <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{statistics.deliveredOrders}</p>
              </div>
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="w-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-8 text-xs">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" className="text-xs h-8">
                <Filter className="w-3 h-3 mr-1" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {ordersData.total} orders (Page {currentPage} of {Math.ceil(ordersData.total / pageSize)})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 w-full">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedOrders.size === transformedOrders.length && transformedOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all orders"
                    />
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={() => handleSelectOrder(order.id)}
                        aria-label={`Select order ${order.orderNumber}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                      {order.customer.phone && (
                        <p className="text-xs text-muted-foreground">Ph: {order.customer.phone}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{order.shippingAddress}</p>
                      {order.shippingLandmark && (
                        <p className="text-xs text-muted-foreground">LM: {order.shippingLandmark}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                  <TableCell>
                    <span className="font-medium">{order.items} items</span>
                  </TableCell>
                  <TableCell className="font-semibold">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatDate(order.createdAt)}</p>
                      {order.updatedAt !== order.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Updated: {formatDate(order.updatedAt)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id.toString(), 'confirmed')}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id.toString(), 'shipped')}>
                          <Truck className="w-4 h-4 mr-2" />
                          Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id.toString(), 'delivered')}>
                          <Package className="w-4 h-4 mr-2" />
                          Mark as Delivered
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleStatusUpdate(order.id.toString(), 'cancelled')}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 p-3 w-full">
            {/* Mobile Header with Select All and Export Button */}
            <div className="flex items-center justify-between mb-3 w-full">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOrders.size === transformedOrders.length && transformedOrders.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all orders"
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBulkExport}
                disabled={selectedOrders.size === 0}
                className="text-xs h-8"
              >
                <Download className="w-3 h-3 mr-1" />
                Export ({selectedOrders.size})
              </Button>
            </div>
            
            {filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border rounded-lg p-3 space-y-2 w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => handleSelectOrder(order.id)}
                      aria-label={`Select order ${order.orderNumber}`}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-sm">{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium truncate max-w-[120px]">{order.customer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{order.items}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-xs">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/admin/orders/${order.id}`}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.location.href = `/admin/orders/${order.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = `/admin/orders/${order.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {ordersData.total > pageSize && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 p-3 border-t w-full">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, ordersData.total)} of {ordersData.total} orders
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-xs h-7 px-2"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(ordersData.total / pageSize) }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === Math.ceil(ordersData.total / pageSize) ||
                        Math.abs(page - currentPage) <= 1
                      )
                      .map((page, index, array) => (
                        <Fragment key={page}>
                          {index > 0 && page - array[index - 1] > 1 && (
                            <span className="px-1 text-muted-foreground text-xs">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-7 h-7 p-0 text-xs"
                          >
                            {page}
                          </Button>
                        </Fragment>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(ordersData.total / pageSize)}
                    className="text-xs h-7 px-2"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}