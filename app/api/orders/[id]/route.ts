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

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const orderId = params.id
    const body = await request.json()
    const { status, subtotal, tax, discount, total, items } = body

    console.log(`[v0] Updating order ${orderId}`, body)

    // If only status is provided, just update the status
    if (status && !subtotal && !items) {
      const result = await sql`
        UPDATE orders 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${parseInt(orderId)}
        RETURNING id, status, updated_at
      `

      if (result.length === 0) {
        return Response.json({ error: 'Order not found' }, { status: 404 })
      }

      console.log('[v0] Order status updated successfully:', result[0])
      return Response.json(result[0], { status: 200 })
    }

    // Full order update (for billing corrections)
    const result = await sql`
      UPDATE orders 
      SET 
        subtotal = COALESCE(${subtotal}, subtotal),
        tax = COALESCE(${tax}, tax),
        discount = COALESCE(${discount}, discount),
        total = COALESCE(${total}, total),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${parseInt(orderId)}
      RETURNING id, status, subtotal, tax, discount, total, updated_at
    `

    if (result.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await sql`DELETE FROM order_items WHERE order_id = ${parseInt(orderId)}`
      
      // Insert new items
      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
          VALUES (${parseInt(orderId)}, ${item.id || item.product_id}, ${item.quantity}, ${item.price}, ${item.total})
        `
      }
    }

    console.log('[v0] Order updated successfully:', result[0])
    return Response.json(result[0], { status: 200 })
  } catch (error) {
    console.error('[v0] Error updating order:', error)
    return Response.json(
      { 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
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
    const orderId = params.id

    console.log(`[v0] Deleting order ${orderId}`)

    const result = await sql`
      DELETE FROM orders 
      WHERE id = ${parseInt(orderId)}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Order deleted successfully')
    return Response.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[v0] Error deleting order:', error)
    return Response.json(
      { 
        error: 'Failed to delete order',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
