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

export async function GET() {
  try {
    console.log('[v0] Fetching orders from database...')
    
    // Fetch orders with customer info
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
        c.name as customer_name,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `

    // Fetch order items for each order
    const orderIds = orders.map((o: any) => o.id)
    
    let orderItems: any[] = []
    if (orderIds.length > 0) {
      orderItems = await sql`
        SELECT 
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.unit_price as price,
          oi.subtotal as total,
          p.name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ANY(${orderIds})
      `
    }

    // Group items by order_id
    const itemsByOrder = orderItems.reduce((acc: any, item: any) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = []
      }
      acc[item.order_id].push({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total)
      })
      return acc
    }, {})

    // Merge items into orders
    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: itemsByOrder[order.id] || []
    }))

    console.log(`[v0] Successfully fetched ${orders.length} orders with items`)
    
    return Response.json(ordersWithItems)
  } catch (error) {
    console.error('[v0] Error fetching orders:', error)
    return Response.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
