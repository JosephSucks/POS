-- Add tables table for restaurant/bar management
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  table_number INT NOT NULL UNIQUE,
  capacity INT DEFAULT 4,
  status VARCHAR(50) DEFAULT 'available', -- available, occupied, reserved, maintenance
  current_order_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add table_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id INT REFERENCES tables(id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);

-- Insert 20 default tables
INSERT INTO tables (table_number, capacity, status)
SELECT i, 4, 'available'
FROM generate_series(1, 20) AS t(i)
ON CONFLICT (table_number) DO NOTHING;
