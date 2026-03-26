-- Create tables table for dine-in management
CREATE TABLE IF NOT EXISTS "tables" (
  "id" serial PRIMARY KEY,
  "table_number" integer NOT NULL CONSTRAINT "tables_table_number_key" UNIQUE,
  "capacity" integer DEFAULT 4,
  "status" varchar(50) DEFAULT 'available',
  "current_order_id" integer,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "reserved_from" timestamp,
  "reserved_to" timestamp,
  FOREIGN KEY ("current_order_id") REFERENCES orders(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tables_status ON "tables"("status");
CREATE INDEX IF NOT EXISTS idx_tables_table_number ON "tables"("table_number");

-- Insert sample tables (1-10)
INSERT INTO "tables" (table_number, capacity, status) 
VALUES 
  (1, 4, 'available'),
  (2, 4, 'available'),
  (3, 4, 'available'),
  (4, 6, 'available'),
  (5, 6, 'available'),
  (6, 2, 'available'),
  (7, 2, 'available'),
  (8, 8, 'available'),
  (9, 8, 'available'),
  (10, 4, 'available')
ON CONFLICT ("table_number") DO NOTHING;
