-- Comprehensive fix for visitor analytics functions to resolve 400 Bad Request error

-- First, ensure all required columns exist with proper defaults
ALTER TABLE public.visitor_analytics 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS added_to_cart_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS initiated_checkout_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_orders_count INTEGER DEFAULT 0;

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.get_or_create_visitor_session(TEXT, UUID, INET, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_or_create_visitor_session(TEXT, UUID, INET, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.increment_cart_additions(TEXT);
DROP FUNCTION IF EXISTS increment_cart_additions(TEXT);
DROP FUNCTION IF EXISTS public.increment_checkout_initiations(TEXT);
DROP FUNCTION IF EXISTS increment_checkout_initiations(TEXT);
DROP FUNCTION IF EXISTS public.increment_completed_orders(TEXT);
DROP FUNCTION IF EXISTS increment_completed_orders(TEXT);

-- Create the function to get or create visitor session with proper error handling
-- This version includes all columns in the INSERT statement to avoid issues
CREATE OR REPLACE FUNCTION public.get_or_create_visitor_session(
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
    -- Validate required parameter
    IF p_session_id IS NULL OR p_session_id = '' THEN
        RAISE EXCEPTION 'Session ID is required';
    END IF;
    
    -- Try to find existing visitor record
    SELECT id INTO v_visitor_id
    FROM public.visitor_analytics
    WHERE session_id = p_session_id
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If not found, create a new record
    IF v_visitor_id IS NULL THEN
        -- Insert with all columns explicitly
        INSERT INTO public.visitor_analytics (
            session_id, 
            user_id, 
            ip_address, 
            user_agent, 
            page_url, 
            device_type, 
            country,
            added_to_cart_count,
            initiated_checkout_count,
            completed_orders_count,
            updated_at
        ) VALUES (
            p_session_id,
            p_user_id,
            p_ip_address,
            p_user_agent,
            p_page_url,
            p_device_type,
            p_country,
            0,  -- added_to_cart_count default
            0,  -- initiated_checkout_count default
            0,  -- completed_orders_count default
            NOW()  -- updated_at
        ) RETURNING id INTO v_visitor_id;
    END IF;
    
    -- Return the visitor record
    RETURN QUERY
    SELECT 
        v.id as visitor_id,
        v.session_id,
        v.user_id,
        v.created_at
    FROM public.visitor_analytics v
    WHERE v.id = v_visitor_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and re-raise with more context
        RAISE NOTICE 'Error in get_or_create_visitor_session: %', SQLERRM;
        RAISE EXCEPTION 'Failed to get or create visitor session: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the function to increment cart additions with proper error handling
CREATE OR REPLACE FUNCTION public.increment_cart_additions(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Validate required parameter
    IF p_session_id IS NULL OR p_session_id = '' THEN
        RAISE EXCEPTION 'Session ID is required';
    END IF;
    
    -- Update the cart additions count
    UPDATE public.visitor_analytics 
    SET added_to_cart_count = COALESCE(added_to_cart_count, 0) + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id;
    
    -- If no rows were updated, we might want to know about it
    IF NOT FOUND THEN
        RAISE NOTICE 'No visitor record found for session_id: %', p_session_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the function to increment checkout initiations with proper error handling
CREATE OR REPLACE FUNCTION public.increment_checkout_initiations(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Validate required parameter
    IF p_session_id IS NULL OR p_session_id = '' THEN
        RAISE EXCEPTION 'Session ID is required';
    END IF;
    
    -- Update the checkout initiations count
    UPDATE public.visitor_analytics 
    SET initiated_checkout_count = COALESCE(initiated_checkout_count, 0) + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id;
    
    -- If no rows were updated, we might want to know about it
    IF NOT FOUND THEN
        RAISE NOTICE 'No visitor record found for session_id: %', p_session_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the function to increment completed orders with proper error handling
CREATE OR REPLACE FUNCTION public.increment_completed_orders(p_session_id TEXT)
RETURNS VOID AS $$
BEGIN
    -- Validate required parameter
    IF p_session_id IS NULL OR p_session_id = '' THEN
        RAISE EXCEPTION 'Session ID is required';
    END IF;
    
    -- Update the completed orders count
    UPDATE public.visitor_analytics 
    SET completed_orders_count = COALESCE(completed_orders_count, 0) + 1,
        updated_at = NOW()
    WHERE session_id = p_session_id;
    
    -- If no rows were updated, we might want to know about it
    IF NOT FOUND THEN
        RAISE NOTICE 'No visitor record found for session_id: %', p_session_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_added_to_cart ON public.visitor_analytics(added_to_cart_count);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_initiated_checkout ON public.visitor_analytics(initiated_checkout_count);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_completed_orders ON public.visitor_analytics(completed_orders_count);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_updated_at ON public.visitor_analytics(updated_at);