-- ============================================================================
-- UPDATE PRODUCT IMAGES WITH ACTUAL CLOUDINARY URLS
-- ============================================================================
-- Instructions:
-- 1. Upload your jewelry images to Cloudinary
-- 2. Replace the placeholder URLs below with your actual Cloudinary URLs
-- 3. Run this script in Supabase SQL Editor

-- ============================================================================
-- STEP 1: DELETE EXISTING PLACEHOLDER IMAGES
-- ============================================================================
DELETE FROM public.product_images WHERE cloudinary_public_id LIKE 'jewelry/%';

-- ============================================================================
-- STEP 2: INSERT ACTUAL IMAGES
-- ============================================================================
-- Replace 'YOUR_CLOUDINARY_CLOUD_NAME' with your actual cloud name
-- Replace the image URLs with your actual uploaded image URLs

-- RINGS
INSERT INTO public.product_images (product_id, image_url, cloudinary_public_id, alt_text, sort_order, is_primary) VALUES
-- Ring 1: Eternal Love Diamond Ring
(1, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/eternal-love-diamond-ring-main.jpg', 'jewelry/rings/eternal-love-diamond-ring-main', 'Eternal Love Diamond Ring Main View', 0, true),
(1, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/eternal-love-diamond-ring-side.jpg', 'jewelry/rings/eternal-love-diamond-ring-side', 'Eternal Love Diamond Ring Side View', 1, false),
(1, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/eternal-love-diamond-ring-detail.jpg', 'jewelry/rings/eternal-love-diamond-ring-detail', 'Eternal Love Diamond Ring Detail View', 2, false),

-- Ring 2: Royal Ruby Vintage Ring
(2, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/royal-ruby-vintage-ring-main.jpg', 'jewelry/rings/royal-ruby-vintage-ring-main', 'Royal Ruby Vintage Ring Main View', 0, true),
(2, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/royal-ruby-vintage-ring-angle.jpg', 'jewelry/rings/royal-ruby-vintage-ring-angle', 'Royal Ruby Vintage Ring Angle View', 1, false),

-- Ring 3: Emerald Garden Ring
(3, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/emerald-garden-ring-main.jpg', 'jewelry/rings/emerald-garden-ring-main', 'Emerald Garden Ring Main View', 0, true),
(3, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/emerald-garden-ring-detail.jpg', 'jewelry/rings/emerald-garden-ring-detail', 'Emerald Garden Ring Detail View', 1, false),

-- Ring 4: Classic Gold Band
(4, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/classic-gold-band-main.jpg', 'jewelry/rings/classic-gold-band-main', 'Classic Gold Band Main View', 0, true),

-- Ring 5: Intricate Floral Ring
(5, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/rings/intricate-floral-ring-main.jpg', 'jewelry/rings/intricate-floral-ring-main', 'Intricate Floral Ring Main View', 0, true),

-- NECKLACES
-- Necklace 1: Royal Diamond Necklace Set (product_id should match your inserted product)
(6, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/royal-diamond-necklace-set-main.jpg', 'jewelry/necklaces/royal-diamond-necklace-set-main', 'Royal Diamond Necklace Set Main View', 0, true),
(6, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/royal-diamond-necklace-set-worn.jpg', 'jewelry/necklaces/royal-diamond-necklace-set-worn', 'Royal Diamond Necklace Set Worn View', 1, false),
(6, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/royal-diamond-necklace-earrings.jpg', 'jewelry/necklaces/royal-diamond-necklace-earrings', 'Royal Diamond Necklace Set Earrings', 2, false),

-- Necklace 2: Pearl Drop Necklace
(7, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/pearl-drop-necklace-main.jpg', 'jewelry/necklaces/pearl-drop-necklace-main', 'Pearl Drop Necklace Main View', 0, true),
(7, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/pearl-drop-necklace-detail.jpg', 'jewelry/necklaces/pearl-drop-necklace-detail', 'Pearl Drop Necklace Detail View', 1, false),

-- Necklace 3: Kundan Choker Necklace
(8, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/kundan-choker-necklace-main.jpg', 'jewelry/necklaces/kundan-choker-necklace-main', 'Kundan Choker Necklace Main View', 0, true),
(8, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/kundan-choker-necklace-worn.jpg', 'jewelry/necklaces/kundan-choker-necklace-worn', 'Kundan Choker Necklace Worn View', 1, false),

-- Necklace 4: Temple Jewelry Chain
(9, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/necklaces/temple-jewelry-chain-main.jpg', 'jewelry/necklaces/temple-jewelry-chain-main', 'Temple Jewelry Chain Main View', 0, true),

-- EARRINGS
-- Earrings 1: Diamond Stud Earrings
(10, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/earrings/diamond-stud-earrings-main.jpg', 'jewelry/earrings/diamond-stud-earrings-main', 'Diamond Stud Earrings Main View', 0, true),
(10, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/earrings/diamond-stud-earrings-worn.jpg', 'jewelry/earrings/diamond-stud-earrings-worn', 'Diamond Stud Earrings Worn View', 1, false),

-- Earrings 2: Chandelier Diamond Earrings
(11, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/earrings/chandelier-diamond-earrings-main.jpg', 'jewelry/earrings/chandelier-diamond-earrings-main', 'Chandelier Diamond Earrings Main View', 0, true),
(11, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/earrings/chandelier-diamond-earrings-detail.jpg', 'jewelry/earrings/chandelier-diamond-earrings-detail', 'Chandelier Diamond Earrings Detail View', 1, false),

-- Earrings 3: Traditional Jhumka Earrings
(12, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/earrings/traditional-jhumka-earrings-main.jpg', 'jewelry/earrings/traditional-jhumka-earrings-main', 'Traditional Jhumka Earrings Main View', 0, true),

-- Earrings 4: Gold Hoop Earrings
(13, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/earrings/gold-hoop-earrings-main.jpg', 'jewelry/earrings/gold-hoop-earrings-main', 'Gold Hoop Earrings Main View', 0, true),

-- BRACELETS
-- Bracelet 1: Tennis Diamond Bracelet
(14, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/bracelets/tennis-diamond-bracelet-main.jpg', 'jewelry/bracelets/tennis-diamond-bracelet-main', 'Tennis Diamond Bracelet Main View', 0, true),
(14, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/bracelets/tennis-diamond-bracelet-worn.jpg', 'jewelry/bracelets/tennis-diamond-bracelet-worn', 'Tennis Diamond Bracelet Worn View', 1, false),

-- Bracelet 2: Gold Charm Bracelet
(15, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/bracelets/gold-charm-bracelet-main.jpg', 'jewelry/bracelets/gold-charm-bracelet-main', 'Gold Charm Bracelet Main View', 0, true),

-- Bracelet 3: Traditional Kada Bangle Set
(16, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/bracelets/traditional-kada-bangle-set-main.jpg', 'jewelry/bracelets/traditional-kada-bangle-set-main', 'Traditional Kada Bangle Set Main View', 0, true),

-- PENDANTS
-- Pendant 1: Solitaire Diamond Pendant
(17, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/pendants/solitaire-diamond-pendant-main.jpg', 'jewelry/pendants/solitaire-diamond-pendant-main', 'Solitaire Diamond Pendant Main View', 0, true),
(17, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/pendants/solitaire-diamond-pendant-worn.jpg', 'jewelry/pendants/solitaire-diamond-pendant-worn', 'Solitaire Diamond Pendant Worn View', 1, false),

-- Pendant 2: Om Symbol Pendant
(18, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/pendants/gold-om-symbol-pendant-main.jpg', 'jewelry/pendants/gold-om-symbol-pendant-main', 'Om Symbol Pendant Main View', 0, true),

-- Pendant 3: Lord Ganesha Pendant
(19, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/pendants/lord-ganesha-pendant-main.jpg', 'jewelry/pendants/lord-ganesha-pendant-main', 'Lord Ganesha Pendant Main View', 0, true),

-- JEWELRY SETS
-- Set 1: Complete Bridal Diamond Set
(20, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/complete-bridal-diamond-set-main.jpg', 'jewelry/sets/complete-bridal-diamond-set-main', 'Complete Bridal Diamond Set Main View', 0, true),
(20, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/complete-bridal-diamond-set-detailed.jpg', 'jewelry/sets/complete-bridal-diamond-set-detailed', 'Complete Bridal Diamond Set Detailed View', 1, false),
(20, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/complete-bridal-diamond-set-worn.jpg', 'jewelry/sets/complete-bridal-diamond-set-worn', 'Complete Bridal Diamond Set Worn View', 2, false),

-- Set 2: Kundan Bridal Jewelry Set
(21, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/kundan-bridal-jewelry-set-main.jpg', 'jewelry/sets/kundan-bridal-jewelry-set-main', 'Kundan Bridal Jewelry Set Main View', 0, true),
(21, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/kundan-bridal-jewelry-set-individual.jpg', 'jewelry/sets/kundan-bridal-jewelry-set-individual', 'Kundan Bridal Jewelry Set Individual Pieces', 1, false),

-- Set 3: Office Wear Gold Jewelry Set
(22, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/office-wear-gold-jewelry-set-main.jpg', 'jewelry/sets/office-wear-gold-jewelry-set-main', 'Office Wear Gold Jewelry Set Main View', 0, true),

-- Set 4: Party Wear Jewelry Set
(23, 'https://res.cloudinary.com/YOUR_CLOUDINARY_CLOUD_NAME/image/upload/v1/jewelry/sets/party-wear-jewelry-set-main.jpg', 'jewelry/sets/party-wear-jewelry-set-main', 'Party Wear Jewelry Set Main View', 0, true);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify all images were inserted correctly
SELECT 
    p.name as product_name,
    pi.image_url,
    pi.is_primary,
    pi.alt_text
FROM public.products p
JOIN public.product_images pi ON p.id = pi.product_id
ORDER BY p.id, pi.sort_order;

-- ============================================================================
-- INSTRUCTIONS FOR COMPLETION
-- ============================================================================
/*
TO COMPLETE THE IMAGE SETUP:

1. UPLOAD IMAGES TO CLOUDINARY:
   - Create folders: jewelry/rings, jewelry/necklaces, jewelry/earrings, jewelry/bracelets, jewelry/pendants, jewelry/sets
   - Upload high-quality jewelry images
   - Use descriptive filenames like "eternal-love-diamond-ring-main.jpg"

2. GET YOUR CLOUDINARY CLOUD NAME:
   - Go to your Cloudinary dashboard
   - Copy your cloud name from the Account Details

3. UPDATE THIS FILE:
   - Replace 'YOUR_CLOUDINARY_CLOUD_NAME' with your actual cloud name
   - Replace the image paths with your actual uploaded image paths

4. RUN THIS SCRIPT:
   - Execute this SQL in your Supabase SQL Editor
   - Verify using the verification query at the bottom

5. TEST IN YOUR APP:
   - Check that product images display correctly
   - Verify both main and additional images show properly
*/