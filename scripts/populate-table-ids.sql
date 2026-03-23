-- Assign random table numbers to existing orders without a table_id
-- This will randomly assign tables 1-20 to all orders that don't have a table_id

UPDATE orders 
SET table_id = (
  SELECT id FROM tables 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE table_id IS NULL;

-- Log the update
SELECT COUNT(*) as orders_updated FROM orders WHERE table_id IS NOT NULL;
