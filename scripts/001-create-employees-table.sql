-- Create employees table for staff management
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'cashier', -- cashier, manager, admin
  hourly_rate NUMERIC(10, 2) DEFAULT 0,
  commission_rate NUMERIC(5, 2) DEFAULT 0, -- percentage
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, on_leave
  hire_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for employee PIN login
CREATE INDEX IF NOT EXISTS idx_employees_pin ON employees(pin);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
