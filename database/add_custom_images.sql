-- ============================================================================
-- EASY IMAGE MANAGEMENT FOR EHSAAS JEWELRY
-- ============================================================================
-- Use these SQL functions to easily add images from any source

-- ============================================================================
-- QUICK ADD FUNCTIONS (Copy, edit values, and run)
-- ============================================================================

-- Example 1: Add Cloudinary image with optimization
SELECT add_product_image(
    1,                                                          -- product_id (change this)
    'https://res.cloudinary.com/your-cloud/image/upload/v1/jewelry/ring.jpg', -- image_url (change this)
    'Diamond Ring Professional Shot',                           -- alt_text (change this)
    0,                                                          -- sort_order (0=primary, 1,2,3=additional)
    true,                                                       -- is_primary (true for main image)
    'cloudinary',                                               -- image_source
    'Cloudinary Professional',                                  -- image_provider
    'jewelry/ring'                                              -- cloudinary_public_id (for optimization)
);

-- Example 2: Add Unsplash image
SELECT add_product_image(
    2,                                                          -- product_id (change this)
    'https://images.unsplash.com/photo-1234567890/jewelry.jpg?w=800&h=800&fit=crop', -- image_url (change this)
    'Ruby Ring Artistic View',                                  -- alt_text (change this)
    0,                                                          -- sort_order
    true,                                                       -- is_primary
    'unsplash',                                                 -- image_source
    'Unsplash - Photographer Name',                             -- image_provider
    NULL                                                        -- cloudinary_public_id (NULL for external)
);

-- Example 3: Add Pexels image
SELECT add_product_image(
    3,                                                          -- product_id
    'https://images.pexels.com/photos/1234567/jewelry.jpeg?w=800&h=800&fit=crop', -- image_url
    'Emerald Ring Close-up',                                    -- alt_text
    0,                                                          -- sort_order
    true,                                                       -- is_primary
    'pexels',                                                   -- image_source
    'Pexels - Photographer Name',                               -- image_provider
    NULL                                                        -- cloudinary_public_id
);

-- Example 4: Add custom/direct URL
SELECT add_product_image(
    4,                                                          -- product_id
    'https://your-website.com/images/jewelry/gold-band.jpg',    -- image_url
    'Gold Band Custom Photography',                             -- alt_text
    0,                                                          -- sort_order
    true,                                                       -- is_primary
    'direct_url',                                               -- image_source
    'Custom Photography Studio',                                -- image_provider
    NULL                                                        -- cloudinary_public_id
);

-- ============================================================================
-- BULK IMAGE REPLACEMENT (for specific products)
-- ============================================================================

-- Remove all existing images for a product and add new ones
-- Step 1: Delete existing images for product (replace 1 with your product ID)
DELETE FROM public.product_images WHERE product_id = 1;

-- Step 2: Add new images for that product
SELECT add_product_image(1, 'https://new-image-url.com/main.jpg', 'Main View', 0, true, 'direct_url', 'Your Source');
SELECT add_product_image(1, 'https://new-image-url.com/side.jpg', 'Side View', 1, false, 'direct_url', 'Your Source');
SELECT add_product_image(1, 'https://new-image-url.com/detail.jpg', 'Detail View', 2, false, 'direct_url', 'Your Source');

-- ============================================================================
-- USEFUL QUERIES FOR IMAGE MANAGEMENT
-- ============================================================================

-- View all images for a specific product (replace 1 with product ID)
SELECT * FROM get_product_images(1);

-- View all images with their sources
SELECT 
    p.name as product_name,
    pi.image_url,
    pi.image_source,
    pi.image_provider,
    pi.is_primary,
    pi.alt_text
FROM public.products p
JOIN public.product_images pi ON p.id = pi.product_id
ORDER BY p.id, pi.sort_order;

-- Count images by source
SELECT 
    image_source,
    COUNT(*) as image_count
FROM public.product_images
GROUP BY image_source
ORDER BY image_count DESC;

-- Find products without images
SELECT 
    p.id,
    p.name,
    COUNT(pi.id) as image_count
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name
HAVING COUNT(pi.id) = 0;

-- ============================================================================
-- IMAGE URL FORMATS FOR DIFFERENT SOURCES
-- ============================================================================

/*
CLOUDINARY (with optimization):
https://res.cloudinary.com/your-cloud/image/upload/f_auto,q_auto,w_800,h_800,c_fill/v1/your-folder/image-name.jpg

UNSPLASH (with resizing):
https://images.unsplash.com/photo-XXXXXXXXX/image.jpg?w=800&h=800&fit=crop&crop=center

PEXELS (with resizing):
https://images.pexels.com/photos/XXXXXXX/image.jpeg?w=800&h=800&fit=crop&crop=center

DIRECT URL (your own hosting):
https://your-domain.com/images/jewelry/product-name.jpg

AI GENERATED (various platforms):
https://platform.com/generated/image-id.jpg
*/

-- ============================================================================
-- QUICK BATCH INSERT TEMPLATE
-- ============================================================================

/*
Copy and modify this template for bulk adding:

INSERT INTO public.product_images (
  product_id, image_url, alt_text, sort_order, is_primary, 
  image_source, image_provider, cloudinary_public_id
) VALUES
-- Product 1 images
(1, 'URL1', 'Alt text 1', 0, true, 'unsplash', 'Unsplash - Photographer', NULL),
(1, 'URL2', 'Alt text 2', 1, false, 'unsplash', 'Unsplash - Photographer', NULL),

-- Product 2 images  
(2, 'URL3', 'Alt text 3', 0, true, 'pexels', 'Pexels - Photographer', NULL),
(2, 'URL4', 'Alt text 4', 1, false, 'cloudinary', 'Cloudinary', 'jewelry/product2'),

-- Add more products...
(3, 'URL5', 'Alt text 5', 0, true, 'direct_url', 'Custom Source', NULL);
*/

-- ============================================================================
-- RECOMMENDED IMAGE SIZES AND FORMATS
-- ============================================================================

/*
PRIMARY IMAGES (is_primary = true):
- Minimum: 800x800px
- Recommended: 1200x1200px
- Format: JPG or WebP
- Background: White or transparent
- Show full product clearly

ADDITIONAL IMAGES:
- Detail shots: Close-ups of craftsmanship
- Worn/modeled: Show jewelry being worn
- Different angles: Side, back, profile views
- Packaging: Gift boxes, certificates

URL PARAMETERS FOR OPTIMIZATION:
- ?w=800&h=800&fit=crop (Unsplash/Pexels)
- /f_auto,q_auto,w_800,h_800,c_fill/ (Cloudinary)
- Always use HTTPS URLs
*/