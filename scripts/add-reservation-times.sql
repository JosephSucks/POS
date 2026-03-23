-- Add reservation time columns to tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS reserved_from TIMESTAMP;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS reserved_to TIMESTAMP;

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_tables_reserved_times ON tables(reserved_from, reserved_to);
