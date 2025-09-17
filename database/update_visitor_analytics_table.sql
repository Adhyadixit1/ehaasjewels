-- Update visitor_analytics table to add columns for tracking cart additions and checkout initiation

-- Add new columns to track e-commerce events
ALTER TABLE public.visitor_analytics 
ADD COLUMN IF NOT EXISTS added_to_cart_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS initiated_checkout_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_orders_count INTEGER DEFAULT 0;

-- Add indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_added_to_cart ON public.visitor_analytics(added_to_cart_count);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_initiated_checkout ON public.visitor_analytics(initiated_checkout_count);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_completed_orders ON public.visitor_analytics(completed_orders_count);

-- Add a function to get or create visitor session
-- This will help track users across page views
CREATE OR REPLACE FUNCTION get_or_create_visitor_session(
    p_session_id TEXT,
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_page_url TEXT DEFAULT NULL,
    p_device_type TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL
) RETURNS TABLE (
    visitor_id BIGINT,
    session_id TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_visitor_id BIGINT;
BEGIN
    -- Try to find existing visitor record
    SELECT id INTO v_visitor_id
    FROM visitor_analytics
    WHERE session_id = p_session_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If not found, create a new record
    IF v_visitor_id IS NULL THEN
        INSERT INTO visitor_analytics (
            session_id, 
            user_id, 
            ip_address, 
            user_agent, 
            page_url, 
            device_type, 
            country
        ) VALUES (
            p_session_id,
            p_user_id,
            p_ip_address,
            p_user_agent,
            p_page_url,
            p_device_type,
            p_country
        ) RETURNING id INTO v_visitor_id;
    END IF;
    
    -- Return the visitor record
    RETURN QUERY
    SELECT 
        v.id as visitor_id,
        v.session_id,
        v.user_id,
        v.created_at
    FROM visitor_analytics v
    WHERE v.id = v_visitor_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to increment cart additions
CREATE OR REPLACE FUNCTION increment_cart_additions(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE visitor_analytics 
    SET added_to_cart_count = added_to_cart_count + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to increment checkout initiations
CREATE OR REPLACE FUNCTION increment_checkout_initiations(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE visitor_analytics 
    SET initiated_checkout_count = initiated_checkout_count + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Add a function to increment completed orders
CREATE OR REPLACE FUNCTION increment_completed_orders(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE visitor_analytics 
    SET completed_orders_count = completed_orders_count + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;