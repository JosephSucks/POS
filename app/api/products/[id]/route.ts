import { neon } from '@neondatabase/serverless'

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

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const productId = params.id

    const result = await sql`
      SELECT 
        p.id, 
        p.name, 
        CAST(p.price AS FLOAT) as price,
        p.description,
        p.image_url,
        p.category_id,
        c.name as category,
        p.stock,
        p.reorder_level,
        p.stock_updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${parseInt(productId)}
    `

    if (result.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error('[v0] Error fetching product:', error)
    return Response.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const productId = params.id
    const body = await request.json()
    const { name, price, description, image_url, category_id, stock, reorder_level } = body

    console.log('[v0] Updating product:', { productId, name, price, stock, reorder_level, category_id })

    // If category_id is a string (category name), look up the actual ID
    let resolvedCategoryId = null
    if (category_id) {
      if (typeof category_id === 'string' && isNaN(Number(category_id))) {
        const categoryResult = await sql`
          SELECT id FROM categories WHERE LOWER(name) = LOWER(${category_id})
        `
        resolvedCategoryId = categoryResult[0]?.id || null
      } else {
        resolvedCategoryId = Number(category_id)
      }
    }

    const result = await sql`
      UPDATE products
      SET 
        name = COALESCE(${name}, name),
        price = COALESCE(${price}, price),
        description = COALESCE(${description}, description),
        image_url = COALESCE(${image_url}, image_url),
        category_id = ${resolvedCategoryId},
        stock = COALESCE(${stock}, stock),
        reorder_level = COALESCE(${reorder_level}, reorder_level),
        stock_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = ${parseInt(productId)}
      RETURNING id, name, CAST(price AS FLOAT) as price, description, image_url, category_id, stock, reorder_level, updated_at
    `

    if (result.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    console.log('[v0] Product updated successfully:', result[0])

    return Response.json(result[0])
  } catch (error) {
    console.error('[v0] Error updating product:', error)
    return Response.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const productId = params.id

    console.log('[v0] Deleting product:', productId)

    // First check if product exists
    const existingProduct = await sql`
      SELECT id FROM products WHERE id = ${parseInt(productId)}
    `

    if (existingProduct.length === 0) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete related order_items first (if any)
    await sql`
      DELETE FROM order_items WHERE product_id = ${parseInt(productId)}
    `

    // Delete the product (no inventory table to delete from)
    await sql`
      DELETE FROM products WHERE id = ${parseInt(productId)}
    `

    console.log('[v0] Product deleted successfully:', productId)

    return Response.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('[v0] Error deleting product:', error)
    return Response.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
