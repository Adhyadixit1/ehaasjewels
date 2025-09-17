-- =============================================
-- SAMPLE PRODUCT REVIEWS FOR EHSAAS JEWELRY (SIMPLE VERSION)
-- =============================================

-- This script adds a mix of detailed reviews and star-only ratings to products
-- For each product, we'll add:
-- 1. 3-5 detailed reviews with text (ratings 4.5-5 stars)
-- 2. 100-200 star-only ratings (ratings 4.5-5 stars)

-- First, we'll need to manually get the product IDs and user IDs
-- You can get these by running:
-- SELECT id, sku, name FROM products;
-- SELECT id, email FROM users;

-- For this example, I'll use placeholder values that you'll need to replace with actual IDs from your database
-- Replace these with actual IDs from your database:
-- Heritage Gold Hoops (EH-EAR-001) - Product ID: 1
-- Pearl Drop Elegance (EH-EAR-002) - Product ID: 2
-- Diamond Elegance Necklace (EH-NECK-001) - Product ID: 3
-- Gold Chain Delicate (EH-NECK-002) - Product ID: 4
-- Solitaire Dream Ring (EH-RING-001) - Product ID: 5
-- Royal Bridal Set (EH-BRIDAL-001) - Product ID: 6

-- Sample User IDs:
-- priya.sharma@email.com - User ID: '123e4567-e89b-12d3-a456-426614174000'
-- arjun.mehta@email.com - User ID: '123e4567-e89b-12d3-a456-426614174001'
-- kavya.singh@email.com - User ID: '123e4567-e89b-12d3-a456-426614174002'

-- =============================================
-- DETAILED REVIEWS WITH TEXT (3-5 per product)
-- =============================================

-- Heritage Gold Hoops Detailed Reviews (Product ID: 1)
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
(1, '123e4567-e89b-12d3-a456-426614174000', 5, 'Absolutely Beautiful!', 
    'These earrings exceeded my expectations. The craftsmanship is exceptional and they are so comfortable to wear. I get compliments every time I wear them. The enamel work is intricate and the gold quality is excellent. Highly recommended!', 
    TRUE, 'approved'),
(1, '123e4567-e89b-12d3-a456-426614174001', 5, 'Perfect for Special Occasions', 
    'Bought these for my sister''s wedding and she absolutely loved them! The gold finish is beautiful and hasn''t faded at all. Very comfortable to wear for long periods.', 
    TRUE, 'approved'),
(1, '123e4567-e89b-12d3-a456-426614174002', 4.5, 'Elegant Design', 
    'Beautiful earrings with intricate design work. The gold plating is of good quality. Only giving 4.5 stars because they are slightly heavier than expected.', 
    TRUE, 'approved'),
(1, gen_random_uuid(), 5, 'Stunning Craftsmanship', 
    'These hoops are absolutely stunning! The attention to detail is remarkable. I''ve worn them to several events and everyone asks where I got them.', 
    TRUE, 'approved'),
(1, gen_random_uuid(), 5, 'Worth Every Penny', 
    'High quality and beautiful design. The enamel work is flawless. These earrings have become my signature piece.', 
    TRUE, 'approved');

-- Pearl Drop Elegance Detailed Reviews (Product ID: 2)
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
(2, '123e4567-e89b-12d3-a456-426614174002', 4, 'Elegant and Classic', 
    'Love these pearl earrings! They are perfect for both office and evening wear. The pearls have a beautiful luster and the gold setting is well-made. Only giving 4 stars because I wish they came with a storage pouch.', 
    TRUE, 'approved'),
(2, gen_random_uuid(), 5, 'Perfect for Work', 
    'These earrings are perfect for my daily work attire. The pearls are beautiful and the gold setting complements them well. Very comfortable to wear.', 
    TRUE, 'approved'),
(2, gen_random_uuid(), 4.5, 'Beautiful Quality', 
    'The pearls have a lovely luster and the gold setting is well-crafted. Arrived quickly and well-packaged.', 
    TRUE, 'approved'),
