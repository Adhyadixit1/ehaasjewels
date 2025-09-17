-- Test script for final visitor analytics functions fix

-- Clean up any existing test data
DELETE FROM public.visitor_analytics WHERE session_id = 'test_session_final_001';

-- Test 1: Create a visitor session
SELECT * FROM public.get_or_create_visitor_session(
    'test_session_final_001',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'http://localhost:8080/test',
    'desktop',
    'IN'
);

-- Test 2: Increment cart additions
SELECT public.increment_cart_additions('test_session_final_001');

-- Test 3: Increment checkout initiations
SELECT public.increment_checkout_initiations('test_session_final_001');

-- Test 4: Increment completed orders
SELECT public.increment_completed_orders('test_session_final_001');

-- Test 5: Verify the counts
SELECT 
    session_id,
    added_to_cart_count,
    initiated_checkout_count,
    completed_orders_count,
    updated_at
FROM public.visitor_analytics 
WHERE session_id = 'test_session_final_001';

-- Test 6: Test creating another session with same ID (should return existing)
SELECT * FROM public.get_or_create_visitor_session(
    'test_session_final_001',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'http://localhost:8080/test2',
    'desktop',
    'IN'
);

-- Test 7: Test with empty session ID (should fail)
-- Uncomment the following line to test error handling
-- SELECT * FROM public.get_or_create_visitor_session('');

-- Clean up test data
DELETE FROM public.visitor_analytics WHERE session_id = 'test_session_final_001';