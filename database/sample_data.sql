-- =============================================
-- SAMPLE DATA FOR EHSAAS JEWELRY DATABASE
-- =============================================

USE ehsaas_jewelry;

-- =============================================
-- 1. SAMPLE CATEGORIES
-- =============================================

-- Get category IDs for reference
SET @cat_earrings = (SELECT id FROM categories WHERE slug = 'earrings' LIMIT 1);
SET @cat_necklaces = (SELECT id FROM categories WHERE slug = 'necklaces' LIMIT 1);
SET @cat_rings = (SELECT id FROM categories WHERE slug = 'rings' LIMIT 1);
SET @cat_bracelets = (SELECT id FROM categories WHERE slug = 'bracelets' LIMIT 1);
SET @cat_bridal = (SELECT id FROM categories WHERE slug = 'bridal' LIMIT 1);

-- =============================================
-- 2. SAMPLE PRODUCTS
-- =============================================

INSERT INTO products (
    id, sku, name, slug, short_description, long_description, 
    base_price, sale_price, category_id, brand, collection, 
    material, purity, status, visibility, featured, sponsored
) VALUES
-- Earrings
(
    UUID(), 'EH-EAR-001', 'Heritage Gold Hoops', 'heritage-gold-hoops',
    'Handcrafted luxury hoops with intricate enamel work',
    'Experience the timeless elegance of our Heritage Gold Hoops. Each piece is meticulously handcrafted by our master artisans, featuring intricate enamel work that tells a story of Indian heritage. The 18k gold construction ensures durability while maintaining the lustrous finish that makes these earrings perfect for both daily wear and special occasions.',
    2499.00, 2199.00, @cat_earrings, 'Ehsaas Heritage', 'Heritage Collection',
    'Gold', '18k', 'published', 'visible', TRUE, FALSE
),
(
    UUID(), 'EH-EAR-002', 'Pearl Drop Elegance', 'pearl-drop-elegance',
    'Classic pearl earrings with modern sophistication',
    'Our Pearl Drop Elegance earrings combine timeless pearl beauty with contemporary design. Featuring AAA-grade freshwater pearls suspended from delicate gold settings, these earrings add grace to any ensemble. The secure hook closure ensures comfortable wear throughout the day.',
    1899.00, NULL, @cat_earrings, 'Ehsaas Craft', 'Pearl Collection',
    'Gold', '18k', 'published', 'visible', FALSE, TRUE
),

-- Necklaces
(
    UUID(), 'EH-NECK-001', 'Diamond Elegance Necklace', 'diamond-elegance-necklace',
    'Stunning diamond necklace featuring premium cuts',
    'This breathtaking Diamond Elegance Necklace features carefully selected diamonds with exceptional clarity and brilliance. The graduated design creates a cascading effect that beautifully frames the neckline. Each diamond is individually set in 18k white gold, creating a piece that will be treasured for generations.',
    8999.00, NULL, @cat_necklaces, 'Ehsaas Bridal', 'Diamond Collection',
    'White Gold', '18k', 'published', 'visible', TRUE, FALSE
),
(
    UUID(), 'EH-NECK-002', 'Gold Chain Delicate', 'gold-chain-delicate',
    'Delicate gold chain with intricate pendant work',
    'A symphony of delicate craftsmanship, this gold chain features an intricate pendant that showcases traditional Indian motifs. The fine link chain is designed for everyday elegance, while the pendant adds a touch of cultural heritage to your style.',
    3799.00, 3399.00, @cat_necklaces, 'Ehsaas Style', 'Daily Wear Collection',
    'Gold', '22k', 'published', 'visible', FALSE, FALSE
),

-- Rings
(
    UUID(), 'EH-RING-001', 'Solitaire Dream Ring', 'solitaire-dream-ring',
    'Classic solitaire ring with brilliant cut diamond',
    'The Solitaire Dream Ring represents the pinnacle of engagement ring elegance. Featuring a brilliant cut diamond of exceptional quality, set in a timeless six-prong setting that maximizes light reflection. The band is crafted from premium platinum for ultimate durability and hypoallergenic properties.',
    15999.00, NULL, @cat_rings, 'Ehsaas Bridal', 'Engagement Collection',
    'Platinum', '950', 'published', 'visible', TRUE, TRUE
),

