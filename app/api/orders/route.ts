import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const orders = await sql`
      SELECT
        o.id,
        o.customer_id,
        o.total,
        o.subtotal,
        o.tax,
        o.discount,
        o.payment_method,
        o.status,
        o.created_at,
        o.updated_at,
        c.name AS customer_name,
        c.email AS customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `

    const orderIds = orders.map((order: any) => order.id)

    let orderItems: any[] = []
    if (orderIds.length > 0) {
      orderItems = await sql`
        SELECT
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price AS price,
          oi.subtotal AS total,
          p.name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ANY(${orderIds})
      `
    }

    const itemsByOrder = orderItems.reduce((acc: Record<number, unknown[]>, item: any) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = []
      }

      acc[item.order_id].push({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
      })
      return acc
    }, {})

    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }))

    return Response.json(ordersWithItems)
  } catch (error) {
    console.error("[orders] Failed to fetch orders:", error)
    return Response.json(
      {
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
