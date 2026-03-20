import { neon } from '@neondatabase/serverless'
import type { Transaction } from "@/app/services/database"

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

export async function POST(request: Request) {
  try {
    const transaction: Transaction = await request.json()

    console.log('[v0] Saving transaction:', transaction)
    console.log('[v0] Customer ID being saved:', transaction.customerId)

    // Create order - cash payments are completed immediately, card payments need manual processing
    const initialStatus = transaction.paymentMethod === 'cash' ? 'completed' : 'pending'
    
    const orderResult = await sql`
      INSERT INTO orders (customer_id, subtotal, discount, tax, total, payment_method, status)
      VALUES (
        ${transaction.customerId || null},
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

    // Add order items
    for (const item of transaction.items) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
        VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.total})
      `

      // Update product stock
      await sql`
        UPDATE products 
        SET stock = stock - ${item.quantity}, stock_updated_at = NOW()
        WHERE id = ${item.id}
      `
    }

    // Update customer total_spent if customer_id exists
    if (transaction.customerId) {
      await sql`
        UPDATE customers 
        SET total_spent = COALESCE(total_spent, 0) + ${transaction.total},
            loyalty_points = COALESCE(loyalty_points, 0) + ${Math.floor(transaction.total)},
            updated_at = NOW()
        WHERE id = ${transaction.customerId}
      `
      console.log('[v0] Updated customer spending for customer ID:', transaction.customerId)
    }

    console.log('[v0] Transaction saved with order ID:', orderId)

    return Response.json({ success: true, orderId }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error saving transaction:', error)
    return Response.json({ error: 'Failed to save transaction' }, { status: 500 })
  }
}