-- Bridal Collection
(
    UUID(), 'EH-BRIDAL-001', 'Royal Bridal Set Complete', 'royal-bridal-set-complete',
    'Complete bridal set with necklace, earrings, and maang tikka',
    'Our Royal Bridal Set is the epitome of bridal jewelry excellence. This comprehensive set includes a statement necklace, matching earrings, delicate maang tikka, and coordinating bangles. Each piece features intricate goldwork with precious stones, creating a cohesive bridal look that embodies traditional Indian craftsmanship.',
    45999.00, 41999.00, @cat_bridal, 'Ehsaas Bridal', 'Royal Collection',
    'Gold', '22k', 'published', 'visible', TRUE, TRUE
);

-- =============================================
-- 3. PRODUCT SPECIFICATIONS
-- =============================================

-- Get product IDs for specifications
SET @prod_heritage_hoops = (SELECT id FROM products WHERE sku = 'EH-EAR-001' LIMIT 1);
SET @prod_pearl_drops = (SELECT id FROM products WHERE sku = 'EH-EAR-002' LIMIT 1);
SET @prod_diamond_neck = (SELECT id FROM products WHERE sku = 'EH-NECK-001' LIMIT 1);
SET @prod_gold_chain = (SELECT id FROM products WHERE sku = 'EH-NECK-002' LIMIT 1);
SET @prod_solitaire = (SELECT id FROM products WHERE sku = 'EH-RING-001' LIMIT 1);
SET @prod_bridal_set = (SELECT id FROM products WHERE sku = 'EH-BRIDAL-001' LIMIT 1);

INSERT INTO product_specifications (
    product_id, length_mm, width_mm, height_mm, diameter_mm,
    gross_weight_grams, net_weight_grams, stone_weight_carats,
    metal_type, metal_purity, plating, finish,
    primary_stone, stone_shape, stone_cut, stone_color, stone_clarity,
    care_instructions, warranty_period_months, hallmark_details
) VALUES
-- Heritage Gold Hoops
(
    @prod_heritage_hoops, 25.0, 3.0, 25.0, 25.0,
    4.50, 4.20, 0.00,
    'Gold', '18k', 'None', 'High Polish',
    'None', 'None', 'None', 'None', 'None',
    'Clean with soft cloth. Avoid exposure to chemicals and perfumes. Store in provided jewelry box.',
    12, 'BIS Hallmarked 18k Gold'
),
-- Pearl Drop Elegance
(
    @prod_pearl_drops, 35.0, 8.0, 8.0, NULL,
    3.20, 2.80, 0.00,
    'Gold', '18k', 'None', 'High Polish',
    'Pearl', 'Round', 'None', 'White', 'AAA',
    'Wipe pearls with damp cloth after use. Avoid chemicals and store separately.',
    12, 'BIS Hallmarked 18k Gold, Natural Pearl Certificate'
),
-- Diamond Elegance Necklace
(
    @prod_diamond_neck, 400.0, 15.0, 8.0, NULL,
    25.60, 24.20, 1.50,
    'White Gold', '18k', 'Rhodium', 'High Polish',
    'Diamond', 'Round', 'Brilliant', 'D', 'VS1',
    'Professional cleaning recommended annually. Avoid ultrasonic cleaning.',
    24, 'BIS Hallmarked 18k White Gold, IGI Diamond Certificate'
),
-- Gold Chain Delicate
(
    @prod_gold_chain, 450.0, 2.0, 2.0, NULL,
    8.50, 8.50, 0.00,
    'Gold', '22k', 'None', 'High Polish',
    'None', 'None', 'None', 'None', 'None',
    'Regular cleaning with gold cleaner. Avoid harsh chemicals.',
    12, 'BIS Hallmarked 22k Gold'
),
-- Solitaire Dream Ring
(
    @prod_solitaire, 6.0, 6.0, 8.0, NULL,
    4.20, 3.50, 0.70,
    'Platinum', '950', 'None', 'High Polish',
    'Diamond', 'Round', 'Brilliant', 'D', 'VVS1',
    'Professional cleaning and inspection recommended annually.',
    36, 'Platinum Guild Certificate, GIA Diamond Certificate'
),
-- Royal Bridal Set
(
    @prod_bridal_set, NULL, NULL, NULL, NULL,
    125.50, 120.00, 5.50,
    'Gold', '22k', 'None', 'High Polish',
    'Ruby', 'Mixed', 'Mixed', 'Pigeon Blood', 'VS',
    'Professional cleaning recommended. Store pieces separately in silk pouches.',
    24, 'BIS Hallmarked 22k Gold, Gemstone Certificate'
);

