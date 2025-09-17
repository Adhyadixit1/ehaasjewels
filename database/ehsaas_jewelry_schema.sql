-- Ehsaas Jewelry - Clean Database Schema for Supabase
-- Simple and clean schema with essential e-commerce functionality

-- ============================================================================
-- USER PROFILES AND AUTHENTICATION
-- ============================================================================

-- PROFILES (linked to auth.users)
CREATE TABLE public.profiles (
  id bigint generated always as identity PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  profile_image_url text,
  cloudinary_public_id text,
  account_type text DEFAULT 'customer',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);

-- USER ADDRESSES
CREATE TABLE public.user_addresses (
  id bigint generated always as identity PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_type text DEFAULT 'shipping',
  first_name text,
  last_name text,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'India',
  phone text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);

-- ============================================================================
-- PRODUCT CATALOG
-- ============================================================================

-- CATEGORIES
CREATE TABLE public.categories (
  id bigint generated always as identity PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id bigint REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  cloudinary_public_id text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- PRODUCTS
CREATE TABLE public.products (
  id bigint generated always as identity PRIMARY KEY,
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  stock_quantity integer DEFAULT 0,
  min_stock_level integer DEFAULT 5,
  stock_status text DEFAULT 'in_stock',
  category_id bigint REFERENCES public.categories(id) ON DELETE SET NULL,
  brand text,
  material text,
  weight numeric(8,3),
  featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  average_rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_active ON public.products(is_active);

-- PRODUCT IMAGES (Cloudinary integration)
CREATE TABLE public.product_images (
  id bigint generated always as identity PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  cloudinary_public_id text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_primary ON public.product_images(is_primary);

-- PRODUCT SPECIFICATIONS
CREATE TABLE public.product_specifications (
  id bigint generated always as identity PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  spec_name text NOT NULL,
  spec_value text NOT NULL,
  display_order integer DEFAULT 0
);

CREATE INDEX idx_product_specs_product_id ON public.product_specifications(product_id);

-- ============================================================================
-- REVIEWS AND RATINGS
-- ============================================================================

-- PRODUCT REVIEWS
CREATE TABLE public.product_reviews (
  id bigint generated always as identity PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id bigint, -- Will reference orders table created below
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_title text,
  review_text text,
  is_verified_purchase boolean DEFAULT false,
  status text DEFAULT 'pending',
  helpful_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_status ON public.product_reviews(status);

-- ============================================================================
-- ORDERS AND TRANSACTIONS
-- ============================================================================

-- ORDERS
CREATE TABLE public.orders (
  id bigint generated always as identity PRIMARY KEY,
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text,
  payment_transaction_id text,
  subtotal numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) DEFAULT 0,
  shipping_amount numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  billing_address_id bigint REFERENCES public.user_addresses(id) ON DELETE SET NULL,
  shipping_address_id bigint REFERENCES public.user_addresses(id) ON DELETE SET NULL,
  shipping_method text,
  tracking_number text,
  notes text,
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);

-- Add foreign key to product_reviews now that orders table exists
ALTER TABLE public.product_reviews ADD CONSTRAINT fk_product_reviews_order_id 
  FOREIGN KEY (order_id) REFERENCES public.orders(id);

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id bigint generated always as identity PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_sku text,
  product_name text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- ORDER STATUS HISTORY
CREATE TABLE public.order_status_history (
  id bigint generated always as identity PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- ============================================================================
-- SHOPPING CART AND WISHLIST
-- ============================================================================

-- SHOPPING CART
CREATE TABLE public.shopping_cart (
  id bigint generated always as identity PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text, -- For guest users
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_shopping_cart_user_id ON public.shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_session_id ON public.shopping_cart(session_id);
CREATE INDEX idx_shopping_cart_product_id ON public.shopping_cart(product_id);

-- WISHLIST
CREATE TABLE public.wishlist (
  id bigint generated always as identity PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_wishlist_user_product UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist(product_id);

-- ============================================================================
-- ADMIN AND ANALYTICS
-- ============================================================================

-- ADMIN ACTIVITY LOGS
CREATE TABLE public.admin_activity_logs (
  id bigint generated always as identity PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_admin_activity_logs_admin_user_id ON public.admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_action ON public.admin_activity_logs(action);

-- VISITOR ANALYTICS
CREATE TABLE public.visitor_analytics (
  id bigint generated always as identity PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  ip_address inet,
  user_agent text,
  page_url text,
  device_type text,
  country text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_visitor_analytics_user_id ON public.visitor_analytics(user_id);
CREATE INDEX idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id bigint generated always as identity PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- ============================================================================
-- CLOUDINARY ASSETS
-- ============================================================================

-- CLOUDINARY ASSETS (Centralized media management)
CREATE TABLE public.cloudinary_assets (
  id bigint generated always as identity PRIMARY KEY,
  public_id text NOT NULL UNIQUE,
  url text NOT NULL,
  secure_url text NOT NULL,
  resource_type text NOT NULL,
  format text NOT NULL,
  width integer,
  height integer,
  bytes integer,
  folder text,
  tags text[],
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_cloudinary_assets_public_id ON public.cloudinary_assets(public_id);
CREATE INDEX idx_cloudinary_assets_resource_type ON public.cloudinary_assets(resource_type);
CREATE INDEX idx_cloudinary_assets_folder ON public.cloudinary_assets(folder);
CREATE INDEX idx_cloudinary_assets_tags ON public.cloudinary_assets USING gin(tags);

-- ============================================================================
-- CONSTRAINTS AND VALIDATIONS
-- ============================================================================

-- CHECK CONSTRAINTS
ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_account_type 
  CHECK (account_type IN ('customer','admin','super_admin'));

ALTER TABLE public.user_addresses ADD CONSTRAINT chk_address_type 
  CHECK (address_type IN ('home','work','billing','shipping'));

ALTER TABLE public.products ADD CONSTRAINT chk_stock_status 
  CHECK (stock_status IN ('in_stock','out_of_stock','low_stock'));

ALTER TABLE public.product_reviews ADD CONSTRAINT chk_review_status 
  CHECK (status IN ('pending','approved','rejected'));

ALTER TABLE public.orders ADD CONSTRAINT chk_order_status 
  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded'));

ALTER TABLE public.orders ADD CONSTRAINT chk_payment_status 
  CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded'));

ALTER TABLE public.notifications ADD CONSTRAINT chk_notification_type 
  CHECK (type IN ('order_update','stock_alert','promotion','system','review_request'));

ALTER TABLE public.visitor_analytics ADD CONSTRAINT chk_device_type 
  CHECK (device_type IN ('desktop','mobile','tablet'));

ALTER TABLE public.cloudinary_assets ADD CONSTRAINT chk_resource_type 
  CHECK (resource_type IN ('image','video','raw'));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cloudinary_assets ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Users can view and update own profile
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Users can manage own addresses
CREATE POLICY "Users can manage own addresses" ON public.user_addresses 
  FOR ALL USING (user_id = auth.uid());

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON public.categories 
  FOR SELECT USING (is_active = true);

-- Anyone can view active products
CREATE POLICY "Anyone can view active products" ON public.products 
  FOR SELECT USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON public.products 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Anyone can view product images
CREATE POLICY "Anyone can view product images" ON public.product_images 
  FOR SELECT USING (true);

-- Anyone can view product specifications
CREATE POLICY "Anyone can view product specifications" ON public.product_specifications 
  FOR SELECT USING (true);

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews 
  FOR SELECT USING (status = 'approved');

-- Users can manage own reviews
CREATE POLICY "Users can manage own reviews" ON public.product_reviews 
  FOR ALL USING (user_id = auth.uid());

-- Users can view own orders
CREATE POLICY "Users can view own orders" ON public.orders 
  FOR SELECT USING (user_id = auth.uid());

-- Users can create orders
CREATE POLICY "Users can create orders" ON public.orders 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Users can manage own cart
CREATE POLICY "Users can manage own cart" ON public.shopping_cart 
  FOR ALL USING (user_id = auth.uid());

-- Guest cart access
CREATE POLICY "Guest cart access" ON public.shopping_cart 
  FOR ALL USING (session_id IS NOT NULL AND user_id IS NULL);

-- Users can manage own wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlist 
  FOR ALL USING (user_id = auth.uid());

-- Users can view own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());

-- Users can update own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view activity logs
CREATE POLICY "Admins can view activity logs" ON public.admin_activity_logs 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- System can insert activity logs
CREATE POLICY "System can insert activity logs" ON public.admin_activity_logs 
  FOR INSERT WITH CHECK (true);

-- Admins can manage cloudinary assets
CREATE POLICY "Admins can manage cloudinary assets" ON public.cloudinary_assets 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- ORDER ITEMS POLICIES (NEWLY ADDED)
-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items" ON public.order_items 
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- Admins can manage all order items
CREATE POLICY "Admins can manage order items" ON public.order_items 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Allow insert of order items when user can insert orders
CREATE POLICY "Users can insert order items" ON public.order_items 
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'EJ' || TO_CHAR(now(), 'YYYYMMDD') || LPAD(floor(random() * 999999)::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number 
  BEFORE INSERT ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Function to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET 
    average_rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM public.product_reviews
      WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.product_reviews
      WHERE product_id = NEW.product_id AND status = 'approved'
    ),
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating 
  AFTER INSERT OR UPDATE ON public.product_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_cart_updated_at 
  BEFORE UPDATE ON public.shopping_cart 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Rings', 'rings', 'Beautiful collection of rings for all occasions', 1),
('Necklaces', 'necklaces', 'Elegant necklaces and pendants', 2),
('Earrings', 'earrings', 'Stunning earrings collection', 3),
('Bracelets', 'bracelets', 'Stylish bracelets and bangles', 4),
('Pendants', 'pendants', 'Graceful pendants and charms', 5),
('Sets', 'jewelry-sets', 'Complete jewelry sets', 6);

-- ============================================================================
-- SCHEMA VALIDATION AND OPTIMIZATION
-- ============================================================================

-- Create indexes for performance optimization
CREATE INDEX idx_products_category_active_price ON public.products(category_id, is_active, price);
CREATE INDEX idx_products_featured_active_created ON public.products(featured, is_active, created_at DESC);
CREATE INDEX idx_orders_user_status_created ON public.orders(user_id, status, created_at DESC);
CREATE INDEX idx_product_reviews_product_status_rating ON public.product_reviews(product_id, status, rating);

-- Partial indexes for better performance
CREATE INDEX idx_products_active_only ON public.products(id) WHERE is_active = true;
CREATE INDEX idx_orders_pending_only ON public.orders(created_at) WHERE status = 'pending';
CREATE INDEX idx_notifications_unread_only ON public.notifications(created_at) WHERE is_read = false;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- This clean schema provides:
-- ✅ Essential e-commerce functionality
-- ✅ Cloudinary integration for media management
-- ✅ Basic admin system with activity logging
-- ✅ User profiles and authentication support
-- ✅ Product catalog with categories and reviews
-- ✅ Order management system
-- ✅ Shopping cart and wishlist functionality
-- ✅ Visitor analytics and notifications
-- ✅ Row Level Security (RLS) for data protection
-- ✅ Performance optimizations with proper indexing
-- ✅ Automated triggers for business logic
-- ✅ Sample data for initial setup

-- Clean, simple, and production-ready for Ehsaas Jewelry platform!