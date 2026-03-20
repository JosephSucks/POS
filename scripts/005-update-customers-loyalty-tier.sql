-- Add loyalty tier tracking to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS loyalty_tier_id INTEGER;

-- Add foreign key constraint
ALTER TABLE customers 
ADD CONSTRAINT fk_customers_loyalty_tier 
FOREIGN KEY (loyalty_tier_id) REFERENCES loyalty_tiers(id) ON DELETE SET NULL;

-- Create index for tier lookups
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_tier ON customers(loyalty_tier_id);
