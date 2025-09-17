-- Fix RLS policy infinite recursion issue
-- Run this in your Supabase SQL Editor

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create simpler, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Also fix the admin activity logs policy if it exists
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.admin_activity_logs;

CREATE POLICY "Enable insert for authenticated users" ON public.admin_activity_logs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read for authenticated users" ON public.admin_activity_logs
FOR SELECT USING (auth.role() = 'authenticated');

-- Fix products policies to be simpler
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Enable all operations for authenticated users" ON public.products
FOR ALL USING (auth.role() = 'authenticated');

-- Fix product images policies
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;

CREATE POLICY "Enable all operations for authenticated users" ON public.product_images
FOR ALL USING (auth.role() = 'authenticated');

-- Fix product specifications policies
CREATE POLICY "Enable all operations for authenticated users" ON public.product_specifications
FOR ALL USING (auth.role() = 'authenticated');

-- Fix categories policies to allow creation
CREATE POLICY "Enable all operations for authenticated users" ON public.categories
FOR ALL USING (auth.role() = 'authenticated');