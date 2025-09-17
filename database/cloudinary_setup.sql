-- ============================================================================
-- CLOUDINARY SETUP SCRIPT
-- ============================================================================
-- Run this after flexible_image_schema_update.sql to configure your Cloudinary

-- ============================================================================
-- STEP 1: SET YOUR CLOUDINARY CLOUD NAME
-- ============================================================================
-- Replace 'your-cloud-name' with your actual Cloudinary cloud name
-- You can find this in your Cloudinary dashboard under "Account Details"

SELECT set_cloudinary_cloud_name('your-cloud-name');

-- ============================================================================
-- STEP 2: TEST THE CONFIGURATION
-- ============================================================================

-- Test getting the cloud name
SELECT get_cloudinary_cloud_name() as current_cloud_name;

-- Test generating optimized URLs
SELECT get_optimized_cloudinary_url('jewelry/sample-ring') as optimized_url;
SELECT get_optimized_cloudinary_url('jewelry/sample-ring', 'f_auto,q_auto,w_300,h_300,c_fill') as thumbnail_url;

-- ============================================================================
-- STEP 3: UPDATE EXISTING CLOUDINARY IMAGES (if any)
-- ============================================================================

-- If you have existing Cloudinary images, you can update them to use optimization
UPDATE public.product_images 
SET image_url = get_optimized_cloudinary_url(cloudinary_public_id)
WHERE image_source = 'cloudinary' 
AND cloudinary_public_id IS NOT NULL
AND image_url NOT LIKE '%/image/upload/f_auto%';

-- ============================================================================
-- STEP 4: VERIFY UPDATED IMAGES
-- ============================================================================

-- Check your Cloudinary images
SELECT 
    product_id,
    image_url,
    cloudinary_public_id,
    image_source
FROM public.product_images 
WHERE image_source = 'cloudinary'
ORDER BY product_id;

-- ============================================================================
-- EXAMPLE: Adding new Cloudinary images with your cloud name
-- ============================================================================

/*
-- Example of adding a new Cloudinary image (uncomment and modify):

SELECT add_product_image(
    1, -- product_id
    get_optimized_cloudinary_url('jewelry/rings/diamond-ring-001'), -- auto-optimized URL
    'Diamond Ring Main View',
    0, -- sort_order
    true, -- is_primary
    'cloudinary',
    'Cloudinary Professional',
    'jewelry/rings/diamond-ring-001' -- public_id
);

-- Or add with custom transformations:
SELECT add_product_image(
    1, -- product_id
    get_optimized_cloudinary_url('jewelry/rings/diamond-ring-side', 'f_auto,q_auto,w_600,h_600,c_fill,e_sharpen:100'), -- custom transformations
    'Diamond Ring Side View',
    1, -- sort_order
    false, -- is_primary
    'cloudinary',
    'Cloudinary Professional',
    'jewelry/rings/diamond-ring-side' -- public_id
);
*/

-- ============================================================================
-- USEFUL CLOUDINARY TRANSFORMATIONS
-- ============================================================================

/*
COMMON TRANSFORMATIONS:
- f_auto,q_auto = Auto format and quality
- w_800,h_800,c_fill = Resize to 800x800, crop to fill
- w_300,h_300,c_thumb = Thumbnail 300x300
- e_sharpen:100 = Sharpen image
- e_improve = AI enhancement
- f_webp = Force WebP format
- q_80 = 80% quality

EXAMPLES:
- Product main: f_auto,q_auto,w_1200,h_1200,c_fill
- Thumbnail: f_auto,q_auto,w_300,h_300,c_thumb
- Gallery: f_auto,q_auto,w_800,h_600,c_fit
- Mobile: f_auto,q_auto,w_400,h_400,c_fill,q_80
*/

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 'Cloudinary setup completed!' as message
UNION ALL
SELECT 'Your cloud name: ' || get_cloudinary_cloud_name()
UNION ALL  
SELECT 'You can now add Cloudinary images with automatic optimization!'
UNION ALL
SELECT 'Use get_optimized_cloudinary_url(public_id) for automatic optimization';