-- Debug script to verify database relationships and diagnose foreign key issues
-- Run this in your Supabase SQL Editor to check the current state

-- ============================================================================
-- 1. CHECK TABLE RELATIONSHIPS
-- ============================================================================

-- Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'profiles', 'order_items', 'products')
ORDER BY table_name;

-- ============================================================================
-- 2. VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Check all foreign key constraints related to orders and profiles
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name IN ('orders', 'profiles') OR ccu.table_name IN ('orders', 'profiles'))
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- 3. CHECK DATA INTEGRITY
-- ============================================================================

-- Count orders and verify user_id references
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids
FROM public.orders;

-- Count profiles and verify user_id references  
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_ids
FROM public.profiles;

-- Check for orphaned orders (orders without corresponding profiles)
SELECT 
    COUNT(*) as orphaned_orders
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.user_id
WHERE p.user_id IS NULL;

-- Check for orphaned profiles (profiles without corresponding auth users)
-- Note: This requires access to auth.users which may not be available in all contexts
-- SELECT 
--     COUNT(*) as orphaned_profiles
-- FROM public.profiles p
-- LEFT JOIN auth.users u ON p.user_id = u.id
-- WHERE u.id IS NULL;

-- ============================================================================
-- 4. SAMPLE DATA VERIFICATION
-- ============================================================================

-- Show sample orders with their corresponding profile data
SELECT 
    o.id as order_id,
    o.order_number,
    o.user_id,
    o.status,
    o.total,
    p.first_name,
    p.last_name,
    p.email,
    p.account_type
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.user_id
ORDER BY o.created_at DESC
LIMIT 10;

-- ============================================================================
-- 5. INDEX VERIFICATION
-- ============================================================================

-- Check indexes on critical columns
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('orders', 'profiles')
AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 6. RLS POLICY CHECK
-- ============================================================================

-- Check Row Level Security policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('orders', 'profiles')
ORDER BY tablename, policyname;

-- ============================================================================
-- 7. SUPABASE SPECIFIC CHECKS
-- ============================================================================

-- Check if Supabase REST API views exist (these help with relationships)
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public'
AND table_name LIKE '%orders%' OR table_name LIKE '%profiles%';

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================

-- 1. Tables should exist: orders, profiles, order_items, products
-- 2. Foreign keys should be:
--    - orders.user_id -> auth.users.id (if accessible)
--    - profiles.user_id -> auth.users.id (if accessible)
--    - order_items.order_id -> orders.id
--    - order_items.product_id -> products.id
-- 3. No orphaned orders (orders without profiles)
-- 4. Proper indexes on user_id columns
-- 5. RLS policies should allow admin access

-- If you see issues, common fixes:
-- 1. Recreate missing indexes
-- 2. Update RLS policies
-- 3. Check Supabase dashboard for relationship configuration
-- 4. Verify auth.users table accessibility