import React from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  Database, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Full page loading for initial admin panel load
export function AdminPageLoader({ message = 'Loading admin panel...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.div
          className="w-16 h-16"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src="/ehsaas-logo.png" 
            alt="एहसास Jewellery" 
            className="w-full h-full object-contain"
          />
        </motion.div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">एहसास Jewelry Admin</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Authentication checking loader
export function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="w-12 h-12"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src="/ehsaas-logo.png" 
            alt="एहसास Jewellery" 
            className="w-full h-full object-contain"
          />
        </motion.div>
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  );
}

// Dashboard component loading skeletons
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table header */}
      <div className="flex items-center gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-24" />
        ))}
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex items-center gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={`h-4 ${colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-16' : 'w-20'}`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Inline loading spinner for buttons and small components
export function InlineLoader({ size = 'sm', text }: { size?: 'xs' | 'sm' | 'md'; text?: string }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-2">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Data loading states with context
export function DataLoader({ 
  type, 
  message 
}: { 
  type: 'dashboard' | 'products' | 'users' | 'orders' | 'analytics'; 
  message?: string;
}) {
  const configs = {
    dashboard: {
      icon: BarChart3,
      defaultMessage: 'Loading dashboard data...',
      color: 'text-blue-500'
    },
    products: {
      icon: Package,
      defaultMessage: 'Loading products...',
      color: 'text-green-500'
    },
    users: {
      icon: Users,
      defaultMessage: 'Loading users...',
      color: 'text-purple-500'
    },
    orders: {
      icon: ShoppingCart,
      defaultMessage: 'Loading orders...',
      color: 'text-orange-500'
    },
    analytics: {
      icon: Database,
      defaultMessage: 'Loading analytics...',
      color: 'text-indigo-500'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={`w-8 h-8 mb-4 ${config.color}`}
      >
        <Icon className="w-full h-full" />
      </motion.div>
      <p className="text-sm text-muted-foreground">
        {message || config.defaultMessage}
      </p>
    </div>
  );
}

// Error state component
export function ErrorState({ 
  error, 
  onRetry, 
  context = 'data'
}: { 
  error: Error | string; 
  onRetry?: () => void;
  context?: string;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Failed to load {context}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {errorMessage}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title, 
  description, 
  action, 
  icon: Icon = Package 
}: { 
  title: string; 
  description: string; 
  action?: { label: string; onClick: () => void; };
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Network status indicator
export function NetworkStatus({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm z-50"
    >
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        You are currently offline. Some features may not work properly.
      </div>
    </motion.div>
  );
}

// Progressive loading component for lists
export function ProgressiveLoader({ 
  items, 
  renderItem, 
  isLoading, 
  hasMore, 
  onLoadMore 
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="space-y-4">
      {items.map(renderItem)}
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <InlineLoader text="Loading more..." />
        </div>
      )}
      
      {!isLoading && hasMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No more items to load
        </div>
      )}
    </div>
  );
}