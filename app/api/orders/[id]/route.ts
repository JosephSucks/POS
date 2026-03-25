import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const orderId = Number.parseInt(params.id, 10)
    const body = await request.json()
    const { status, subtotal, tax, discount, total, items } = body

    if (status && !subtotal && !items) {
      const result = await sql`
        UPDATE orders
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING id, status, updated_at
      `

      if (result.length === 0) {
        return Response.json({ error: "Order not found" }, { status: 404 })
      }

      return Response.json(result[0], { status: 200 })
    }

    const result = await sql`
      UPDATE orders
      SET
        subtotal = COALESCE(${subtotal}, subtotal),
        tax = COALESCE(${tax}, tax),
        discount = COALESCE(${discount}, discount),
        total = COALESCE(${total}, total),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING id, status, subtotal, tax, discount, total, updated_at
    `

    if (result.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }

    if (items && Array.isArray(items)) {
      await sql`DELETE FROM order_items WHERE order_id = ${orderId}`

      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
          VALUES (${orderId}, ${item.id || item.product_id}, ${item.quantity}, ${item.price}, ${item.total})
        `
      }
    }

    return Response.json(result[0], { status: 200 })
  } catch (error) {
    console.error("[orders] Failed to update order:", error)
    return Response.json(
      {
        error: "Failed to update order",
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
    const orderId = Number.parseInt(params.id, 10)

    const result = await sql`
      DELETE FROM orders
      WHERE id = ${orderId}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 })
    }

    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[orders] Failed to delete order:", error)
    return Response.json(
      {
        error: "Failed to delete order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
