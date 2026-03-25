import { db } from "@/app/services/database"
import { requireRole } from "@/lib/auth"

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [transactions, customers, lowStockItems] = await Promise.all([
      db.getTransactions().catch(() => []),
      db.getCustomers().catch(() => []),
      db.getLowStockItems().catch(() => []),
    ])

    const todayTransactions = transactions.filter((transaction) => {
      const transactionDate = transaction.timestamp ? new Date(transaction.timestamp) : new Date()
      transactionDate.setHours(0, 0, 0, 0)
      return transactionDate.getTime() === today.getTime()
    })

    const totalSales = Math.max(0, Number(todayTransactions.reduce((sum, transaction) => sum + (Number(transaction.total) || 0), 0)) || 0)
    const totalOrders = todayTransactions.length
    const customersToday = new Set(todayTransactions.map((transaction) => transaction.customerId).filter(Boolean)).size

    const productSales = new Map<number, { name: string; sales: number }>()
    todayTransactions.forEach((transaction) => {
      if (!Array.isArray(transaction.items)) {
        return
      }

      transaction.items.forEach((item) => {
        const existing = productSales.get(item.id) || { name: item.name, sales: 0 }
        existing.sales += Number(item.total) || 0
        productSales.set(item.id, existing)
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3)

    const recentOrders = todayTransactions
      .slice(-5)
      .reverse()
      .map((transaction) => ({
        id: transaction.id?.toString() || "unknown",
        customer: `Customer ${transaction.customerId || "Guest"}`,
        total: Number(transaction.total) || 0,
        status: "completed",
        timestamp: transaction.timestamp || new Date(),
      }))

    return Response.json({
      totalSales,
      totalOrders,
      totalCustomers: customersToday,
      lowStockItems: lowStockItems.length,
      topProducts,
      recentOrders,
      lowStockItemsList: lowStockItems.slice(0, 10),
      customerCount: customers.length,
    })
  } catch (error) {
    console.error("[admin/dashboard] Failed to load dashboard data:", error)
    return Response.json(
      {
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        lowStockItems: 0,
        topProducts: [],
        recentOrders: [],
        lowStockItemsList: [],
      },
      { status: 200 },
    )
  }
}
