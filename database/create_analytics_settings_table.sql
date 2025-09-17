-- Create simple analytics_settings table for Google Analytics and Facebook Pixel

CREATE TABLE IF NOT EXISTS analytics_settings (
    id SERIAL PRIMARY KEY,
    google_analytics_id TEXT NULL,
    facebook_pixel_id TEXT NULL,
    enable_tracking BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO analytics_settings (id, google_analytics_id, facebook_pixel_id, enable_tracking)
VALUES (1, NULL, NULL, true)
ON CONFLICT (id) DO UPDATE
SET google_analytics_id = EXCLUDED.google_analytics_id,
    facebook_pixel_id = EXCLUDED.facebook_pixel_id,
    enable_tracking = EXCLUDED.enable_tracking,
    updated_at = NOW();

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analytics_settings_updated_at 
    BEFORE UPDATE ON analytics_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_analytics_timestamp();