-- =============================================
-- 4. PRODUCT IMAGES
-- =============================================

INSERT INTO product_images (
    product_id, image_url, alt_text, image_type, sort_order, is_primary
) VALUES
-- Heritage Gold Hoops Images
(@prod_heritage_hoops, '/images/products/heritage-hoops-main.jpg', 'Heritage Gold Hoops - Main View', 'main', 1, TRUE),
(@prod_heritage_hoops, '/images/products/heritage-hoops-side.jpg', 'Heritage Gold Hoops - Side View', 'gallery', 2, FALSE),
(@prod_heritage_hoops, '/images/products/heritage-hoops-detail.jpg', 'Heritage Gold Hoops - Detail Close-up', 'detail', 3, FALSE),
(@prod_heritage_hoops, '/images/products/heritage-hoops-lifestyle.jpg', 'Heritage Gold Hoops - Lifestyle Shot', 'lifestyle', 4, FALSE),

-- Pearl Drop Elegance Images
(@prod_pearl_drops, '/images/products/pearl-drops-main.jpg', 'Pearl Drop Elegance - Main View', 'main', 1, TRUE),
(@prod_pearl_drops, '/images/products/pearl-drops-angle.jpg', 'Pearl Drop Elegance - Angled View', 'gallery', 2, FALSE),
(@prod_pearl_drops, '/images/products/pearl-drops-worn.jpg', 'Pearl Drop Elegance - Being Worn', 'lifestyle', 3, FALSE),

-- Diamond Elegance Necklace Images
(@prod_diamond_neck, '/images/products/diamond-neck-main.jpg', 'Diamond Elegance Necklace - Main View', 'main', 1, TRUE),
(@prod_diamond_neck, '/images/products/diamond-neck-detail.jpg', 'Diamond Elegance Necklace - Diamond Detail', 'detail', 2, FALSE),
(@prod_diamond_neck, '/images/products/diamond-neck-full.jpg', 'Diamond Elegance Necklace - Full Length', 'gallery', 3, FALSE),
(@prod_diamond_neck, '/images/products/diamond-neck-lifestyle.jpg', 'Diamond Elegance Necklace - Lifestyle', 'lifestyle', 4, FALSE),

-- Gold Chain Delicate Images
(@prod_gold_chain, '/images/products/gold-chain-main.jpg', 'Gold Chain Delicate - Main View', 'main', 1, TRUE),
(@prod_gold_chain, '/images/products/gold-chain-pendant.jpg', 'Gold Chain Delicate - Pendant Detail', 'detail', 2, FALSE),

-- Solitaire Dream Ring Images
(@prod_solitaire, '/images/products/solitaire-main.jpg', 'Solitaire Dream Ring - Main View', 'main', 1, TRUE),
(@prod_solitaire, '/images/products/solitaire-side.jpg', 'Solitaire Dream Ring - Side Profile', 'gallery', 2, FALSE),
(@prod_solitaire, '/images/products/solitaire-hand.jpg', 'Solitaire Dream Ring - On Hand', 'lifestyle', 3, FALSE),

-- Royal Bridal Set Images
(@prod_bridal_set, '/images/products/bridal-set-complete.jpg', 'Royal Bridal Set - Complete Set', 'main', 1, TRUE),
(@prod_bridal_set, '/images/products/bridal-set-necklace.jpg', 'Royal Bridal Set - Necklace Detail', 'detail', 2, FALSE),
(@prod_bridal_set, '/images/products/bridal-set-earrings.jpg', 'Royal Bridal Set - Earrings Detail', 'detail', 3, FALSE),
(@prod_bridal_set, '/images/products/bridal-set-lifestyle.jpg', 'Royal Bridal Set - Bridal Photoshoot', 'lifestyle', 4, FALSE);

-- =============================================
-- 5. PRODUCT PRECAUTIONS
-- =============================================

INSERT INTO product_precautions (
    product_id, precaution_type, title, description, severity, sort_order
) VALUES
-- General jewelry care
(@prod_heritage_hoops, 'care', 'Daily Care', 'Clean with soft microfiber cloth after each use to maintain shine', 'low', 1),
(@prod_heritage_hoops, 'storage', 'Proper Storage', 'Store in provided jewelry box with individual compartments to prevent scratching', 'medium', 2),
(@prod_heritage_hoops, 'wearing', 'Activity Restrictions', 'Remove before swimming, exercising, or household cleaning', 'high', 3),

