-- Create admin_access_requests table for tracking manager access requests
CREATE TABLE IF NOT EXISTS admin_access_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  request_reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, denied, expired
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP,
  responded_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  expires_at TIMESTAMP, -- When temporary access expires (1 hour after approval)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_requests_requester ON admin_access_requests(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_admin_requests_status ON admin_access_requests(status, requested_at);
CREATE INDEX IF NOT EXISTS idx_admin_requests_expires ON admin_access_requests(expires_at);

-- Insert default manager access control setting
INSERT INTO settings (key, value, updated_at)
VALUES ('managerAccessControl', '"ON"', NOW())
ON CONFLICT (key) DO NOTHING;
