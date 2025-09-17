-- Add variant columns to order_items table
-- This migration adds size and color columns to support product variants in orders

-- Add size column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- Add color column to order_items table  
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN order_items.size IS 'Product variant size (e.g., S, M, L, US 7, etc.)';
COMMENT ON COLUMN order_items.color IS 'Product variant color (e.g., Red, Blue, Gold, etc.)';

-- Create index for better query performance on variant columns
CREATE INDEX IF NOT EXISTS idx_order_items_size ON order_items(size);
CREATE INDEX IF NOT EXISTS idx_order_items_color ON order_items(color);

-- Update existing order_items to have default values if needed
-- This is optional - you can run this if you want to backfill existing records
-- UPDATE order_items SET size = NULL WHERE size IS NULL;
-- UPDATE order_items SET color = NULL WHERE color IS NULL;

-- Verify the columns were added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
AND column_name IN ('size', 'color')
ORDER BY column_name;
