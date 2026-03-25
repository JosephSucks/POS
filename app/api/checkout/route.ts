import type { Transaction } from "@/app/services/database"
import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const transaction: Transaction = await request.json()

    for (const item of transaction.items) {
      const productCheck = await sql`
        SELECT stock
        FROM products
        WHERE id = ${item.id}
      `

      if (!productCheck.length) {
        return Response.json({ error: `Product ${item.id} not found` }, { status: 400 })
      }

      const currentStock = productCheck[0].stock
      if (currentStock < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for product. Available: ${currentStock}, Requested: ${item.quantity}` },
          { status: 400 },
        )
      }
    }

    const initialStatus = transaction.paymentMethod === "cash" ? "completed" : "pending"

    const orderResult = await sql`
      INSERT INTO orders (customer_id, employee_id, subtotal, discount, tax, total, payment_method, status)
      VALUES (
        ${transaction.customerId || null},
        ${auth.user.id},
        ${transaction.subtotal},
        ${transaction.discount},
        ${transaction.tax},
        ${transaction.total},
        ${transaction.paymentMethod},
        ${initialStatus}
      )
      RETURNING id
    `

    const orderId = orderResult[0].id

    for (const item of transaction.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
        VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.total})
      `

      await sql`
        UPDATE products
        SET stock = GREATEST(0, stock - ${item.quantity}), stock_updated_at = NOW()
        WHERE id = ${item.id}
      `
    }

    if (transaction.customerId) {
      await sql`
        UPDATE customers
        SET
          total_spent = COALESCE(total_spent, 0) + ${transaction.total},
          loyalty_points = COALESCE(loyalty_points, 0) + ${Math.floor(transaction.total)},
          updated_at = NOW()
        WHERE id = ${transaction.customerId}
      `
    }

    return Response.json({ success: true, orderId }, { status: 200 })
  } catch (error) {
    console.error("[checkout] Failed to save transaction:", error)
    return Response.json({ error: "Failed to save transaction" }, { status: 500 })
  }
}
