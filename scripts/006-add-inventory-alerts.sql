-- Add low stock alert tracking
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 5;

ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS last_alert_sent TIMESTAMP;

-- Create index for finding low stock items
CREATE INDEX IF NOT EXISTS idx_inventory_quantity_level ON inventory(quantity, reorder_level);
