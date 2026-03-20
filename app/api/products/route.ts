import { neon } from '@neondatabase/serverless'
import type { Product } from "@/app/context/cart-context"

const getDatabaseUrl = () => {
  const url = 
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (!url) {
    throw new Error('No database connection string found')
  }
  return url
}

const sql = neon(getDatabaseUrl())

export async function GET() {
  try {
    console.log('[v0] Fetching products from database...')
    
    const products = await sql`
      SELECT 
        p.id, 
        p.name, 
        CAST(p.price AS FLOAT) as price, 
        p.image_url as image, 
        c.name as category,
        p.stock,
        p.reorder_level,
        p.stock_updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `

    console.log(`[v0] Successfully fetched ${products.length} products`)
    
    if (products.length === 0) {
      console.warn('[v0] No products found in database - database may not be seeded')
    }

    return Response.json(products as Product[])
  } catch (error) {
    console.error('[v0] Error fetching products:', error)
    return Response.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, description, image_url, category_id } = body

    // Validate required fields
    if (!name || price === undefined) {
      return Response.json(
        { error: 'Missing required fields: name and price' },
        { status: 400 }
      )
    }

    console.log('[v0] Creating product - resolving category from:', category_id)
    let resolvedCategoryId: number | null = null
    
    if (category_id !== null && category_id !== undefined && category_id !== '') {
      // Check if it's already a number
      const numericId = Number(category_id)
      if (!isNaN(numericId) && Number.isInteger(numericId)) {
        resolvedCategoryId = numericId
      } else if (typeof category_id === 'string') {
        // It's a category name string, look up the actual ID from the database
        try {
          const categoryResult = await sql`
            SELECT id FROM categories WHERE LOWER(name) = LOWER(${category_id})
          `
          if (categoryResult && categoryResult.length > 0) {
            resolvedCategoryId = categoryResult[0].id
            console.log('[v0] Found category ID:', resolvedCategoryId, 'for name:', category_id)
          } else {
            console.warn('[v0] Category not found for name:', category_id, '- using NULL')
            resolvedCategoryId = null
          }
        } catch (categoryError) {
          console.error('[v0] Error looking up category:', categoryError)
          resolvedCategoryId = null
        }
      }
    }

    const result = await sql`
      INSERT INTO products (name, price, description, image_url, category_id, created_at, updated_at)
      VALUES (${name}, ${price}, ${description || null}, ${image_url || null}, ${resolvedCategoryId}, NOW(), NOW())
      RETURNING id, name, CAST(price AS FLOAT) as price, description, image_url, category_id, created_at, updated_at
    `

    console.log('[v0] Product created successfully:', result[0])

    return Response.json(result[0], { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating product:', error)
    return Response.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