-- Pearl specific care
(@prod_pearl_drops, 'care', 'Pearl Care', 'Pearls are organic gems requiring special care. Wipe with damp cloth only', 'high', 1),
(@prod_pearl_drops, 'allergy', 'Skin Sensitivity', 'May cause irritation for those with metal allergies. Test before extended wear', 'medium', 2),
(@prod_pearl_drops, 'cleaning', 'Cleaning Warning', 'Never use ultrasonic cleaners or harsh chemicals on pearls', 'critical', 3),

-- Diamond jewelry care
(@prod_diamond_neck, 'care', 'Diamond Maintenance', 'Have diamonds professionally cleaned every 6 months for optimal brilliance', 'medium', 1),
(@prod_diamond_neck, 'storage', 'Diamond Storage', 'Store separately as diamonds can scratch other jewelry', 'high', 2),

-- Ring specific care
(@prod_solitaire, 'wearing', 'Ring Sizing', 'Ensure proper sizing before purchase. Resizing may affect stone setting', 'high', 1),
(@prod_solitaire, 'care', 'Prong Inspection', 'Inspect prongs regularly for looseness. Professional check recommended annually', 'critical', 2);

-- =============================================
-- 6. PRODUCT STORIES
-- =============================================

INSERT INTO product_stories (
    product_id, story_title, story_description, story_content,
    model_name, model_description, story_type, is_featured
) VALUES
(@prod_heritage_hoops, 
    'The Art of Traditional Goldsmithing', 
    'Discover the centuries-old techniques behind our Heritage Gold Hoops',
    'In the heart of Rajasthan, master craftsman Ramesh Kumar continues a family tradition spanning five generations. Each Heritage Gold Hoop begins as raw gold, carefully heated and shaped using techniques passed down through generations. The intricate enamel work, known as Meenakari, requires days of precise application and firing. This ancient art form creates the vibrant colors and intricate patterns that make each piece unique. When you wear these hoops, you carry with you not just jewelry, but a piece of Indian cultural heritage.',
    'Priya Sharma', 'Classical dancer and jewelry enthusiast who embodies the grace of traditional Indian culture',
    'heritage', TRUE
),
(@prod_diamond_neck, 
    'A Celebration of Love', 
    'How our Diamond Elegance Necklace became the centerpiece of an unforgettable proposal',
    'When Arjun decided to propose to Kavya, he knew he needed something as extraordinary as their love story. The Diamond Elegance Necklace caught his eye not just for its beauty, but for its symbolism - each diamond representing a precious memory they had created together. On a moonlit terrace overlooking the Taj Mahal, with the necklace sparkling in the gentle light, their love story reached its most beautiful chapter. Today, Kavya wears it not just as jewelry, but as a reminder of that perfect moment when two hearts became one.',
    'Kavya & Arjun', 'A couple whose love story inspired this timeless piece',
    'inspiration', TRUE
),
(@prod_bridal_set, 
    'Royal Wedding Tradition', 
    'The inspiration behind our most elaborate bridal collection',
    'Inspired by the royal weddings of Rajasthan, our Royal Bridal Set represents the pinnacle of Indian bridal jewelry. Each element - from the statement necklace to the delicate maang tikka - follows designs that have adorned Indian brides for centuries. The rubies symbolize passion and prosperity, while the intricate goldwork tells stories of eternal love. This set transforms every bride into royalty on her special day, connecting her to generations of Indian women who have celebrated love through the beauty of jewelry.',
    'Maharani Collection Model', 'Professional bridal model specializing in traditional Indian wedding photography',
    'heritage', TRUE
);

-- =============================================
-- 7. SAMPLE USERS
-- =============================================

