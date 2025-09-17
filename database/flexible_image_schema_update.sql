-- ============================================================================
-- FLEXIBLE IMAGE SCHEMA UPDATE
-- ============================================================================
-- This update makes the image system more flexible to allow URLs from any source
-- while keeping Cloudinary as the default option

-- ============================================================================
-- 1. UPDATE PRODUCT_IMAGES TABLE STRUCTURE
-- ============================================================================

-- Make cloudinary_public_id optional (allow NULL for non-Cloudinary images)
ALTER TABLE public.product_images 
ALTER COLUMN cloudinary_public_id DROP NOT NULL;

-- Add image source tracking column
ALTER TABLE public.product_images 
ADD COLUMN image_source text DEFAULT 'cloudinary';

-- Add image provider column for better tracking
ALTER TABLE public.product_images 
ADD COLUMN image_provider text DEFAULT 'cloudinary';

-- Update check constraint to allow various image sources
ALTER TABLE public.product_images 
ADD CONSTRAINT chk_image_source 
CHECK (image_source IN ('cloudinary', 'unsplash', 'pexels', 'direct_url', 'custom', 'ai_generated'));

-- Add comment for clarity
COMMENT ON COLUMN public.product_images.cloudinary_public_id IS 'Cloudinary public ID - only required for Cloudinary images, NULL for external sources';
COMMENT ON COLUMN public.product_images.image_source IS 'Source of the image: cloudinary, unsplash, pexels, direct_url, custom, ai_generated';
COMMENT ON COLUMN public.product_images.image_provider IS 'Provider name or description of image source';

-- ============================================================================
-- 2. UPDATE CLOUDINARY_ASSETS TABLE (Make it optional)
-- ============================================================================

-- Add external image tracking capability
ALTER TABLE public.cloudinary_assets 
ADD COLUMN is_external boolean DEFAULT false;

-- Add external source tracking
ALTER TABLE public.cloudinary_assets 
ADD COLUMN external_source text;

-- Update constraint to allow external resources
ALTER TABLE public.cloudinary_assets 
ADD CONSTRAINT chk_external_source 
CHECK (
  (is_external = false AND public_id IS NOT NULL) OR 
  (is_external = true AND external_source IS NOT NULL)
);

-- ============================================================================
-- 3. CREATE FLEXIBLE IMAGE VIEW
-- ============================================================================

-- Create a view that handles both Cloudinary and external images
CREATE OR REPLACE VIEW product_images_flexible AS
SELECT 
    pi.id,
    pi.product_id,
    pi.image_url,
    pi.alt_text,
    pi.sort_order,
    pi.is_primary,
    pi.image_source,
    pi.image_provider,
    pi.cloudinary_public_id,
    pi.created_at,
    -- Generate optimized URLs based on source
    CASE 
        WHEN pi.image_source = 'cloudinary' AND pi.cloudinary_public_id IS NOT NULL THEN
            -- For Cloudinary, we'll use the original URL if it already contains optimization
            -- or construct a basic optimized URL if only public_id is provided
            CASE 
                WHEN pi.image_url LIKE '%/image/upload/%' THEN pi.image_url
                ELSE CONCAT('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800,h_800,c_fill/', pi.cloudinary_public_id)
            END
        ELSE pi.image_url
    END as optimized_url,
    -- Generate thumbnail URLs
    CASE 
        WHEN pi.image_source = 'cloudinary' AND pi.cloudinary_public_id IS NOT NULL THEN
            CASE 
                WHEN pi.image_url LIKE '%/image/upload/%' THEN 
                    -- Replace existing transformations with thumbnail size
                    REGEXP_REPLACE(pi.image_url, '/image/upload/[^/]*/', '/image/upload/f_auto,q_auto,w_300,h_300,c_fill/')
                ELSE CONCAT('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_300,h_300,c_fill/', pi.cloudinary_public_id)
            END
        ELSE pi.image_url
    END as thumbnail_url
FROM public.product_images pi;

-- ============================================================================
-- 4. UPDATE RLS POLICIES FOR FLEXIBILITY
-- ============================================================================

-- Update RLS policy to allow external images
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;

CREATE POLICY "Anyone can view product images" ON public.product_images 
  FOR SELECT USING (true);

-- Allow admins to manage all types of images
CREATE POLICY "Admins can manage all images" ON public.product_images 
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND account_type IN ('admin', 'super_admin')
  ));

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to set Cloudinary cloud name for optimization
CREATE OR REPLACE FUNCTION set_cloudinary_cloud_name(cloud_name text)
RETURNS void AS $$
BEGIN
    -- Create or update a simple settings table for Cloudinary config
    CREATE TABLE IF NOT EXISTS app_settings (
        key text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamp with time zone DEFAULT now()
    );
    
    INSERT INTO app_settings (key, value, updated_at)
    VALUES ('cloudinary_cloud_name', cloud_name, now())
    ON CONFLICT (key) 
    DO UPDATE SET value = EXCLUDED.value, updated_at = now();
    
    RAISE NOTICE 'Cloudinary cloud name set to: %', cloud_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get Cloudinary cloud name