(2, gen_random_uuid(), 5, 'Timeless Elegance', 
    'These earrings never go out of style. I wear them with everything from casual outfits to formal dresses. The quality is excellent.', 
    TRUE, 'approved');

-- Diamond Elegance Necklace Detailed Reviews (Product ID: 3)
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
(3, '123e4567-e89b-12d3-a456-426614174001', 5, 'Perfect for Special Occasions', 
    'Bought this for my wife''s birthday and she absolutely loves it! The diamonds are brilliant and the setting is gorgeous. It''s definitely a statement piece that gets noticed. Worth every penny!', 
    TRUE, 'approved'),
(3, gen_random_uuid(), 5, 'Absolutely Stunning', 
    'This necklace is breathtaking! The diamonds sparkle beautifully and the craftsmanship is exceptional. Received many compliments when I wore it to a party.', 
    TRUE, 'approved'),
(3, gen_random_uuid(), 4.5, 'Beautiful but Pricey', 
    'The necklace is beautiful and the diamonds are of high quality. The price is on the higher side but considering the quality, it''s worth it.', 
    TRUE, 'approved'),
(3, gen_random_uuid(), 5, 'Perfect Gift', 
    'Bought this for my anniversary and my wife was thrilled. The packaging was elegant and the necklace itself is even more beautiful in person.', 
    TRUE, 'approved'),
(3, gen_random_uuid(), 5, 'Exquisite Craftsmanship', 
    'The attention to detail in this necklace is remarkable. Each diamond is perfectly set and the overall design is elegant.', 
    TRUE, 'approved');

-- Gold Chain Delicate Detailed Reviews (Product ID: 4)
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
(4, gen_random_uuid(), 4.5, 'Delicate and Beautiful', 
    'This chain is delicate and beautiful. The gold quality is good and it looks elegant with pendants.', 
    TRUE, 'approved'),
(4, gen_random_uuid(), 5, 'Perfect Everyday Chain', 
    'I wear this chain every day and it looks great with different pendants. The gold hasn''t faded and the chain is sturdy.', 
    TRUE, 'approved'),
(4, gen_random_uuid(), 4, 'Good Quality', 
    'The chain is of good quality but slightly thinner than I expected. Overall, happy with the purchase.', 
    TRUE, 'approved');

-- Solitaire Dream Ring Detailed Reviews (Product ID: 5)
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
(5, gen_random_uuid(), 5, 'Dream Ring', 
    'This ring is absolutely beautiful! The diamond is stunning and the setting is perfect. Exactly what I wanted for my engagement.', 
    TRUE, 'approved'),
(5, gen_random_uuid(), 5, 'Perfect Brilliance', 
    'The diamond in this ring has exceptional brilliance. The setting is elegant and secure. Highly recommend!', 
    TRUE, 'approved'),
(5, gen_random_uuid(), 4.5, 'Beautiful but Expensive', 
    'The ring is beautiful and the diamond quality is excellent. The price is high but justified by the quality.', 
    TRUE, 'approved'),
(5, gen_random_uuid(), 5, 'Exquisite Craftsmanship', 
    'The craftsmanship on this ring is exceptional. The diamond is perfectly set and the band is comfortable to wear.', 
    TRUE, 'approved'),
(5, gen_random_uuid(), 5, 'Wife Loves It', 
    'Bought this as an engagement ring and my fiancée loves it. The diamond is flawless and the setting is beautiful.', 
    TRUE, 'approved');

-- Royal Bridal Set Detailed Reviews (Product ID: 6)
INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
(6, '123e4567-e89b-12d3-a456-426614174002', 5, 'Dream Bridal Set', 
    'This bridal set is everything I dreamed of for my wedding day. The quality is outstanding and it photographs beautifully. The customer service was excellent and they helped me choose the perfect pieces. Thank you Ehsaas!', 
    TRUE, 'approved'),
