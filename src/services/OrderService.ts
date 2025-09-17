import { supabase } from '@/integrations/supabase/client';

// Define the ShippingInfo interface locally since it's used in this file
interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export interface OrderData {
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  subtotal: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  total: number;
  currency?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  // Remove the direct shipping fields since we'll use the address table
}

export interface OrderItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  size?: string; // Product variant size - stored when database schema supports it
  color?: string; // Product variant color - stored when database schema supports it
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface UserAddress {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  phone?: string;
  landmark?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method?: string;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  tracking_number?: string;
  shipping_address_id?: number;
  // Some databases may expose this field name via a different FK naming convention
  orders_shipping_address_id?: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
  profiles?: UserProfile;
  shipping_address?: UserAddress;
  // Remove the direct shipping fields since we'll use the address table
  orderNumber?: string; // Alias for order_number
  userId?: string; // Alias for user_id
  paymentStatus?: string; // Alias for payment_status
  taxAmount?: number; // Alias for tax_amount
  shippingAmount?: number; // Alias for shipping_amount
  discountAmount?: number; // Alias for discount_amount
  trackingNumber?: string; // Alias for tracking_number
  createdAt?: string; // Alias for created_at
  updatedAt?: string; // Alias for updated_at
}

// Track completed order
const trackCompletedOrder = async () => {
  try {
    // Get session ID from localStorage
    const sessionId = typeof window !== 'undefined' ? 
      localStorage.getItem('visitor_session_id') : null;
    
    console.log('Tracking completed order:', { sessionId });
    
    if (sessionId) {
      // Increment completed orders
      const params = {
        p_session_id: sessionId
      };
      
      console.log('Calling increment_completed_orders with params:', params);
      
      const { error } = await supabase.rpc('increment_completed_orders', params);
      
      if (error) {
        console.error('Error tracking completed order:', error);
        console.error('Session ID:', sessionId);
        // Try to get more detailed error information
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log('Completed order tracked successfully');
      }
    } else {
      console.warn('No session ID found for completed order tracking');
    }
  } catch (error) {
    console.error('Error tracking completed order:', error);
    // Log more detailed error information if available
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
};

class OrderService {
  
  /**
   * Generate a random guest email
   */
  static generateGuestEmail(): string {
    return `guest_${Math.random().toString(36).substring(2, 10)}_${Date.now()}@ehsaasjewellery.com`;
  }
  
  /**
   * Check if a user ID belongs to a guest account
   */
  static isGuestUser(userId: string): boolean {
    // Guest users typically have a specific pattern in their ID or are marked in some way
    // For now, we'll check if it's the anonymous user
    return userId === 'anonymous';
  }
  
  /**
   * Create a guest user with a random email if none is provided
   */
  static async createGuestUser(shippingInfo: any): Promise<string | null> {
    try {
      // Generate a guest email if none provided
      const guestEmail = this.generateGuestEmail();
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      // Sign up the guest user
      const { data, error } = await supabase.auth.signUp({
        email: guestEmail,
        password: randomPassword,
        options: {
          data: {
            first_name: shippingInfo.fullName.split(' ')[0] || 'Guest',
            last_name: shippingInfo.fullName.split(' ').slice(1).join(' ') || 'User'
          }
        }
      });

      if (error) {
        console.error('Error creating guest user:', error);
        return null;
      }

      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create profile for the guest user
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: guestEmail,
              first_name: shippingInfo.fullName.split(' ')[0] || 'Guest',
              last_name: shippingInfo.fullName.split(' ').slice(1).join(' ') || 'User',
              account_type: 'customer',
              is_active: true
            });

          if (profileError) {
            console.error('Error creating guest profile:', profileError);
          }

          return data.user.id;
        } catch (profileError) {
          console.error('Exception creating guest profile:', profileError);
          return data.user.id;
        }
      }

      return null;
    } catch (error) {
      console.error('Exception creating guest user:', error);
      return null;
    }
  }
  
  /**
   * Get all orders for the authenticated user
   */
  static async getUserOrders(): Promise<Order[]> {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required to view orders');
      }

      console.log('🛒 Fetching orders for user:', user.email);

      // Fetch orders for the authenticated user with items
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!order_items_order_id_fkey (
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
        throw new Error(`Failed to fetch orders: ${ordersError.message}`);
      }

      if (!orders || orders.length === 0) {
        console.log('📦 No orders found for user');
        return [];
      }

      // Fetch shipping addresses for all orders that have a shipping address reference
      const shippingAddressIds = orders
        .map(order => order.shipping_address_id ?? (order as any).orders_shipping_address_id)
        .filter((id): id is number => Boolean(id));
      
      let shippingAddressesMap = new Map();
      if (shippingAddressIds.length > 0) {
        const { data: shippingAddresses, error: shippingError } = await supabase
          .from('user_addresses')
          .select('id, first_name, last_name, address_line_1, address_line_2, city, state, postal_code, phone, landmark')
          .in('id', shippingAddressIds);
        
        if (shippingError) {
          console.warn('Could not fetch shipping addresses:', shippingError);
        } else {
          shippingAddresses.forEach(address => {
            shippingAddressesMap.set(address.id, address);
          });
        }
      }

      // Fetch the profile for the user
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, phone')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch profile for user:', profileError);
      }

      // Transform orders to match our interface
      const transformedOrders: Order[] = orders.map(order => ({
        ...order,
        items: order.order_items?.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          size: item.size || undefined,
          color: item.color || undefined
        })) || [],
        order_items: order.order_items?.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          size: item.size || undefined,
          color: item.color || undefined
        })) || [],
        shipping_address: (order.shipping_address_id ?? (order as any).orders_shipping_address_id)
          ? shippingAddressesMap.get(order.shipping_address_id ?? (order as any).orders_shipping_address_id)
          : undefined,
        profiles: userProfile || undefined
      }));

      console.log(`✅ Found ${transformedOrders.length} orders for user`);
      return transformedOrders;

    } catch (error) {
      console.error('💥 OrderService.getUserOrders error:', error);
      throw error;
    }
  }

  /**
   * Get all orders for admin (with customer details) - Enhanced with robust error handling
   */
  static async getAllOrdersForAdmin(page: number = 1, pageSize: number = 50): Promise<{ orders: any[], total: number }> {
    try {
      // Check authentication and admin status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('user_id', user.id)
        .single();

      if (!profile || (profile.account_type !== 'admin' && profile.account_type !== 'super_admin')) {
        throw new Error('Admin access required');
      }

      console.log('🏢 Admin fetching all orders with enhanced error handling...');

      // Fetch orders with items
      const offset = (page - 1) * pageSize;
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!order_items_order_id_fkey (
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
        throw new Error(`Failed to fetch orders: ${ordersError.message}`);
      }

      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (!orders || orders.length === 0) {
        console.log('📦 No orders found');
        return { orders: [], total: 0 };
      }

      // Fetch shipping addresses for all orders that have a shipping address reference
      const shippingAddressIds = orders
        .map(order => order.shipping_address_id ?? (order as any).orders_shipping_address_id)
        .filter((id): id is number => Boolean(id));
      
      let shippingAddressesMap = new Map();
      if (shippingAddressIds.length > 0) {
        const { data: shippingAddresses, error: shippingError } = await supabase
          .from('user_addresses')
          .select('id, first_name, last_name, address_line_1, address_line_2, city, state, postal_code, phone, landmark')
          .in('id', shippingAddressIds);
        
        if (shippingError) {
          console.warn('Could not fetch shipping addresses:', shippingError);
        } else {
          shippingAddresses.forEach(address => {
            shippingAddressesMap.set(address.id, address);
          });
        }
      }

      // Fetch profiles for all users in the orders
      const userIds = [...new Set(orders.map(order => order.user_id))].filter(id => id && id.length > 0);
      let profiles = [];
      let profilesError = null;
      
      if (userIds.length > 0) {
        try {
          const result = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name, email, phone')
            .in('user_id', userIds);
          
          profiles = result.data || [];
          profilesError = result.error;
          
          if (profilesError) {
            console.error('❌ Error fetching profiles:', profilesError);
          }
        } catch (error) {
          console.error('❌ Exception fetching profiles:', error);
        }
      }

      // Create a map of profiles for quick lookup
      const profilesMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      // Transform the orders data to match our interface
      const transformedOrders = orders.map(order => ({
        ...order,
        items: order.order_items?.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          size: item.size || undefined,
          color: item.color || undefined
        })) || [],
        order_items: order.order_items?.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          size: item.size || undefined,
          color: item.color || undefined
        })) || [],
        shipping_address: (order.shipping_address_id ?? (order as any).orders_shipping_address_id)
          ? shippingAddressesMap.get(order.shipping_address_id ?? (order as any).orders_shipping_address_id)
          : undefined,
        profiles: profilesMap.get(order.user_id) || undefined
      }));

      console.log(`✅ Admin successfully processed ${transformedOrders.length} orders with customer details`);
      return { orders: transformedOrders, total: totalCount || 0 };

    } catch (error) {
      console.error('💥 OrderService.getAllOrdersForAdmin critical error:', error);
      
      // Emergency fallback: Return empty array instead of crashing the UI
      if (error.message?.includes('relationship') || error.message?.includes('schema cache')) {
        console.error('🚑 Database relationship error detected, implementing emergency fallback');
        return { orders: [], total: 0 };
      }
      
      throw error;
    }
  }

  /**
   * Get order by ID (only for owner or admin)
   */
  static async getOrderById(orderId: number | string): Promise<Order | null> {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // Allow guest access for order confirmation
      const isGuestUser = !user || authError;
      
      if (isGuestUser) {
        console.log('🔍 Guest user accessing order confirmation:', orderId);
      } else {
        console.log('🔍 Authenticated user accessing order:', orderId, user.email);
      }

      console.log('🔍 Fetching order:', orderId);

      // Fetch order with items
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items!order_items_order_id_fkey (
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('id', parseInt(orderId.toString()))
        .single();

      if (orderError) {
        console.error('❌ Error fetching order:', orderError);
        throw new Error(`Failed to fetch order: ${orderError.message}`);
      }

      if (!order) {
        return null;
      }

      console.log('📦 Raw order data from database:', order);
      console.log('📦 Raw order_items from database:', order.order_items);

      // Check if user owns this order or is admin
      const isOwner = user && order.user_id === user.id;
      
      // Skip ownership check for guest users accessing order confirmation
      if (!isGuestUser && !isOwner) {
        // Check if user is admin
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.warn('Could not fetch profile for user:', profileError);
            // If we can't fetch the profile, assume user is not admin
            throw new Error('Access denied: You can only view your own orders');
          }

          const isAdmin = profile && (profile.account_type === 'admin' || profile.account_type === 'super_admin');
          
          if (!isAdmin) {
            throw new Error('Access denied: You can only view your own orders');
          }
        } catch (profileError) {
          console.warn('Error checking admin status:', profileError);
          throw new Error('Access denied: You can only view your own orders');
        }
      }
      
      // For guest users, only allow access if it's a guest order
      if (isGuestUser && !this.isGuestUser(order.user_id)) {
        throw new Error('Access denied: This order requires authentication');
      }

      // Fetch the shipping address separately if a shipping address id exists
      let shippingAddress = null;
      const resolvedShippingAddressId = order.shipping_address_id ?? (order as any).orders_shipping_address_id;
      if (resolvedShippingAddressId) {
        const { data: shippingData, error: shippingError } = await supabase
          .from('user_addresses')
          .select('first_name, last_name, address_line_1, address_line_2, city, state, postal_code, phone, landmark')
          .eq('id', resolvedShippingAddressId)
          .single();
        
        if (shippingError) {
          console.warn('Could not fetch shipping address:', shippingError);
        } else {
          shippingAddress = shippingData;
        }
      }

      // Fetch the profile for the order's user
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, phone')
        .eq('user_id', order.user_id)
        .single();

      if (profileError) {
        console.warn('Could not fetch profile for order user:', profileError);
      }

      // Transform the order data to match our interface
      const transformedItems = order.order_items?.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        productSku: item.product_sku,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        size: item.size || undefined,
        color: item.color || undefined
      })) || [];
      
      console.log('📦 Transformed order items:', transformedItems);
      
      const transformedOrder: any = {
        ...order,
        items: transformedItems,
        order_items: transformedItems,
        shipping_address: shippingAddress,
        profiles: userProfile || undefined
      };
      
      console.log('📦 Final transformed order:', transformedOrder);

      console.log('📦 Raw order data:', order);
      console.log('📦 Transformed order data:', transformedOrder);
      console.log('✅ Order found:', transformedOrder.order_number);
      return transformedOrder as Order;

    } catch (error) {
      console.error('💥 OrderService.getOrderById error:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  static async createOrder(
    orderData: OrderData,
    orderItems: OrderItem[],
    shippingInfo?: ShippingInfo
  ): Promise<any> {
    try {
      console.log('📦 Creating order with data:', { orderData, orderItems, shippingInfo });
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Create shipping address if provided
      let shippingAddressId: number | undefined;
      if (shippingInfo) {
        const addressData = {
          user_id: user.id,
          first_name: shippingInfo.fullName.split(' ')[0] || shippingInfo.fullName,
          last_name: shippingInfo.fullName.split(' ').slice(1).join(' ') || '',
          address_line_1: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal_code: shippingInfo.pincode,
          phone: shippingInfo.phone,
          landmark: shippingInfo.landmark || undefined
        };

        const { data: address, error: addressError } = await supabase
          .from('user_addresses')
          .insert(addressData)
          .select()
          .single();

        if (addressError) {
          console.error('❌ Error creating shipping address:', addressError);
          throw new Error(`Failed to create shipping address: ${addressError.message}`);
        }

        shippingAddressId = address.id;
      }

      // Create the order
      const orderToInsert = {
        order_number: orderData.orderNumber,
        user_id: orderData.userId,
        status: orderData.status,
        payment_status: orderData.paymentStatus,
        payment_method: orderData.paymentMethod,
        subtotal: orderData.subtotal,
        tax_amount: orderData.taxAmount || 0,
        shipping_amount: orderData.shippingAmount || 0,
        discount_amount: orderData.discountAmount || 0,
        total: orderData.total,
        currency: orderData.currency || 'INR',
        shipping_address_id: shippingAddressId,
        shipping_method: orderData.shippingMethod,
        tracking_number: orderData.trackingNumber,
        notes: orderData.notes
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderToInsert)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // Create order items
      const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_sku: item.productSku,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('❌ Error creating order items:', itemsError);
        // Try to delete the order if items failed to create
        await supabase.from('orders').delete().eq('id', order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      // Track completed order
      await trackCompletedOrder();

      console.log('✅ Order created successfully:', order);
      return order;

    } catch (error) {
      console.error('💥 OrderService.createOrder error:', error);
      throw error;
    }
  }

  /**
   * Update order status (admin only)
   */
  static async updateOrderStatus(orderId: number | string, newStatus: string): Promise<boolean> {
    try {
      // Check authentication and admin status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if user is admin
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Admin access required to update order status');
        }

        if (!profile || (profile.account_type !== 'admin' && profile.account_type !== 'super_admin')) {
          throw new Error('Admin access required to update order status');
        }
      } catch (profileError) {
        console.error('Error checking admin status:', profileError);
        throw new Error('Admin access required to update order status');
      }

      console.log('🔄 Admin updating order status:', orderId, '->', newStatus);

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', parseInt(orderId.toString()));

      if (updateError) {
        console.error('❌ Error updating order status:', updateError);
        throw new Error(`Failed to update order status: ${updateError.message}`);
      }

      console.log('✅ Order status updated successfully');
      return true;

    } catch (error) {
      console.error('💥 OrderService.updateOrderStatus error:', error);
      throw error;
    }
  }

  /**
   * Get order statistics for admin dashboard
   */
  static async getOrderStatistics(): Promise<any> {
    try {
      // Check authentication and admin status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Check if user is admin
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          throw new Error('Admin access required');
        }

        if (!profile || (profile.account_type !== 'admin' && profile.account_type !== 'super_admin')) {
          throw new Error('Admin access required');
        }
      } catch (profileError) {
        console.error('Error checking admin status:', profileError);
        throw new Error('Admin access required');
      }

      console.log('📊 Fetching order statistics...');

      // Get order counts by status
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status, payment_status, total');

      if (ordersError) {
        console.error('❌ Error fetching order statistics:', ordersError);
        throw new Error(`Failed to fetch statistics: ${ordersError.message}`);
      }

      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.status === 'pending').length || 0,
        shippedOrders: orders?.filter(o => o.status === 'shipped').length || 0,
        deliveredOrders: orders?.filter(o => o.status === 'delivered').length || 0,
        totalRevenue: orders?.filter(o => o.payment_status === 'paid').reduce((sum, order) => sum + order.total, 0) || 0
      };

      console.log('✅ Order statistics:', stats);
      return stats;

    } catch (error) {
      console.error('💥 OrderService.getOrderStatistics error:', error);
      throw error;
    }
  }

  /**
   * Test database connection and authentication
   */
  static async testConnection(): Promise<{success: boolean, message: string}> {
    try {
      // Test authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          message: 'Authentication required - user not logged in'
        };
      }

      // Test orders table access
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `Database access failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: `Connected successfully. User: ${user.email}`
      };

    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

export default OrderService;