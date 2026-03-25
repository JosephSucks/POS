import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const productId = Number.parseInt(params.id, 10)

    const result = await sql`
      SELECT
        p.id,
        p.name,
        CAST(p.price AS FLOAT) AS price,
        p.description,
        p.image_url,
        p.category_id,
        c.name AS category,
        p.stock,
        p.reorder_level,
        p.stock_updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ${productId}
    `

    if (result.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[products] Failed to fetch product:", error)
    return Response.json(
      {
        error: "Failed to fetch product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const productId = Number.parseInt(params.id, 10)
    const body = await request.json()
    const { name, price, description, image_url, category_id, stock, reorder_level } = body

    let resolvedCategoryId: number | null = null
    if (category_id) {
      if (typeof category_id === "string" && Number.isNaN(Number(category_id))) {
        const categoryResult = await sql`
          SELECT id
          FROM categories
          WHERE LOWER(name) = LOWER(${category_id})
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
      WHERE id = ${productId}
      RETURNING id, name, CAST(price AS FLOAT) AS price, description, image_url, category_id, stock, reorder_level, updated_at
    `

    if (result.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[products] Failed to update product:", error)
    return Response.json(
      {
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const productId = Number.parseInt(params.id, 10)

    const existingProduct = await sql`
      SELECT id
      FROM products
      WHERE id = ${productId}
    `

    if (existingProduct.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 })
    }

    await sql`
      DELETE FROM order_items
      WHERE product_id = ${productId}
    `

    await sql`
      DELETE FROM products
      WHERE id = ${productId}
    `

    return Response.json({ success: true, message: "Product deleted successfully" })
  } catch (error) {
    console.error("[products] Failed to delete product:", error)
    return Response.json(
      {
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
