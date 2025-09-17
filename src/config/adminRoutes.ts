// Admin Routes Configuration and Documentation
// =============================================

/**
 * Admin Route Structure:
 * 
 * /admin/login - Public admin login page
 * /admin - Protected admin dashboard (requires admin role)
 * /admin/products - Product management (requires read:products permission)
 * /admin/products/add - Add product (requires write:products permission)
 * /admin/orders - Order management (requires read:orders permission)
 * /admin/customers - Customer management (requires read:users permission)
 * /admin/analytics - Analytics dashboard (requires read:analytics permission)
 * /admin/settings - System settings (requires read:settings permission)
 * 
 * Authentication Flow:
 * 1. User visits any /admin/* route (except /admin/login)
 * 2. ProtectedRoute checks authentication status
 * 3. If not authenticated, redirects to /admin/login
 * 4. If authenticated but not admin, redirects to /admin/login
 * 5. If admin but lacks specific permission, shows permission denied page
 * 6. If all checks pass, renders the requested component
 * 
 * Permission System:
 * - Admins have specific permissions: read:products, write:products, etc.
 * - Super admins have "*" permission (access to everything)
 * - Permissions are checked at route level and component level
 * 
 * User Roles:
 * - customer: Regular customers (no admin access)
 * - admin: Admin users with specific permissions
 * - super_admin: Full access to all admin features
 * 
 * Mock Credentials (for testing):
 * - Admin: admin@ehsaas.com / admin123
 * - Super Admin: superadmin@ehsaas.com / super123
 */

export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin',
  PRODUCTS: '/admin/products',
  PRODUCT_ADD: '/admin/products/add',
  ORDERS: '/admin/orders',
  CUSTOMERS: '/admin/customers',
  ANALYTICS: '/admin/analytics',
  SETTINGS: '/admin/settings'
} as const;

export const PERMISSIONS = {
  READ_PRODUCTS: 'read:products',
  WRITE_PRODUCTS: 'write:products',
  READ_ORDERS: 'read:orders',
  WRITE_ORDERS: 'write:orders',
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  READ_ANALYTICS: 'read:analytics',
  READ_SETTINGS: 'read:settings',
  WRITE_SETTINGS: 'write:settings',
  ALL: '*'
} as const;

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;