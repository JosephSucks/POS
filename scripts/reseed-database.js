import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function reseedDatabase() {
  try {
    console.log('[v0] Starting database reseed...')

    // Truncate tables to clear old data
    console.log('[v0] Clearing existing data...')
    await sql`TRUNCATE TABLE order_items CASCADE`
    await sql`TRUNCATE TABLE orders CASCADE`
    await sql`TRUNCATE TABLE customers CASCADE`
    await sql`TRUNCATE TABLE inventory CASCADE`
    await sql`TRUNCATE TABLE products CASCADE`
    await sql`TRUNCATE TABLE categories CASCADE`

    console.log('[v0] Inserting fresh categories...')
    const categoryResults = await sql`
      INSERT INTO categories (name, description) 
      VALUES 
        ('Food', 'Main dishes'),
        ('Beverages', 'Drinks'),
        ('Desserts', 'Sweet treats')
      RETURNING id, name
    `
    console.log('[v0] Categories inserted:', categoryResults)

    const foodId = categoryResults.find(c => c.name === 'Food').id
    const beverageId = categoryResults.find(c => c.name === 'Beverages').id
    const dessertId = categoryResults.find(c => c.name === 'Desserts').id

    console.log(`[v0] Category IDs - Food: ${foodId}, Beverages: ${beverageId}, Desserts: ${dessertId}`)

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

    console.log(`[v0] Inserting ${products.length} products...`)
    for (const product of products) {
      const result = await sql`
        INSERT INTO products (name, price, category_id, image_url) 
        VALUES (${product.name}, ${product.price}, ${product.category}, ${product.image})
        RETURNING id
      `

      const productId = result[0].id
      await sql`
        INSERT INTO inventory (product_id, quantity, reorder_level)
        VALUES (${productId}, 100, 20)
      `
      console.log(`[v0] Inserted product: ${product.name} (ID: ${productId})`)
    }

    console.log('[v0] Database reseeding completed successfully!')
    console.log('[v0] All 15 products loaded with inventory')

  } catch (error) {
    console.error('[v0] Error reseeding database:', error)
    process.exit(1)
  }
}

reseedDatabase()
