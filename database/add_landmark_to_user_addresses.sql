-- Add landmark column to user_addresses table
-- This script adds a new 'landmark' column to store additional location information
-- for better delivery address identification

ALTER TABLE user_addresses 
ADD COLUMN landmark TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN user_addresses.landmark IS 'Optional landmark information to help locate the address (e.g., near railway station, opposite hospital, etc.)';

-- Create index for better search performance (optional)
-- CREATE INDEX idx_user_addresses_landmark ON user_addresses(landmark);
