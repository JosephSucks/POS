import type { Product } from "@/app/context/cart-context"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const products = await sql`
      SELECT
        p.id,
        p.name,
        CAST(p.price AS FLOAT) AS price,
        p.image_url AS image,
        p.description,
        p.image_url,
        p.category_id,
        c.name AS category,
        p.stock,
        p.reorder_level,
        p.stock_updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `

    return Response.json(products as Product[])
  } catch (error) {
    console.error("[products] Failed to fetch products:", error)
    return Response.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { name, price, description, image_url, category_id, stock, reorder_level } = body

    if (!name || price === undefined) {
      return Response.json({ error: "Missing required fields: name and price" }, { status: 400 })
    }

    let resolvedCategoryId: number | null = null

    if (category_id !== null && category_id !== undefined && category_id !== "") {
      const numericId = Number(category_id)
      if (!Number.isNaN(numericId) && Number.isInteger(numericId)) {
        resolvedCategoryId = numericId
      } else if (typeof category_id === "string") {
        const categoryResult = await sql`
          SELECT id
          FROM categories
          WHERE LOWER(name) = LOWER(${category_id})
        `
        resolvedCategoryId = categoryResult[0]?.id || null
      }
    }

    const result = await sql`
      INSERT INTO products (name, price, description, image_url, category_id, stock, reorder_level, created_at, updated_at)
      VALUES (${name}, ${price}, ${description || null}, ${image_url || null}, ${resolvedCategoryId}, ${stock || 0}, ${reorder_level || 10}, NOW(), NOW())
      RETURNING id, name, CAST(price AS FLOAT) AS price, description, image_url, category_id, stock, reorder_level, created_at, updated_at
    `

    return Response.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[products] Failed to create product:", error)
    return Response.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
