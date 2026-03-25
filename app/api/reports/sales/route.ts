import { requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    if (!startDate || !endDate) {
      return Response.json({ error: "Missing date range" }, { status: 400 })
    }

    const transactions = await sql`
      SELECT id, total, timestamp
      FROM transactions
      WHERE timestamp >= ${startDate}::timestamp AND timestamp <= ${endDate}::timestamp
      ORDER BY timestamp DESC
    `

    const productSales = await sql`
      SELECT
        p.id,
        p.name,
        COUNT(ti.id) AS quantity,
        CAST(SUM(ti.price * ti.quantity) AS FLOAT) AS revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.timestamp >= ${startDate}::timestamp AND t.timestamp <= ${endDate}::timestamp
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT 10
    `

    const totalSales = transactions.reduce((sum: number, transaction: any) => sum + (Number(transaction.total) || 0), 0)
    const totalTransactions = transactions.length

    return Response.json({
      totalSales: Number(totalSales.toFixed(2)),
      totalTransactions,
      averageTransaction: totalTransactions > 0 ? Number((totalSales / totalTransactions).toFixed(2)) : 0,
      topProducts: productSales.map((product: any) => ({
        id: product.id,
        name: product.name,
        revenue: Number(product.revenue || 0),
        quantity: Number(product.quantity || 0),
      })),
    })
  } catch (error) {
    console.error("[reports/sales] Failed to generate report:", error)
    return Response.json(
      {
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
