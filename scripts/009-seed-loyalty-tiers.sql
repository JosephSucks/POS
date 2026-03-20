-- Seed loyalty tier data
INSERT INTO loyalty_tiers (name, min_points, max_points, discount_percentage, benefits, color) VALUES
  ('Bronze', 0, 499, 0, 'Access to promotions', '#CD7F32'),
  ('Silver', 500, 999, 5, '5% discount on all purchases', '#C0C0C0'),
  ('Gold', 1000, 4999, 10, '10% discount on all purchases, priority support', '#FFD700'),
  ('Platinum', 5000, NULL, 15, '15% discount on all purchases, exclusive events, free shipping', '#E5E4E2')
ON CONFLICT (name) DO NOTHING;
