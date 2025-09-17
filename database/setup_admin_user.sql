-- CREATE FIRST ADMIN USER IN SUPABASE
-- =====================================

-- Step 1: First, make sure your database tables exist
-- Run the main schema file: ehsaas_jewelry_schema.sql

-- Step 2: Temporarily disable RLS if needed for testing
-- Run the emergency RLS fix: emergency_rls_fix.sql

-- Step 3: Create admin user via signup (RECOMMENDED)
-- Use the signup form in the application with:
-- Email: admin@ehsaas.com
-- Password: admin123456
-- This will create both auth user and profile automatically

-- Step 4: Or manually create user if needed (ALTERNATIVE)
-- If signup doesn't work, you can manually insert:

-- First check if categories exist, create one if needed
INSERT INTO public.categories (name, slug, description, is_active) 
VALUES ('Rings', 'rings', 'Ring collection', true)
ON CONFLICT (slug) DO NOTHING;

-- Check authentication works by trying to create a test product
-- (This should only work after user is authenticated)

-- Step 5: Verify setup
-- 1. Login with admin@ehsaas.com / admin123456
-- 2. Go to Admin → Products → Add Product  
-- 3. Click "🔴 FULL DIAGNOSTIC" to test all connections
-- 4. Try creating a product

-- Notes:
-- - All authentication now goes through Supabase (no mock fallback)
-- - Users must exist in Supabase auth.users table
-- - Profiles are created automatically on signup
-- - Admin users detected by email containing "admin"