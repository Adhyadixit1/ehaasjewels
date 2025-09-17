import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminService, { AdminStats, RecentOrder, ProductStats, UserStats, AnalyticsData } from '@/services/AdminService';
import OrderService from '@/services/OrderService';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Query Keys
export const QUERY_KEYS = {
  DASHBOARD_STATS: ['admin', 'dashboard', 'stats'],
  RECENT_ORDERS: ['admin', 'dashboard', 'recent-orders'],
  TOP_PRODUCTS: ['admin', 'dashboard', 'top-products'],
  PRODUCTS: ['admin', 'products'],
  USERS: ['admin', 'users'],
  ORDERS: ['admin', 'orders'],
  ORDER_STATS: ['admin', 'orders', 'stats'],
  ANALYTICS: ['admin', 'analytics'],
} as const;

// Dashboard Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: AdminService.getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message?.includes('Authentication') || error.message?.includes('Admin access')) {
        return false;
      }
      return failureCount < 2; // Reduced retries
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true, // Always enabled, but will handle auth in service
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: [...QUERY_KEYS.RECENT_ORDERS, limit],
    queryFn: () => AdminService.getRecentOrders(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message?.includes('Authentication') || error.message?.includes('Admin access')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
}

export function useTopProducts(limit = 4) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TOP_PRODUCTS, limit],
    queryFn: () => AdminService.getTopProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      if (error.message?.includes('Authentication') || error.message?.includes('Admin access')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
}

// Products Hooks
export function useProducts(page = 1, limit = 20, search = '', category = '', status = '') {
  const queryResult = useQuery({
    queryKey: [...QUERY_KEYS.PRODUCTS, page, limit, search, category, status],
    queryFn: () => AdminService.getProducts(page, limit, search, category, status),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
  
  // Return the data structure that matches the regular useProducts hook
  return {
    ...queryResult,
    products: queryResult.data?.products || [],
    total: queryResult.data?.total || 0,
    totalPages: queryResult.data?.totalPages || 0,
    loading: queryResult.isLoading,
    error: queryResult.error?.message || null
  };
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: AdminService.deleteProduct,
    onSuccess: () => {
      // Invalidate and refetch products queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOP_PRODUCTS });
      
      // toast({
      //   title: 'Product Deleted',
      //   description: 'Product has been successfully deleted',
      // });
    },
    onError: (error: Error) => {
      // toast({
      //   title: 'Delete Failed',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ productId, updates }: { productId: number; updates: Partial<ProductStats> }) =>
      AdminService.updateProduct(productId, updates),
    onSuccess: () => {
      // Invalidate and refetch products queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TOP_PRODUCTS });
      
      // toast({
      //   title: 'Product Updated',
      //   description: 'Product has been successfully updated',
      // });
    },
    onError: (error: Error) => {
      // toast({
      //   title: 'Update Failed',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    },
  });
}

// Users Hooks
export function useUsers(page = 1, limit = 20, search = '', accountType = '') {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, page, limit, search, accountType],
    queryFn: () => AdminService.getUsers(page, limit, search, accountType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserStats> }) =>
      AdminService.updateUser(userId, updates),
    onSuccess: () => {
      // Invalidate and refetch users queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
      
      // toast({
      //   title: 'User Updated',
      //   description: 'User has been successfully updated',
      // });
    },
    onError: (error: Error) => {
      // toast({
      //   title: 'Update Failed',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    },
  });
}

// Orders Hooks
export function useOrders(page: number = 1, pageSize: number = 50) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, page, pageSize],
    queryFn: () => OrderService.getAllOrdersForAdmin(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error.message?.includes('Authentication') || error.message?.includes('Admin access')) {
        return false;
      }
      // Don't retry relationship/schema errors
      if (error.message?.includes('relationship') || error.message?.includes('schema cache')) {
        return false;
      }
      return failureCount < 3; // Allow more retries for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
    enabled: true, // Always enabled, but will handle auth in service
    placeholderData: (previousData) => previousData,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER_STATS,
    queryFn: OrderService.getOrderStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) =>
      OrderService.updateOrderStatus(orderId, newStatus),
    onSuccess: (_, { newStatus }) => {
      // Invalidate and refetch all order-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_STATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECENT_ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
      
      // toast({
      //   title: 'Order Updated',
      //   description: `Order status updated to ${newStatus}`,
      // });
    },
    onError: (error: Error) => {
      // toast({
      //   title: 'Update Failed',
      //   description: error.message,
      //   variant: 'destructive',
      // });
    },
  });
}

// Real-time Orders Hook
export function useRealtimeOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to order changes
    const orderSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('New order received:', payload.new);
          // Invalidate orders queries to refetch with new data
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECENT_ORDERS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_STATS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order updated:', payload.new);
          // Invalidate orders queries to refetch with updated data
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECENT_ORDERS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDER_STATS });
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [queryClient]);
}

// Analytics Hooks
export function useAnalytics() {
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS,
    queryFn: AdminService.getAnalytics,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 3,
    refetchOnWindowFocus: 'always', // Refresh when user returns to the tab
  });
}

// Utility Hooks
export function useRefreshAll() {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all admin queries to force refresh
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };
}

// Auto-invalidation hook for optimistic updates
export function useAutoInvalidate() {
  const queryClient = useQueryClient();

  const invalidateAfterMutation = (queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  return { invalidateAfterMutation };
}

// Performance monitoring hook
export function useQueryPerformance() {
  const queryClient = useQueryClient();

  const getQueryStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  };

  return { getQueryStats };
}