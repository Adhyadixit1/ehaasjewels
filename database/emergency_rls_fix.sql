-- EMERGENCY RLS FIX for Product Creation Issues
-- Run this in your Supabase SQL Editor to temporarily disable RLS on products table

-- STEP 1: Disable RLS on products table temporarily
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- STEP 2: Disable RLS on categories table temporarily  
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- STEP 3: Disable RLS on product_images table temporarily
ALTER TABLE public.product_images DISABLE ROW LEVEL SECURITY;

-- STEP 4: Disable RLS on product_specifications table temporarily
ALTER TABLE public.product_specifications DISABLE ROW LEVEL SECURITY;

-- STEP 5: Create a test category if none exists
INSERT INTO public.categories (name, slug, description, is_active) 
VALUES ('Test Category', 'test-category', 'Emergency test category', true)
ON CONFLICT (slug) DO NOTHING;

-- STEP 6: Create admin activity logs table RLS bypass
ALTER TABLE public.admin_activity_logs DISABLE ROW LEVEL SECURITY;

-- Note: This is TEMPORARY for debugging - re-enable RLS after testing:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;