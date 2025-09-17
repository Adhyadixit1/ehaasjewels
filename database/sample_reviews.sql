-- =============================================
-- SAMPLE PRODUCT REVIEWS FOR EHSAAS JEWELRY
-- =============================================

-- This script adds a mix of detailed reviews and star-only ratings to products
-- For each product, we'll add:
-- 1. 3-5 detailed reviews with text (ratings 4.5-5 stars)
-- 2. 100-200 star-only ratings (ratings 4.5-5 stars)

-- First, let's get the product IDs we want to add reviews to
-- Heritage Gold Hoops (EH-EAR-001)
DO $$
DECLARE
    prod_heritage_hoops BIGINT;
    prod_pearl_drops BIGINT;
    prod_diamond_neck BIGINT;
    prod_gold_chain BIGINT;
    prod_solitaire BIGINT;
    prod_bridal_set BIGINT;
    user_priya UUID;
    user_arjun UUID;
    user_kavya UUID;
BEGIN
    SELECT id INTO prod_heritage_hoops FROM products WHERE sku = 'EH-EAR-001' LIMIT 1;
    SELECT id INTO prod_pearl_drops FROM products WHERE sku = 'EH-EAR-002' LIMIT 1;
    SELECT id INTO prod_diamond_neck FROM products WHERE sku = 'EH-NECK-001' LIMIT 1;
    SELECT id INTO prod_gold_chain FROM products WHERE sku = 'EH-NECK-002' LIMIT 1;
    SELECT id INTO prod_solitaire FROM products WHERE sku = 'EH-RING-001' LIMIT 1;
    SELECT id INTO prod_bridal_set FROM products WHERE sku = 'EH-BRIDAL-001' LIMIT 1;

    -- Get user IDs for detailed reviews
    SELECT id INTO user_priya FROM users WHERE email = 'priya.sharma@email.com' LIMIT 1;
    SELECT id INTO user_arjun FROM users WHERE email = 'arjun.mehta@email.com' LIMIT 1;
    SELECT id INTO user_kavya FROM users WHERE email = 'kavya.singh@email.com' LIMIT 1;

    -- =============================================
    -- DETAILED REVIEWS WITH TEXT (3-5 per product)
    -- =============================================

    -- Heritage Gold Hoops Detailed Reviews
    INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
    (prod_heritage_hoops, user_priya, 5, 'Absolutely Beautiful!', 
        'These earrings exceeded my expectations. The craftsmanship is exceptional and they are so comfortable to wear. I get compliments every time I wear them. The enamel work is intricate and the gold quality is excellent. Highly recommended!', 
        TRUE, 'approved'),
    (prod_heritage_hoops, user_arjun, 5, 'Perfect for Special Occasions', 
        'Bought these for my sister''s wedding and she absolutely loved them! The gold finish is beautiful and hasn''t faded at all. Very comfortable to wear for long periods.', 
        TRUE, 'approved'),
    (prod_heritage_hoops, user_kavya, 4.5, 'Elegant Design', 
        'Beautiful earrings with intricate design work. The gold plating is of good quality. Only giving 4.5 stars because they are slightly heavier than expected.', 
        TRUE, 'approved'),
    (prod_heritage_hoops, gen_random_uuid(), 5, 'Stunning Craftsmanship', 
        'These hoops are absolutely stunning! The attention to detail is remarkable. I''ve worn them to several events and everyone asks where I got them.', 
        TRUE, 'approved'),
    (prod_heritage_hoops, gen_random_uuid(), 5, 'Worth Every Penny', 
        'High quality and beautiful design. The enamel work is flawless. These earrings have become my signature piece.', 
        TRUE, 'approved');

    -- Pearl Drop Elegance Detailed Reviews
    INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
    (prod_pearl_drops, user_kavya, 4, 'Elegant and Classic', 
        'Love these pearl earrings! They are perfect for both office and evening wear. The pearls have a beautiful luster and the gold setting is well-made. Only giving 4 stars because I wish they came with a storage pouch.', 
        TRUE, 'approved'),
    (prod_pearl_drops, gen_random_uuid(), 5, 'Perfect for Work', 
        'These earrings are perfect for my daily work attire. The pearls are beautiful and the gold setting complements them well. Very comfortable to wear.', 
        TRUE, 'approved'),
    (prod_pearl_drops, gen_random_uuid(), 4.5, 'Beautiful Quality', 
        'The pearls have a lovely luster and the gold setting is well-crafted. Arrived quickly and well-packaged.', 
        TRUE, 'approved'),
    (prod_pearl_drops, gen_random_uuid(), 5, 'Timeless Elegance', 
        'These earrings never go out of style. I wear them with everything from casual outfits to formal dresses. The quality is excellent.', 
        TRUE, 'approved');

    -- Diamond Elegance Necklace Detailed Reviews
    INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
    (prod_diamond_neck, user_arjun, 5, 'Perfect for Special Occasions', 
        'Bought this for my wife''s birthday and she absolutely loves it! The diamonds are brilliant and the setting is gorgeous. It''s definitely a statement piece that gets noticed. Worth every penny!', 
        TRUE, 'approved'),
    (prod_diamond_neck, gen_random_uuid(), 5, 'Absolutely Stunning', 
        'This necklace is breathtaking! The diamonds sparkle beautifully and the craftsmanship is exceptional. Received many compliments when I wore it to a party.', 
        TRUE, 'approved'),
    (prod_diamond_neck, gen_random_uuid(), 4.5, 'Beautiful but Pricey', 
        'The necklace is beautiful and the diamonds are of high quality. The price is on the higher side but considering the quality, it''s worth it.', 
        TRUE, 'approved'),
    (prod_diamond_neck, gen_random_uuid(), 5, 'Perfect Gift', 
        'Bought this for my anniversary and my wife was thrilled. The packaging was elegant and the necklace itself is even more beautiful in person.', 
        TRUE, 'approved'),
    (prod_diamond_neck, gen_random_uuid(), 5, 'Exquisite Craftsmanship', 
        'The attention to detail in this necklace is remarkable. Each diamond is perfectly set and the overall design is elegant.', 
        TRUE, 'approved');

    -- Gold Chain Delicate Detailed Reviews
    INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
    (prod_gold_chain, gen_random_uuid(), 4.5, 'Delicate and Beautiful', 
        'This chain is delicate and beautiful. The gold quality is good and it looks elegant with pendants.', 
        TRUE, 'approved'),
    (prod_gold_chain, gen_random_uuid(), 5, 'Perfect Everyday Chain', 
        'I wear this chain every day and it looks great with different pendants. The gold hasn''t faded and the chain is sturdy.', 
        TRUE, 'approved'),
    (prod_gold_chain, gen_random_uuid(), 4, 'Good Quality', 
        'The chain is of good quality but slightly thinner than I expected. Overall, happy with the purchase.', 
        TRUE, 'approved');

    -- Solitaire Dream Ring Detailed Reviews
    INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
    (prod_solitaire, gen_random_uuid(), 5, 'Dream Ring', 
        'This ring is absolutely beautiful! The diamond is stunning and the setting is perfect. Exactly what I wanted for my engagement.', 
        TRUE, 'approved'),
    (prod_solitaire, gen_random_uuid(), 5, 'Perfect Brilliance', 
        'The diamond in this ring has exceptional brilliance. The setting is elegant and secure. Highly recommend!', 
        TRUE, 'approved'),
    (prod_solitaire, gen_random_uuid(), 4.5, 'Beautiful but Expensive', 
        'The ring is beautiful and the diamond quality is excellent. The price is high but justified by the quality.', 
        TRUE, 'approved'),
    (prod_solitaire, gen_random_uuid(), 5, 'Exquisite Craftsmanship', 
        'The craftsmanship on this ring is exceptional. The diamond is perfectly set and the band is comfortable to wear.', 
        TRUE, 'approved'),
    (prod_solitaire, gen_random_uuid(), 5, 'Wife Loves It', 
        'Bought this as an engagement ring and my fiancée loves it. The diamond is flawless and the setting is beautiful.', 
        TRUE, 'approved');

    -- Royal Bridal Set Detailed Reviews
    INSERT INTO product_reviews (product_id, user_id, rating, review_title, review_text, is_verified_purchase, status) VALUES
    (prod_bridal_set, user_kavya, 5, 'Dream Bridal Set', 
        'This bridal set is everything I dreamed of for my wedding day. The quality is outstanding and it photographs beautifully. The customer service was excellent and they helped me choose the perfect pieces. Thank you Ehsaas!', 
        TRUE, 'approved'),
    (prod_bridal_set, gen_random_uuid(), 5, 'Royal Treatment', 
        'This set made me feel like royalty on my wedding day. The gold work is intricate and the stones are beautiful. Worth every penny!', 
        TRUE, 'approved'),
    (prod_bridal_set, gen_random_uuid(), 5, 'Perfect for Bridal', 
        'Absolutely perfect for my wedding. The set is heavy but comfortable to wear. The craftsmanship is exceptional.', 
        TRUE, 'approved'),
    (prod_bridal_set, gen_random_uuid(), 4.5, 'Beautiful Set', 
        'The bridal set is beautiful and the quality is excellent. Only giving 4.5 stars because the delivery was slightly delayed.', 
        TRUE, 'approved'),
    (prod_bridal_set, gen_random_uuid(), 5, 'Worth the Investment', 
        'This bridal set is an investment that I will treasure forever. The quality is outstanding and it looks even better in person.', 
        TRUE, 'approved');

    -- =============================================
    -- STAR-ONLY RATINGS (100-200 per product)
    -- Note: For star-only ratings, we'll still insert review_title as NULL
    -- =============================================

    -- For Heritage Gold Hoops - 150 star-only ratings
    INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
    SELECT 
        prod_heritage_hoops,
        gen_random_uuid(),
        CASE 
            WHEN random() < 0.7 THEN 5
            ELSE 4.5
        END,
        TRUE,
        'approved'
    FROM generate_series(1, 150);

    -- For Pearl Drop Elegance - 120 star-only ratings
    INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
    SELECT 
        prod_pearl_drops,
        gen_random_uuid(),
        CASE 
            WHEN random() < 0.6 THEN 5
            ELSE 4.5
        END,
        TRUE,
        'approved'
    FROM generate_series(1, 120);

    -- For Diamond Elegance Necklace - 180 star-only ratings
    INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
    SELECT 
        prod_diamond_neck,
        gen_random_uuid(),
        CASE 
            WHEN random() < 0.8 THEN 5
            ELSE 4.5
        END,
        TRUE,
        'approved'
    FROM generate_series(1, 180);

    -- For Gold Chain Delicate - 100 star-only ratings
    INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
    SELECT 
        prod_gold_chain,
        gen_random_uuid(),
        CASE 
            WHEN random() < 0.65 THEN 5
            ELSE 4.5
        END,
        TRUE,
        'approved'
    FROM generate_series(1, 100);

    -- For Solitaire Dream Ring - 200 star-only ratings
    INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
    SELECT 
        prod_solitaire,
        gen_random_uuid(),
        CASE 
            WHEN random() < 0.85 THEN 5
            ELSE 4.5
        END,
        TRUE,
        'approved'
    FROM generate_series(1, 200);

    -- For Royal Bridal Set - 160 star-only ratings
    INSERT INTO product_reviews (product_id, user_id, rating, is_verified_purchase, status)
    SELECT 
        prod_bridal_set,
        gen_random_uuid(),
        CASE 
            WHEN random() < 0.75 THEN 5
            ELSE 4.5
        END,
        TRUE,
        'approved'
    FROM generate_series(1, 160);

END $$;

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

-- Verify the review counts
-- SELECT product_id, COUNT(*) as review_count FROM product_reviews GROUP BY product_id;