-- Insert sample transactions for testing
INSERT INTO transactions (user_id, total_amount, payment_method, items_count) 
VALUES 
  (1, 150.00, 'card', 3),
  (2, 89.99, 'cash', 2),
  (1, 250.50, 'card', 5),
  (3, 120.00, 'card', 2),
  (2, 199.99, 'card', 4)
ON CONFLICT DO NOTHING;
