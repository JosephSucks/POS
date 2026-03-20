-- Create loyalty tiers table for reward levels
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- Bronze, Silver, Gold, Platinum
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  benefits TEXT, -- JSON or comma-separated benefits
  color VARCHAR(20), -- for UI display
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for tier lookups
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_name ON loyalty_tiers(name);
