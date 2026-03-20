-- Create daily sales summary for fast reporting
CREATE TABLE IF NOT EXISTS daily_sales (
  id SERIAL PRIMARY KEY,
  sale_date DATE NOT NULL UNIQUE,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_items_sold INTEGER NOT NULL DEFAULT 0,
  total_discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cash_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  card_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
  top_product_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(sale_date);
