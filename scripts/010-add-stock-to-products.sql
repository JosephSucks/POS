-- Add stock column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- Add reorder_level column for low stock alerts
ALTER TABLE products
ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10;

-- Add updated_at trigger to track stock changes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_updated_at TIMESTAMP DEFAULT NOW();
