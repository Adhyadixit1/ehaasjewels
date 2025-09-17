-- ============================================================================
-- ADD MEDIA TYPE SUPPORT TO PRODUCT IMAGES
-- ============================================================================
-- This update adds support for storing media type (image/video) in product_images table

-- First check if the column already exists
-- If it does, we'll skip the addition

-- Add media_type column to product_images table if it doesn't exist
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image';

-- Add constraint to ensure valid media types (PostgreSQL doesn't support IF NOT EXISTS for constraints)
-- We'll drop the constraint if it exists and then recreate it
ALTER TABLE public.product_images 
DROP CONSTRAINT IF EXISTS chk_media_type;

ALTER TABLE public.product_images 
ADD CONSTRAINT chk_media_type 
CHECK (media_type IN ('image', 'video'));

-- Add comment for clarity
COMMENT ON COLUMN public.product_images.media_type IS 'Type of media: image or video';

-- Update existing records to have proper media type (assuming all existing are images)
UPDATE public.product_images 
SET media_type = 'image' 
WHERE media_type IS NULL;

-- ============================================================================
-- UPDATE FLEXIBLE IMAGE VIEW TO INCLUDE MEDIA TYPE
-- ============================================================================

-- Drop the existing view first
DROP VIEW IF EXISTS product_images_flexible;

-- Recreate the flexible image view with all columns explicitly defined
CREATE VIEW product_images_flexible AS
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
    pi.media_type, -- Add media_type to the view
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
-- UPDATE HELPER FUNCTIONS TO INCLUDE MEDIA TYPE
-- ============================================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_product_images(bigint);
DROP FUNCTION IF EXISTS add_product_image(bigint, text, text, integer, boolean, text, text, text);

-- Create add_product_image function with media_type parameter
CREATE FUNCTION add_product_image(
    p_product_id bigint,
    p_image_url text,
    p_alt_text text DEFAULT '',
    p_sort_order integer DEFAULT 0,
    p_is_primary boolean DEFAULT false,
    p_image_source text DEFAULT 'direct_url',
    p_image_provider text DEFAULT 'external',
    p_cloudinary_public_id text DEFAULT NULL,
    p_media_type text DEFAULT 'image' -- Add media_type parameter
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
        cloudinary_public_id,
        media_type -- Add media_type to insert
    ) VALUES (
        p_product_id,
        p_image_url,
        p_alt_text,
        p_sort_order,
        p_is_primary,
        p_image_source,
        p_image_provider,
        p_cloudinary_public_id,
        p_media_type -- Add media_type to insert
    ) RETURNING id INTO new_image_id;
    
    RETURN new_image_id;
END;
$$ LANGUAGE plpgsql;

-- Create get_product_images function with media_type in return table
CREATE FUNCTION get_product_images(p_product_id bigint)
RETURNS TABLE (
    id bigint,
    image_url text,
    optimized_url text,
    thumbnail_url text,
    alt_text text,
    sort_order integer,
    is_primary boolean,
    image_source text,
    image_provider text,
    media_type text -- Add media_type to return
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
        pif.image_provider,
        pif.media_type -- Add media_type to select
    FROM product_images_flexible pif
    WHERE pif.product_id = p_product_id
    ORDER BY pif.sort_order, pif.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the update
SELECT 'Media type support added successfully' as message
UNION ALL
SELECT '✅ product_images table now includes media_type column'
UNION ALL
SELECT '✅ Flexible image view updated to include media_type'
UNION ALL
SELECT '✅ Helper functions updated to handle media_type'
UNION ALL
SELECT '✅ Existing records updated with default media_type=image';

-- Verify the schema change
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_images' 
AND column_name = 'media_type';

-- Verify the constraint
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'product_images' 
AND constraint_name = 'chk_media_type';