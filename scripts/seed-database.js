import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function seedDatabase() {
  try {
    console.log('[v0] Creating tables...')

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER UNIQUE REFERENCES products(id),
        quantity INTEGER DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) UNIQUE,
        phone VARCHAR(20),
        loyalty_points INTEGER DEFAULT 0,
        total_spent DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        subtotal DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('[v0] Tables created successfully')

    console.log('[v0] Inserting categories...')

    // Insert categories
    const categories = [
      { name: 'Food', description: 'Main dishes' },
      { name: 'Beverages', description: 'Drinks' },
      { name: 'Desserts', description: 'Sweet treats' }
    ]

    for (const category of categories) {
      await sql`
        INSERT INTO categories (name, description) 
        VALUES (${category.name}, ${category.description})
        ON CONFLICT (name) DO NOTHING
      `
    }

    console.log('[v0] Categories inserted')

    console.log('[v0] Inserting products...')

    // Get category IDs
    const foodCat = await sql`SELECT id FROM categories WHERE name = 'Food'`
    const beverageCat = await sql`SELECT id FROM categories WHERE name = 'Beverages'`
    const dessertCat = await sql`SELECT id FROM categories WHERE name = 'Desserts'`

    const foodId = foodCat[0]?.id
    const beverageId = beverageCat[0]?.id
    const dessertId = dessertCat[0]?.id

    // Insert products
    const products = [
      { name: 'Classic Beef Burger', price: 8.99, category: foodId, image: '/classic-beef-burger.png' },
      { name: 'Delicious Pizza', price: 12.99, category: foodId, image: '/delicious-pizza.png' },
      { name: 'Vibrant Mixed Salad', price: 7.99, category: foodId, image: '/vibrant-mixed-salad.png' },
      { name: 'Crispy Chicken Wings', price: 10.99, category: foodId, image: '/crispy-chicken-wings.png' },
      { name: 'Crispy French Fries', price: 4.99, category: foodId, image: '/crispy-french-fries.png' },
      { name: 'Refreshing Cola', price: 2.99, category: beverageId, image: '/refreshing-cola.png' },
      { name: 'Iced Tea', price: 2.49, category: beverageId, image: '/iced-tea.png' },
      { name: 'Glass of Orange Juice', price: 3.49, category: beverageId, image: '/glass-of-orange-juice.png' },
      { name: 'Latte Coffee', price: 4.49, category: beverageId, image: '/latte-coffee.png' },
      { name: 'Bottled Water', price: 1.99, category: beverageId, image: '/bottled-water.png' },
      { name: 'Chocolate Cake Slice', price: 5.99, category: dessertId, image: '/chocolate-cake-slice.png' },
      { name: 'Cheesecake Slice', price: 6.99, category: dessertId, image: '/cheesecake-slice.png' },
      { name: 'Ice Cream Sundae', price: 5.49, category: dessertId, image: '/ice-cream-sundae.png' },
      { name: 'Apple Pie Slice', price: 4.99, category: dessertId, image: '/apple-pie-slice.png' },
      { name: 'Chocolate Brownie', price: 3.99, category: dessertId, image: '/chocolate-brownie.png' }
    ]

    for (const product of products) {
      const result = await sql`
        INSERT INTO products (name, price, category_id, image_url) 
        VALUES (${product.name}, ${product.price}, ${product.category}, ${product.image})
        ON CONFLICT DO NOTHING
        RETURNING id
      `

      if (result.length > 0) {
        const productId = result[0].id
        
        // Insert inventory for this product
        await sql`
          INSERT INTO inventory (product_id, quantity, reorder_level)
          VALUES (${productId}, 100, 20)
          ON CONFLICT (product_id) DO NOTHING
        `
      }
    }

    console.log('[v0] Products and inventory inserted successfully')
    console.log('[v0] Database seeding completed!')

  } catch (error) {
    console.error('[v0] Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
