-- ============================================================================
-- CREATE APP_SETTINGS TABLE
-- ============================================================================
-- This table stores application-wide settings including Cloudinary configuration

-- Create the app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_settings (
    key text PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert Cloudinary cloud name if it doesn't exist
-- Replace 'your-cloud-name' with your actual Cloudinary cloud name
INSERT INTO app_settings (key, value, updated_at)
VALUES ('cloudinary_cloud_name', 'your-cloud-name', now())
ON CONFLICT (key) 
DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Grant permissions
GRANT ALL ON app_settings TO authenticated;
GRANT ALL ON app_settings TO anon;

-- Create function to get Cloudinary cloud name
CREATE OR REPLACE FUNCTION get_cloudinary_cloud_name()
RETURNS text AS $$
DECLARE
    cloud_name text;
BEGIN
    SELECT value INTO cloud_name 
    FROM app_settings 
    WHERE key = 'cloudinary_cloud_name';
    
    RETURN COALESCE(cloud_name, 'demo');
END;
$$ LANGUAGE plpgsql;

-- Create function to set Cloudinary cloud name
CREATE OR REPLACE FUNCTION set_cloudinary_cloud_name(cloud_name text)
RETURNS void AS $$
BEGIN
    INSERT INTO app_settings (key, value, updated_at)
    VALUES ('cloudinary_cloud_name', cloud_name, now())
    ON CONFLICT (key) 
    DO UPDATE SET value = EXCLUDED.value, updated_at = now();
    
    RAISE NOTICE 'Cloudinary cloud name set to: %', cloud_name;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT get_cloudinary_cloud_name() as current_cloud_name;
