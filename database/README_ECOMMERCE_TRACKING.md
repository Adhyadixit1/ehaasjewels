# E-commerce Analytics Tracking Setup

## Overview
This document explains how to set up and apply the e-commerce analytics tracking implementation for the Ehsaas Jewellery platform.

## Prerequisites
- Access to the PostgreSQL database
- Admin privileges to run DDL statements
- Supabase project access

## Migration Steps

### 1. Apply Database Schema Changes
Run the complete migration script to add the necessary columns and functions:

```sql
-- Run this script in your database
\i database/complete_ecommerce_analytics_migration.sql
```

Alternatively, you can run the individual scripts in order:
1. `update_visitor_analytics_table.sql`
2. `add_ecommerce_tracking_functions.sql`

### 2. Verify Database Changes
After running the migration, verify that the changes were applied:

```sql
-- Check that the new columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'visitor_analytics'
AND column_name IN ('added_to_cart_count', 'initiated_checkout_count', 'completed_orders_count', 'updated_at');

-- Check that the functions were created
SELECT proname FROM pg_proc WHERE proname LIKE '%increment_%';
```

### 3. Test the Implementation
1. Add items to the cart and verify the `added_to_cart_count` increments in the `visitor_analytics` table
2. Navigate to the checkout page and verify the `initiated_checkout_count` increments
3. Complete an order and verify the `completed_orders_count` increments
4. Check the admin dashboard to ensure the metrics are displayed correctly

## Implementation Details

### Frontend Tracking
The implementation automatically tracks:
- **Cart Additions**: When items are added to cart in the CartContext
- **Checkout Initiation**: When the checkout page is loaded
- **Order Completion**: When an order is successfully created

### Session Management
Visitor sessions are tracked using a session ID stored in localStorage. This allows tracking of user behavior across page views within the same browsing session.

### Analytics Dashboard
The admin analytics dashboard displays the new e-commerce metrics:
- Added to Cart count
- Checkout initiation count
- Completed orders count
- Conversion rate (completed orders / unique visitors)

## Troubleshooting

### If tracking is not working:
1. Verify that the database migration was applied successfully
2. Check the browser console for any JavaScript errors
3. Ensure that the Supabase RPC functions are accessible
4. Verify that localStorage is enabled in the browser

### If analytics data is not displaying:
1. Check that the AdminService is correctly aggregating the data
2. Verify that the database queries in AdminService.getAnalytics() are returning data
3. Check the browser console for any React rendering errors

## Future Enhancements

Potential future enhancements could include:
- Geographic tracking based on IP address
- More detailed product interaction tracking
- Real-time dashboard updates using Supabase real-time features
- Integration with external analytics platforms