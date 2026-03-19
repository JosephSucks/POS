-- Insert categories
INSERT INTO categories (name) VALUES 
  ('Food'),
  ('Beverages'),
  ('Desserts')
ON CONFLICT (name) DO NOTHING;

-- Insert products
INSERT INTO products (name, price, category_id, image_url, sku) VALUES
  ('Classic Beef Burger', 8.99, 1, '/classic-beef-burger.png', 'BURGER-001'),
  ('Delicious Pizza', 12.99, 1, '/delicious-pizza.png', 'PIZZA-001'),
  ('Vibrant Mixed Salad', 7.99, 1, '/vibrant-mixed-salad.png', 'SALAD-001'),
  ('Crispy Chicken Wings', 9.99, 1, '/crispy-chicken-wings.png', 'WINGS-001'),
  ('Crispy French Fries', 4.99, 1, '/crispy-french-fries.png', 'FRIES-001'),
  ('Refreshing Cola', 2.99, 2, '/refreshing-cola.png', 'COLA-001'),
  ('Iced Tea', 3.49, 2, '/iced-tea.png', 'TEA-001'),
  ('Glass of Orange Juice', 3.99, 2, '/glass-of-orange-juice.png', 'OJ-001'),
  ('Latte Coffee', 4.99, 2, '/latte-coffee.png', 'LATTE-001'),
  ('Bottled Water', 1.99, 2, '/bottled-water.png', 'WATER-001'),
  ('Chocolate Cake Slice', 5.99, 3, '/chocolate-cake-slice.png', 'CAKE-001'),
  ('Cheesecake Slice', 6.49, 3, '/cheesecake-slice.png', 'CHEESE-001'),
  ('Ice Cream Sundae', 5.49, 3, '/ice-cream-sundae.png', 'SUNDAE-001'),
  ('Apple Pie Slice', 4.99, 3, '/apple-pie-slice.png', 'APPLEPIE-001'),
  ('Chocolate Brownie', 3.99, 3, '/chocolate-brownie.png', 'BROWNIE-001')
ON CONFLICT (sku) DO NOTHING;

-- Insert inventory for all products
INSERT INTO inventory (product_id, quantity, reorder_level)
SELECT id, 100, 10 FROM products
ON CONFLICT DO NOTHING;
