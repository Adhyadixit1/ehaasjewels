-- ============================================================================
-- UPDATE ALL PRODUCTS TO BE FEATURED
-- ============================================================================
-- This ensures we have enough products for dynamic feed posts and stories

-- Set all products as featured to populate the feed and stories
UPDATE public.products 
SET featured = true 
WHERE is_active = true;

-- Verify the update
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_products,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
FROM public.products;

-- Show which products are now featured
SELECT 
    id,
    name,
    price,
    featured,
    is_active,
    category_id
FROM public.products 
WHERE is_active = true
ORDER BY category_id, id;