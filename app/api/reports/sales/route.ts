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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    if (!startDate || !endDate) {
      return Response.json({ error: 'Missing date range' }, { status: 400 })
    }

    console.log(`[v0] Generating sales report from ${startDate} to ${endDate}`)

    // Get transaction data within date range
    const transactions = await sql`
      SELECT 
        id,
        total,
        timestamp
      FROM transactions
      WHERE timestamp >= $1::timestamp AND timestamp <= $2::timestamp
      ORDER BY timestamp DESC
    `

    // Get product sales data
    const productSales = await sql`
      SELECT 
        p.id,
        p.name,
        COUNT(ti.id) as quantity,
        CAST(SUM(ti.price * ti.quantity) AS FLOAT) as revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.timestamp >= $1::timestamp AND t.timestamp <= $2::timestamp
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `

    const totalSales = transactions.reduce((sum: number, t: any) => sum + (Number(t.total) || 0), 0)
    const totalTransactions = transactions.length

    const reportData = {
      totalSales: Number(totalSales.toFixed(2)),
      totalTransactions,
      averageTransaction: totalTransactions > 0 ? Number((totalSales / totalTransactions).toFixed(2)) : 0,
      topProducts: productSales.map((p: any) => ({
        id: p.id,
        name: p.name,
        revenue: Number(p.revenue || 0),
        quantity: Number(p.quantity || 0),
      })),
    }

    console.log(`[v0] Sales report generated: ${reportData.totalSales} total sales from ${reportData.totalTransactions} transactions`)

    return Response.json(reportData)
  } catch (error) {
    console.error('[v0] Error generating sales report:', error)
    return Response.json(
      {
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
