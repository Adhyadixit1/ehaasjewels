-- Simple SQL to create an admin user for testing
-- Run this in your Supabase SQL Editor

-- First, create a user in auth.users (this simulates a signed-up user)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ehsaas.com',
  crypt('admin123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Admin","last_name":"User"}',
  false,
  '',
  '',
  '',
  ''
);

-- Then create the profile record
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  account_type,
  is_active
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@ehsaas.com'),
  'admin@ehsaas.com',
  'Admin',
  'User',
  'admin',
  true
);

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  p.account_type
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'admin@ehsaas.com';