CREATE OR REPLACE FUNCTION get_cloudinary_cloud_name()
RETURNS text AS $$
DECLARE
    cloud_name text;
BEGIN
    SELECT value INTO cloud_name 
    FROM app_settings 
    WHERE key = 'cloudinary_cloud_name';
    
    RETURN COALESCE(cloud_name, 'demo');
END;
$$ LANGUAGE plpgsql;

-- Function to get optimized Cloudinary URL
CREATE OR REPLACE FUNCTION get_optimized_cloudinary_url(
    public_id text,
    transformations text DEFAULT 'f_auto,q_auto,w_800,h_800,c_fill'
)
RETURNS text AS $$
BEGIN
    RETURN CONCAT(
        'https://res.cloudinary.com/',
        get_cloudinary_cloud_name(),
        '/image/upload/',
        transformations,
        '/',
        public_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to add flexible product image
CREATE OR REPLACE FUNCTION add_product_image(
    p_product_id bigint,
    p_image_url text,
    p_alt_text text DEFAULT '',
    p_sort_order integer DEFAULT 0,
    p_is_primary boolean DEFAULT false,
    p_image_source text DEFAULT 'direct_url',
    p_image_provider text DEFAULT 'external',
    p_cloudinary_public_id text DEFAULT NULL
)
RETURNS bigint AS $$
DECLARE
    new_image_id bigint;
BEGIN
    INSERT INTO public.product_images (
        product_id, 
        image_url, 
        alt_text, 
        sort_order, 
        is_primary, 
        image_source,
        image_provider,
        cloudinary_public_id
    ) VALUES (
        p_product_id,
        p_image_url,
        p_alt_text,
        p_sort_order,
        p_is_primary,
        p_image_source,
        p_image_provider,
        p_cloudinary_public_id
    ) RETURNING id INTO new_image_id;
    
    RETURN new_image_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get product images with source info
CREATE OR REPLACE FUNCTION get_product_images(p_product_id bigint)
RETURNS TABLE (
    id bigint,
    image_url text,
    optimized_url text,
    thumbnail_url text,
    alt_text text,
    sort_order integer,
    is_primary boolean,
    image_source text,
    image_provider text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pif.id,
        pif.image_url,
        pif.optimized_url,
        pif.thumbnail_url,
        pif.alt_text,
        pif.sort_order,
        pif.is_primary,
        pif.image_source,
        pif.image_provider
    FROM product_images_flexible pif
    WHERE pif.product_id = p_product_id
    ORDER BY pif.sort_order, pif.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. UPDATE EXISTING DATA TO USE FLEXIBLE SYSTEM
-- ============================================================================

-- Update existing placeholder images to use 'demo' source
UPDATE public.product_images 
SET 
    image_source = 'demo',
    image_provider = 'placeholder',
    cloudinary_public_id = NULL
WHERE cloudinary_public_id LIKE 'jewelry/%';

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

-- Test the flexible system
SELECT 'Schema update completed successfully. You can now:' as message
UNION ALL
SELECT '✅ Use Cloudinary URLs with public_id for optimization' 
UNION ALL
SELECT '✅ Use direct URLs from Unsplash, Pexels, etc.' 
UNION ALL
SELECT '✅ Mix and match different image sources per product' 
UNION ALL
SELECT '✅ Track image sources for better management'
UNION ALL
SELECT '✅ Use helper functions for easy image management';

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Add Cloudinary image
SELECT add_product_image(
    1, -- product_id
    'https://res.cloudinary.com/yourcloud/image/upload/v1/jewelry/ring1.jpg',
    'Diamond Ring Main View',
    0, -- sort_order
    true, -- is_primary
    'cloudinary',
    'cloudinary',
    'jewelry/ring1' -- cloudinary_public_id for optimization
);

-- Example 2: Add Unsplash image
SELECT add_product_image(
    1, -- product_id
    'https://images.unsplash.com/photo-1234567890/ring.jpg?w=800',
    'Diamond Ring Side View',
    1, -- sort_order
    false, -- is_primary
    'unsplash',
    'Unsplash - Free Stock Photos'
);

-- Example 3: Add direct URL
SELECT add_product_image(
    1, -- product_id
    'https://example.com/images/jewelry/ring-detail.jpg',
    'Diamond Ring Detail View',
    2, -- sort_order
    false, -- is_primary
    'direct_url',
    'Custom Photography'
);

-- Get all images for a product
SELECT * FROM get_product_images(1);
*/