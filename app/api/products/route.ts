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
        COALESCE(c.name, 'uncategorized') as category
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
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}