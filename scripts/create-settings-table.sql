-- Create settings table to store all application configuration
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value, created_at, updated_at) VALUES
  ('adminPinEnabled', 'true', NOW(), NOW()),
  ('adminPin', '"1234"', NOW(), NOW()),
  ('darkMode', 'false', NOW(), NOW()),
  ('taxRate', '0', NOW(), NOW()),
  ('currency', '"USD"', NOW(), NOW()),
  ('acceptCash', 'true', NOW(), NOW()),
  ('acceptCard', 'true', NOW(), NOW()),
  ('receiptHeader', '""', NOW(), NOW()),
  ('receiptFooter', '""', NOW(), NOW()),
  ('showLogo', 'true', NOW(), NOW()),
  ('autoPrintReceipt', 'false', NOW(), NOW()),
  ('compactMode', 'false', NOW(), NOW()),
  ('lowStockAlert', 'true', NOW(), NOW()),
  ('lowStockThreshold', '10', NOW(), NOW()),
  ('orderNotifications', 'true', NOW(), NOW()),
  ('soundEnabled', 'true', NOW(), NOW()),
  ('autoCompleteOrder', 'false', NOW(), NOW()),
  ('requireCustomer', 'false', NOW(), NOW()),
  ('defaultPaymentMethod', '"cash"', NOW(), NOW()),
  ('sessionTimeout', '30', NOW(), NOW()),
  ('storeName', '"My Store"', NOW(), NOW()),
  ('storeAddress', '""', NOW(), NOW()),
  ('storePhone', '""', NOW(), NOW()),
  ('storeEmail', '""', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
