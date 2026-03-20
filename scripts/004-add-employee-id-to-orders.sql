-- Add employee_id to orders table to track which cashier made the sale
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS employee_id INTEGER;

-- Add foreign key constraint
ALTER TABLE orders 
ADD CONSTRAINT fk_orders_employee_id 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Create index for employee sales tracking
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id);
