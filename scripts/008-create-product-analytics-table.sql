-- Create product sales analytics for reporting
CREATE TABLE IF NOT EXISTS product_analytics (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  sale_date DATE NOT NULL,
  units_sold INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  UNIQUE(product_id, sale_date),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create index for product trend analysis
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_date ON product_analytics(product_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(sale_date);
