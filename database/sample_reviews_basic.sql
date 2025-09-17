-- =============================================
-- SAMPLE PRODUCT REVIEWS FOR EHSAAS JEWELRY (BASIC VERSION)
-- =============================================

-- This script adds a mix of detailed reviews and star-only ratings to products
-- For each product, we'll add:
-- 1. 3-5 detailed reviews with text (ratings 4.5-5 stars)
-- 2. 20-50 star-only ratings (ratings 4.5-5 stars)

-- =============================================
-- INSTRUCTIONS:
-- 1. First, find the actual product IDs in your database:
--    SELECT id, sku, name FROM products;
--
-- 2. Find some user IDs in your database:
--    SELECT id, email FROM users LIMIT 3;
--
-- 3. Replace the placeholder IDs in this script with actual IDs from your database
-- =============================================

-- =============================================
-- DETAILED REVIEWS WITH TEXT
-- Replace PRODUCT_ID_X and USER_ID_X with actual IDs from your database
-- =============================================

-- Product 1 Detailed Reviews
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
-- Replace PRODUCT_ID_1 with actual product ID
-- Replace USER_ID_1, USER_ID_2, USER_ID_3 with actual user IDs
(PRODUCT_ID_1, USER_ID_1, 5, 'Absolutely Beautiful!', 
    'These earrings exceeded my expectations. The craftsmanship is exceptional and they are so comfortable to wear. I get compliments every time I wear them. The enamel work is intricate and the gold quality is excellent. Highly recommended!', 
    TRUE, 'approved'),
(PRODUCT_ID_1, USER_ID_2, 5, 'Perfect for Special Occasions', 
    'Bought these for my sister''s wedding and she absolutely loved them! The gold finish is beautiful and hasn''t faded at all. Very comfortable to wear for long periods.', 
    TRUE, 'approved'),
(PRODUCT_ID_1, USER_ID_3, 4.5, 'Elegant Design', 
    'Beautiful earrings with intricate design work. The gold plating is of good quality. Only giving 4.5 stars because they are slightly heavier than expected.', 
    TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000000', 5, 'Stunning Craftsmanship', 
    'These hoops are absolutely stunning! The attention to detail is remarkable. I''ve worn them to several events and everyone asks where I got them.', 
    TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000001', 5, 'Worth Every Penny', 
    'High quality and beautiful design. The enamel work is flawless. These earrings have become my signature piece.', 
    TRUE, 'approved');

-- Product 2 Detailed Reviews
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
-- Replace PRODUCT_ID_2 with actual product ID
(PRODUCT_ID_2, USER_ID_3, 4, 'Elegant and Classic', 
    'Love these pearl earrings! They are perfect for both office and evening wear. The pearls have a beautiful luster and the gold setting is well-made. Only giving 4 stars because I wish they came with a storage pouch.', 
    TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000002', 5, 'Perfect for Work', 
    'These earrings are perfect for my daily work attire. The pearls are beautiful and the gold setting complements them well. Very comfortable to wear.', 
    TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000003', 4.5, 'Beautiful Quality', 
    'The pearls have a lovely luster and the gold setting is well-crafted. Arrived quickly and well-packaged.', 
    TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000004', 5, 'Timeless Elegance', 
    'These earrings never go out of style. I wear them with everything from casual outfits to formal dresses. The quality is excellent.', 
    TRUE, 'approved');

-- Product 3 Detailed Reviews
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
-- Replace PRODUCT_ID_3 with actual product ID
(PRODUCT_ID_3, USER_ID_2, 5, 'Perfect for Special Occasions', 
    'Bought this for my wife''s birthday and she absolutely loves it! The diamonds are brilliant and the setting is gorgeous. It''s definitely a statement piece that gets noticed. Worth every penny!', 
    TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000005', 5, 'Absolutely Stunning', 
    'This necklace is breathtaking! The diamonds sparkle beautifully and the craftsmanship is exceptional. Received many compliments when I wore it to a party.', 
    TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000006', 4.5, 'Beautiful but Pricey', 
    'The necklace is beautiful and the diamonds are of high quality. The price is on the higher side but considering the quality, it''s worth it.', 
    TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000007', 5, 'Perfect Gift', 
    'Bought this for my anniversary and my wife was thrilled. The packaging was elegant and the necklace itself is even more beautiful in person.', 
    TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000008', 5, 'Exquisite Craftsmanship', 
    'The attention to detail in this necklace is remarkable. Each diamond is perfectly set and the overall design is elegant.', 
    TRUE, 'approved');

-- =============================================
-- STAR-ONLY RATINGS (20-50 per product)
-- Replace PRODUCT_ID_X with actual product IDs
-- =============================================

-- Product 1 Star-only Ratings (20 ratings)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status) VALUES
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000010', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000011', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000012', 4.5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000013', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000014', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000015', 4.5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000016', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000017', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000018', 4.5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000019', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000020', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000021', 4.5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000022', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000023', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000024', 4.5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000025', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000026', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000027', 4.5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000028', 5, TRUE, 'approved'),
(PRODUCT_ID_1, '00000000-0000-0000-0000-000000000029', 5, TRUE, 'approved');

-- Product 2 Star-only Ratings (25 ratings)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status) VALUES
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000030', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000031', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000032', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000033', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000034', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000035', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000036', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000037', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000038', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000039', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000040', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000041', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000042', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000043', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000044', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000045', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000046', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000047', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000048', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000049', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000050', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000051', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000052', 4.5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000053', 5, TRUE, 'approved'),
(PRODUCT_ID_2, '00000000-0000-0000-0000-000000000054', 5, TRUE, 'approved');

-- Product 3 Star-only Ratings (30 ratings)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status) VALUES
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000060', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000061', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000062', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000063', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000064', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000065', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000066', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000067', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000068', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000069', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000070', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000071', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000072', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000073', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000074', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000075', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000076', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000077', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000078', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000079', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000080', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000081', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000082', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000083', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000084', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000085', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000086', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000087', 5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000088', 4.5, TRUE, 'approved'),
(PRODUCT_ID_3, '00000000-0000-0000-0000-000000000089', 5, TRUE, 'approved');

-- =============================================
-- TOTAL REVIEWS ADDED:
-- Product 1: 5 detailed + 20 star-only = 25 reviews
-- Product 2: 4 detailed + 25 star-only = 29 reviews
-- Product 3: 5 detailed + 30 star-only = 35 reviews
-- TOTAL: 14 detailed + 75 star-only = 89 reviews
-- =============================================

-- Instructions:
-- 1. Find actual product IDs in your database:
--    SELECT id, sku, name FROM products;
--
-- 2. Find some user IDs in your database:
--    SELECT id, email FROM users LIMIT 10;
--
-- 3. Replace PRODUCT_ID_1, PRODUCT_ID_2, PRODUCT_ID_3 with actual product IDs
-- 4. Replace USER_ID_1, USER_ID_2, USER_ID_3 with actual user IDs
-- 5. Replace all other placeholder UUIDs with actual UUIDs or use gen_random_uuid() if available