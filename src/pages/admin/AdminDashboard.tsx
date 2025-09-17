import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart, 
  IndianRupee,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  useDashboardStats, 
  useRecentOrders, 
  useTopProducts, 
  useRefreshAll 
} from '@/hooks/useAdminQueries';
import AdminErrorBoundary from '@/components/admin/AdminErrorBoundary';

interface Alert {
  type: 'warning' | 'info' | 'success';
  message: string;
  action: string;
  actionUrl?: string;
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const refreshAll = useRefreshAll();
  const [hasShownError, setHasShownError] = useState(false);

  // React Query hooks for real-time data
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useDashboardStats();
  
  const { 
    data: recentOrders = [], 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useRecentOrders(5);
  
  const { 
    data: topProducts = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useTopProducts(4);

  const isLoading = authLoading || statsLoading || ordersLoading || productsLoading;
  const hasError = statsError || ordersError || productsError;

  // Handle errors with useEffect to prevent infinite re-renders
  useEffect(() => {
    if (hasError && !authLoading && !hasShownError) {
      console.error('Dashboard errors:', { statsError, ordersError, productsError });
      toast({
        title: 'Error Loading Dashboard',
        description: 'Some dashboard data could not be loaded',
        variant: 'destructive',
      });
      setHasShownError(true);
    }
  }, [hasError, authLoading, hasShownError, toast, statsError, ordersError, productsError]);

  // Reset error state when errors are resolved
  useEffect(() => {
    if (!hasError && hasShownError) {
      setHasShownError(false);
    }
  }, [hasError, hasShownError]);

  // Generate alerts based on real data with null checks
  const alerts = [];
  
  if (stats?.lowStockProducts && stats.lowStockProducts > 0) {
    alerts.push({
      type: 'warning' as const,
      message: `${stats.lowStockProducts} products are low in stock`,
      action: 'View Inventory',
      actionUrl: '/admin/products?filter=low_stock'
    });
  }
  
  if (stats?.outOfStockProducts && stats.outOfStockProducts > 0) {
    alerts.push({
      type: 'warning' as const,
      message: `${stats.outOfStockProducts} products are out of stock`,
      action: 'Restock Now',
      actionUrl: '/admin/products?filter=out_of_stock'
    });
  }
  
  if (stats?.pendingOrders && stats.pendingOrders > 0) {
    alerts.push({
      type: 'info' as const,
      message: `${stats.pendingOrders} orders are pending processing`,
      action: 'Process Orders',
      actionUrl: '/admin/orders?filter=pending'
    });
  }
  
  if (stats?.totalRevenue && stats.totalRevenue > 100000) {
    alerts.push({
      type: 'success' as const,
      message: 'Monthly revenue target achieved!',
      action: 'View Report',
      actionUrl: '/admin/analytics'
    });
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatChange = (change: number, isPositive?: boolean) => {
    const positive = isPositive !== undefined ? isPositive : change > 0;
    return (
      <span className={`flex items-center gap-1 text-sm ${
        positive ? 'text-green-600' : 'text-red-600'
      }`}>
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(change)}%
      </span>
    );
  };

  // Show loading while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
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
              ? 'Please log in to access the admin dashboard.' 
              : 'Admin access required to view dashboard.'}
          </p>
          <Button onClick={() => window.location.href = '/admin/login'}>
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminErrorBoundary>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">
            Welcome to एहसास Jewelry Admin Panel
            <span className="text-xs block mt-1">
              Data refreshes automatically every minute
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshAll}
            disabled={isLoading}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="text-xs">Export</Button>
        </div>
      </div>

      {/* Alerts */}
      {recentOrders.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="p-3 sm:p-4 rounded-lg border bg-blue-50 border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium">No orders found. Customers need to create orders first.</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/orders'} className="text-xs w-full sm:w-auto">
              View Orders
            </Button>
          </div>
        </motion.div>
      )}

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />}
                {alert.type === 'info' && <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                <span className="text-sm font-medium">{alert.message}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => alert.actionUrl && (window.location.href = alert.actionUrl)}
                className="text-xs w-full sm:w-auto"
              >
                {alert.action}
              </Button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-green-600">{stats?.totalRevenue > 0 ? 'Live Data' : 'No Revenue'}</span>
              <p className="text-xs text-muted-foreground">from database</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalOrders || '0'}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-green-600">{stats?.totalOrders > 0 ? 'Live Data' : 'No Orders'}</span>
              <p className="text-xs text-muted-foreground">from database</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats?.totalCustomers?.toLocaleString() || '0'}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-green-600">{stats?.totalCustomers > 0 ? 'Live Data' : 'No Customers'}</span>
              <p className="text-xs text-muted-foreground">from database</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts?.toLocaleString() || '0'}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-green-600">{stats?.totalProducts > 0 ? 'Live Data' : 'No Products'}</span>
              <p className="text-xs text-muted-foreground">from database</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders?.toLocaleString() || '0'}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-yellow-600">{stats?.pendingOrders > 0 ? 'Needs Action' : 'All Clear'}</span>
              <p className="text-xs text-muted-foreground">from database</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.lowStockProducts || '0'}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-orange-600">{stats?.lowStockProducts > 0 ? 'Needs Restock' : 'Stock OK'}</span>
              <p className="text-xs text-muted-foreground">from database</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders {recentOrders.length > 0 ? '(Live Data)' : '(No Orders)'}</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{order.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 
                                   order.status === 'pending' ? 'secondary' : 
                                   order.status === 'shipped' ? 'outline' : 'default'}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = '/admin/orders'}>
                  View All Orders
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground">Orders will appear here once customers start purchasing</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>
                Best performing products {topProducts.length > 0 ? '(Live Data)' : '(No Sales Data)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sales} sales • {product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = '/admin/products'}>
                    View All Products
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sales data available</p>
                  <p className="text-sm text-muted-foreground">Product performance will appear here after sales</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      </div>
    </AdminErrorBoundary>
  );
}