(6, gen_random_uuid(), 5, 'Royal Treatment', 
    'This set made me feel like royalty on my wedding day. The gold work is intricate and the stones are beautiful. Worth every penny!', 
    TRUE, 'approved'),
(6, gen_random_uuid(), 5, 'Perfect for Bridal', 
    'Absolutely perfect for my wedding. The set is heavy but comfortable to wear. The craftsmanship is exceptional.', 
    TRUE, 'approved'),
(6, gen_random_uuid(), 4.5, 'Beautiful Set', 
    'The bridal set is beautiful and the quality is excellent. Only giving 4.5 stars because the delivery was slightly delayed.', 
    TRUE, 'approved'),
(6, gen_random_uuid(), 5, 'Worth the Investment', 
    'This bridal set is an investment that I will treasure forever. The quality is outstanding and it looks even better in person.', 
    TRUE, 'approved');

-- =============================================
-- STAR-ONLY RATINGS (100-200 per product)
-- Note: For star-only ratings, we'll still insert review_title as NULL
-- =============================================

-- For Heritage Gold Hoops - 150 star-only ratings (Product ID: 1)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
SELECT 
    1,
    gen_random_uuid(),
    CASE 
        WHEN random() < 0.7 THEN 5
        ELSE 4.5
    END,
    TRUE,
    'approved'
FROM generate_series(1, 150);

-- For Pearl Drop Elegance - 120 star-only ratings (Product ID: 2)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
SELECT 
    2,
    gen_random_uuid(),
    CASE 
        WHEN random() < 0.6 THEN 5
        ELSE 4.5
    END,
    TRUE,
    'approved'
FROM generate_series(1, 120);

-- For Diamond Elegance Necklace - 180 star-only ratings (Product ID: 3)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
SELECT 
    3,
    gen_random_uuid(),
    CASE 
        WHEN random() < 0.8 THEN 5
        ELSE 4.5
    END,
    TRUE,
    'approved'
FROM generate_series(1, 180);

-- For Gold Chain Delicate - 100 star-only ratings (Product ID: 4)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
SELECT 
    4,
    gen_random_uuid(),
    CASE 
        WHEN random() < 0.65 THEN 5
        ELSE 4.5
    END,
    TRUE,
    'approved'
FROM generate_series(1, 100);

-- For Solitaire Dream Ring - 200 star-only ratings (Product ID: 5)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
SELECT 
    5,
    gen_random_uuid(),
    CASE 
        WHEN random() < 0.85 THEN 5
        ELSE 4.5
    END,
    TRUE,
    'approved'
FROM generate_series(1, 200);

-- For Royal Bridal Set - 160 star-only ratings (Product ID: 6)
INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
SELECT 
    6,
    gen_random_uuid(),
    CASE 
        WHEN random() < 0.75 THEN 5
        ELSE 4.5
    END,
    TRUE,
    'approved'
FROM generate_series(1, 160);

-- =============================================
-- TOTAL REVIEWS ADDED:
-- Heritage Gold Hoops: 5 detailed + 150 star-only = 155 reviews
-- Pearl Drop Elegance: 4 detailed + 120 star-only = 124 reviews
-- Diamond Elegance Necklace: 5 detailed + 180 star-only = 185 reviews
-- Gold Chain Delicate: 3 detailed + 100 star-only = 103 reviews
-- Solitaire Dream Ring: 5 detailed + 200 star-only = 205 reviews
-- Royal Bridal Set: 5 detailed + 160 star-only = 165 reviews
-- TOTAL: 32 detailed + 910 star-only = 942 reviews
-- =============================================

-- Instructions:
-- 1. Replace the placeholder product IDs (1, 2, 3, 4, 5, 6) with actual product IDs from your database
-- 2. Replace the placeholder user IDs with actual user IDs from your database
-- 3. Run this script in your PostgreSQL database