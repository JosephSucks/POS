import { db } from "@/app/services/database"

export async function GET(request: Request) {
  try {
    // Always fetch TODAY data only
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    console.log(`[v0] Loading dashboard data for TODAY`)

    const [transactions, customers, lowStockItems] = await Promise.all([
      db.getTransactions().catch(e => {
        console.error('[v0] Error in getTransactions:', e)
        return []
      }),
      db.getCustomers().catch(e => {
        console.error('[v0] Error in getCustomers:', e)
        return []
      }),
      db.getLowStockItems().catch(e => {
        console.error('[v0] Error in getLowStockItems:', e)
        return []
      }),
    ])

    console.log(`[v0] Fetched ${transactions.length} transactions, ${customers.length} customers, ${lowStockItems.length} low stock items`)

    // Filter for TODAY only
    const todayTransactions = transactions.filter((t) => {
      const transactionDate = t.timestamp ? new Date(t.timestamp) : new Date()
      transactionDate.setHours(0, 0, 0, 0)
      return transactionDate.getTime() === today.getTime()
    })

    const totalSales = Math.max(0, Number(todayTransactions.reduce((sum, t) => sum + (Number(t.total) || 0), 0)) || 0)
    const totalOrders = todayTransactions.length
    
    // Count unique customers TODAY
    const customersToday = new Set(todayTransactions.map(t => t.customerId).filter(Boolean)).size

    // Top products TODAY
    const productSales = new Map<number, { name: string; sales: number }>()
    todayTransactions.forEach((transaction) => {
      if (transaction.items && Array.isArray(transaction.items)) {
        transaction.items.forEach((item) => {
          const existing = productSales.get(item.id) || { name: item.name, sales: 0 }
          existing.sales += Number(item.total) || 0
          productSales.set(item.id, existing)
        })
      }
    })

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3)

    // Recent orders TODAY
    const recentOrders = todayTransactions
      .slice(-5)
      .reverse()
      .map((t) => ({
        id: t.id?.toString() || 'unknown',
        customer: `Customer ${t.customerId || "Guest"}`,
        total: Number(t.total) || 0,
        status: "completed",
        timestamp: t.timestamp || new Date(),
      }))

    return Response.json({
      totalSales,
      totalOrders,
      totalCustomers: customersToday,
      lowStockItems: lowStockItems.length,
      topProducts,
      recentOrders,
      lowStockItemsList: lowStockItems.slice(0, 10), // Top 10 low stock items
    })
  } catch (error) {
    console.error('[v0] Error loading dashboard data:', error)
    return Response.json({
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      lowStockItems: 0,
      topProducts: [],
      recentOrders: [],
      lowStockItemsList: [],
    }, { status: 200 })
  }
}
