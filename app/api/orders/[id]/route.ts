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
    const { status, subtotal, tax, discount, total } = body

    console.log(`[v0] Updating order ${orderId}:`, body)

    // Build dynamic update based on what fields are provided
    let result
    
    if (status !== undefined && subtotal === undefined) {
      // Status-only update
      result = await sql`
        UPDATE orders 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${parseInt(orderId)}
        RETURNING id, status, subtotal, tax, discount, total, updated_at
      `
    } else if (subtotal !== undefined) {
      // Full order edit (billing correction)
      result = await sql`
        UPDATE orders 
        SET 
          subtotal = ${subtotal},
          tax = ${tax},
          discount = ${discount},
          total = ${total},
          updated_at = NOW()
        WHERE id = ${parseInt(orderId)}
        RETURNING id, status, subtotal, tax, discount, total, updated_at
      `
    } else {
      return Response.json(
        { error: 'No update fields provided' },
        { status: 400 }
      )
    }

    if (result.length === 0) {
      return Response.json(
        { error: 'Order not found' },
        { status: 404 }
      )
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
