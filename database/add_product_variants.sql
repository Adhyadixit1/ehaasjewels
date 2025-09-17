-- Add Product Variants Schema for Sizes and Colors
-- This migration adds support for product variants (sizes, colors) to the Ehsaas Jewelry platform

-- ============================================================================
-- PRODUCT VARIANT TABLES
-- ============================================================================

-- PRODUCT VARIANT OPTIONS (Size, Color, etc.)
CREATE TABLE public.product_variant_options (
  id bigint generated always as identity PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., 'Size', 'Color'
  display_name text, -- e.g., 'Ring Size', 'Metal Color'
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_product_variant_options_product_id ON public.product_variant_options(product_id);
CREATE INDEX idx_product_variant_options_name ON public.product_variant_options(name);

-- PRODUCT VARIANT VALUES (Small, Medium, Large or Gold, Silver, Rose Gold)
CREATE TABLE public.product_variant_values (
  id bigint generated always as identity PRIMARY KEY,
  option_id bigint NOT NULL REFERENCES public.product_variant_options(id) ON DELETE CASCADE,
  value text NOT NULL, -- e.g., 'Small', 'Medium', 'Large' or 'Gold', 'Silver'
  display_value text, -- e.g., 'S', 'M', 'L' or '#FFD700', '#C0C0C0'
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_product_variant_values_option_id ON public.product_variant_values(option_id);
CREATE INDEX idx_product_variant_values_value ON public.product_variant_values(value);

-- PRODUCT VARIANTS (Specific combinations like Size: Small + Color: Gold)
CREATE TABLE public.product_variants (
  id bigint generated always as identity PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  name text, -- Optional: custom name for this variant
  price numeric(10,2), -- Optional: override base product price
  stock_quantity integer DEFAULT 0,
  min_stock_level integer DEFAULT 5,
  weight numeric(8,3), -- Optional: override base product weight
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_variants_active ON public.product_variants(is_active);

-- VARIANT VALUE ASSIGNMENTS (Links variants to their specific option values)
CREATE TABLE public.variant_value_assignments (
  id bigint generated always as identity PRIMARY KEY,
  variant_id bigint NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  option_id bigint NOT NULL REFERENCES public.product_variant_options(id) ON DELETE CASCADE,
  value_id bigint NOT NULL REFERENCES public.product_variant_values(id) ON DELETE CASCADE,
  UNIQUE(variant_id, option_id) -- Each variant can only have one value per option type
);

CREATE INDEX idx_variant_value_assignments_variant_id ON public.variant_value_assignments(variant_id);
CREATE INDEX idx_variant_value_assignments_option_id ON public.variant_value_assignments(option_id);
CREATE INDEX idx_variant_value_assignments_value_id ON public.variant_value_assignments(value_id);

-- VARIANT IMAGES (Allow different images for different variants)
CREATE TABLE public.variant_images (
  id bigint generated always as identity PRIMARY KEY,
  variant_id bigint NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_id bigint NOT NULL REFERENCES public.product_images(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  UNIQUE(variant_id, image_id)
);

CREATE INDEX idx_variant_images_variant_id ON public.variant_images(variant_id);
CREATE INDEX idx_variant_images_image_id ON public.variant_images(image_id);
CREATE INDEX idx_variant_images_primary ON public.variant_images(is_primary);

-- ============================================================================
-- UPDATE EXISTING TABLES
-- ============================================================================

-- Add variant_id to shopping_cart to support variant selection
ALTER TABLE public.shopping_cart ADD COLUMN variant_id bigint REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Add variant_id to order_items to support variant selection in orders
ALTER TABLE public.order_items ADD COLUMN variant_id bigint REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- Add indexes for the new foreign keys
CREATE INDEX idx_shopping_cart_variant_id ON public.shopping_cart(variant_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items(variant_id);

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.product_variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_value_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view active variant options
CREATE POLICY "Anyone can view active variant options" ON public.product_variant_options 
  FOR SELECT USING (is_active = true);

-- Anyone can view active variant values
CREATE POLICY "Anyone can view active variant values" ON public.product_variant_values 
  FOR SELECT USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.product_variant_options 
    WHERE id = option_id AND is_active = true
  ));

-- Anyone can view active product variants
CREATE POLICY "Anyone can view active product variants" ON public.product_variants 
  FOR SELECT USING (is_active = true AND EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = product_id AND is_active = true
  ));

-- Admins can manage variant options
CREATE POLICY "Admins can manage variant options" ON public.product_variant_options 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Admins can manage variant values
CREATE POLICY "Admins can manage variant values" ON public.product_variant_values 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Admins can manage product variants
CREATE POLICY "Admins can manage product variants" ON public.product_variants 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Admins can manage variant assignments
CREATE POLICY "Admins can manage variant assignments" ON public.variant_value_assignments 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- Admins can manage variant images
CREATE POLICY "Admins can manage variant images" ON public.variant_images 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_variant_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to variant tables
CREATE TRIGGER update_product_variant_options_updated_at 
  BEFORE UPDATE ON public.product_variant_options 
  FOR EACH ROW EXECUTE FUNCTION update_variant_updated_at_column();

CREATE TRIGGER update_product_variant_values_updated_at 
  BEFORE UPDATE ON public.product_variant_values 
  FOR EACH ROW EXECUTE FUNCTION update_variant_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at 
  BEFORE UPDATE ON public.product_variants 
  FOR EACH ROW EXECUTE FUNCTION update_variant_updated_at_column();

-- Function to auto-generate variant SKUs
CREATE OR REPLACE FUNCTION generate_variant_sku(base_sku text, option_values text[])
RETURNS text AS $$
DECLARE
  sku_suffix text;
BEGIN
  -- Create suffix from first letter of each option value
  SELECT string_agg(LEFT(unnest, 1), '') INTO sku_suffix FROM unnest(option_values);
  RETURN base_sku || '-' || UPPER(sku_suffix);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX idx_product_variants_product_active_price ON public.product_variants(product_id, is_active, price);
CREATE INDEX idx_variant_value_assignments_composite ON public.variant_value_assignments(variant_id, option_id, value_id);
CREATE INDEX idx_variant_images_composite ON public.variant_images(variant_id, is_primary, sort_order);

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Sample variant options and values would be added via the admin panel
-- This is just for reference of the data structure

-- Example data structure after admin panel usage:
-- Product: Diamond Ring (base product)
-- Variant Options: 
--   1. Size (display: Ring Size) with values: 6, 7, 8, 9
--   2. Color (display: Metal Color) with values: Gold, Silver, Rose Gold
-- Variants: All combinations (12 total)
--   Size 6 + Gold, Size 6 + Silver, Size 6 + Rose Gold, etc.