INSERT INTO users (
    id, email, password_hash, first_name, last_name, phone, 
    gender, email_verified, account_status, account_type
) VALUES
(UUID(), 'admin@ehsaas.com', '$2b$12$hashedpassword1', 'Admin', 'User', '+919876543210', 'prefer_not_to_say', TRUE, 'active', 'admin'),
(UUID(), 'priya.sharma@email.com', '$2b$12$hashedpassword2', 'Priya', 'Sharma', '+919876543211', 'female', TRUE, 'active', 'customer'),
(UUID(), 'arjun.mehta@email.com', '$2b$12$hashedpassword3', 'Arjun', 'Mehta', '+919876543212', 'male', TRUE, 'active', 'customer'),
(UUID(), 'kavya.singh@email.com', '$2b$12$hashedpassword4', 'Kavya', 'Singh', '+919876543213', 'female', FALSE, 'active', 'customer');

-- =============================================
-- 8. SAMPLE REVIEWS
-- =============================================

-- Get user IDs
SET @user_priya = (SELECT id FROM users WHERE email = 'priya.sharma@email.com' LIMIT 1);
SET @user_arjun = (SELECT id FROM users WHERE email = 'arjun.mehta@email.com' LIMIT 1);
SET @user_kavya = (SELECT id FROM users WHERE email = 'kavya.singh@email.com' LIMIT 1);

INSERT INTO product_reviews (
    product_id, user_id, rating, title, review_text, verified_purchase, status
) VALUES
(@prod_heritage_hoops, @user_priya, 5, 'Absolutely Beautiful!', 
    'These earrings exceeded my expectations. The craftsmanship is exceptional and they are so comfortable to wear. I get compliments every time I wear them. The enamel work is intricate and the gold quality is excellent. Highly recommended!', 
    TRUE, 'approved'),
(@prod_pearl_drops, @user_kavya, 4, 'Elegant and Classic', 
    'Love these pearl earrings! They are perfect for both office and evening wear. The pearls have a beautiful luster and the gold setting is well-made. Only giving 4 stars because I wish they came with a storage pouch.', 
    TRUE, 'approved'),
(@prod_diamond_neck, @user_arjun, 5, 'Perfect for Special Occasions', 
    'Bought this for my wife\'s birthday and she absolutely loves it! The diamonds are brilliant and the setting is gorgeous. It\'s definitely a statement piece that gets noticed. Worth every penny!', 
    TRUE, 'approved'),
(@prod_bridal_set, @user_kavya, 5, 'Dream Bridal Set', 
    'This bridal set is everything I dreamed of for my wedding day. The quality is outstanding and it photographs beautifully. The customer service was excellent and they helped me choose the perfect pieces. Thank you Ehsaas!', 
    TRUE, 'approved');

-- =============================================
-- 9. PRODUCT RELATIONSHIPS (Similar Products)
-- =============================================

INSERT INTO product_relationships (
    primary_product_id, related_product_id, relationship_type, relevance_score
) VALUES
(@prod_heritage_hoops, @prod_pearl_drops, 'similar', 0.85),
(@prod_pearl_drops, @prod_heritage_hoops, 'similar', 0.85),
(@prod_diamond_neck, @prod_bridal_set, 'complementary', 0.90),
(@prod_solitaire, @prod_bridal_set, 'frequently_bought_together', 0.75),
(@prod_gold_chain, @prod_heritage_hoops, 'cross_sell', 0.70);

-- =============================================
-- 10. SAMPLE ORDERS
-- =============================================

-- Create sample order
SET @sample_order_id = UUID();
INSERT INTO orders (
    id, order_number, user_id, status, payment_status,
    subtotal, tax_amount, shipping_amount, total_amount,
    payment_method, payment_transaction_id
) VALUES (
    @sample_order_id, 'EH2024001', @user_priya, 'delivered', 'paid',
    2499.00, 449.82, 0.00, 2948.82,
    'credit_card', 'txn_1234567890'
);

-- Add order items
INSERT INTO order_items (
    order_id, product_id, product_name, product_sku, unit_price, quantity, total_price
) VALUES (
    @sample_order_id, @prod_heritage_hoops, 'Heritage Gold Hoops', 'EH-EAR-001', 2499.00, 1, 2499.00
);

-- Add order status history
INSERT INTO order_status_history (order_id, status, notes) VALUES
(@sample_order_id, 'pending', 'Order placed successfully'),
(@sample_order_id, 'confirmed', 'Payment confirmed and order accepted'),
(@sample_order_id, 'processing', 'Order being prepared for shipment'),
(@sample_order_id, 'shipped', 'Order shipped with tracking number'),
(@sample_order_id, 'delivered', 'Order delivered successfully');

-- =============================================
-- END OF SAMPLE DATA
-- =============================================