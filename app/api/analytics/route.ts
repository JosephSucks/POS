import { requireAuth } from "@/lib/auth"
import { canAccessAdmin } from "@/lib/access-control"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  // Check if user has admin access (includes managers with temporary access)
  const hasAccess = await canAccessAdmin(auth.user)
  if (!hasAccess) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "30d"
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30

    const now = new Date()
    const currentPeriodStart = new Date(now)
    currentPeriodStart.setDate(currentPeriodStart.getDate() - days)

    const previousPeriodStart = new Date(currentPeriodStart)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

    const [currentMetrics, previousMetrics, customerCount, guestSpending, customerSpending, topProducts, previousPeriodProducts, salesByCategory, revenueByDay] = await Promise.all([
      sql`
        SELECT
          COALESCE(SUM(total), 0) AS revenue,
          COUNT(*) AS order_count,
          COALESCE(AVG(total), 0) AS avg_order_value
        FROM orders
        WHERE created_at >= ${currentPeriodStart.toISOString()}
      `,
      sql`
        SELECT
          COALESCE(SUM(total), 0) AS revenue,
          COUNT(*) AS order_count,
          COALESCE(AVG(total), 0) AS avg_order_value
        FROM orders
        WHERE created_at >= ${previousPeriodStart.toISOString()}
          AND created_at < ${currentPeriodStart.toISOString()}
      `,
      sql`SELECT COUNT(*) AS count FROM customers`,
      sql`
        SELECT
          COALESCE(SUM(total), 0) AS guest_revenue,
          COUNT(*) AS guest_orders
        FROM orders
        WHERE customer_id IS NULL
          AND created_at >= ${currentPeriodStart.toISOString()}
      `,
      sql`
        SELECT
          COALESCE(SUM(total), 0) AS customer_revenue,
          COUNT(*) AS customer_orders
        FROM orders
        WHERE customer_id IS NOT NULL
          AND created_at >= ${currentPeriodStart.toISOString()}
      `,
      sql`
        SELECT
          p.id,
          p.name,
          COALESCE(SUM(oi.subtotal), 0) AS revenue,
          COALESCE(SUM(oi.quantity), 0) AS quantity
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= ${currentPeriodStart.toISOString()}
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 5
      `,
      sql`
        SELECT
          p.id,
          COALESCE(SUM(oi.subtotal), 0) AS revenue
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id
          AND o.created_at >= ${previousPeriodStart.toISOString()}
          AND o.created_at < ${currentPeriodStart.toISOString()}
        GROUP BY p.id
      `,
      sql`
        SELECT
          COALESCE(c.name, 'Uncategorized') AS category,
          COALESCE(SUM(oi.subtotal), 0) AS revenue
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= ${currentPeriodStart.toISOString()}
        GROUP BY c.name
        ORDER BY revenue DESC
      `,
      sql`
        SELECT
          DATE(created_at) AS date,
          COALESCE(SUM(total), 0) AS revenue
        FROM orders
        WHERE created_at >= ${currentPeriodStart.toISOString()}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ])

    const previousProductMap = new Map<number, number>()
    previousPeriodProducts.forEach((product: any) => {
      previousProductMap.set(product.id, Number(product.revenue) || 0)
    })

    const currentRevenue = Number(currentMetrics[0]?.revenue) || 0
    const previousRevenue = Number(previousMetrics[0]?.revenue) || 0
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    const currentOrders = Number(currentMetrics[0]?.order_count) || 0
    const previousOrders = Number(previousMetrics[0]?.order_count) || 0
    const ordersGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0

    const currentAvgOrder = Number(currentMetrics[0]?.avg_order_value) || 0
    const previousAvgOrder = Number(previousMetrics[0]?.avg_order_value) || 0
    const avgOrderGrowth = previousAvgOrder > 0 ? ((currentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100 : 0

    const totalCategoryRevenue = salesByCategory.reduce((sum: number, category: any) => sum + Number(category.revenue), 0)
    const totalCustomers = Number(customerCount[0]?.count) || 0

    return Response.json({
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: revenueGrowth,
      },
      orders: {
        current: currentOrders,
        previous: previousOrders,
        growth: ordersGrowth,
      },
      customers: {
        current: totalCustomers,
        previous: Math.max(1, totalCustomers - 5),
        growth: 10,
      },
      avgOrderValue: {
        current: currentAvgOrder,
        previous: previousAvgOrder,
        growth: avgOrderGrowth,
      },
      topProducts: topProducts.map((product: any) => {
        const currentProductRevenue = Number(product.revenue) || 0
        const previousProductRevenue = previousProductMap.get(product.id) || 0
        const productGrowth = previousProductRevenue > 0
          ? ((currentProductRevenue - previousProductRevenue) / previousProductRevenue) * 100
          : currentProductRevenue > 0
            ? 100
            : 0

        return {
          id: product.id,
          name: product.name,
          revenue: currentProductRevenue,
          quantity: Number(product.quantity) || 0,
          growth: productGrowth,
        }
      }),
      salesByCategory: salesByCategory.map((category: any) => ({
        category: category.category,
        revenue: Number(category.revenue) || 0,
        percentage: totalCategoryRevenue > 0 ? (Number(category.revenue) / totalCategoryRevenue) * 100 : 0,
      })),
      revenueByDay: revenueByDay.map((day: any) => ({
        date: day.date,
        revenue: Number(day.revenue) || 0,
      })),
      customerSegments: [
        { segment: "New Customers", count: Math.floor(totalCustomers * 0.3), percentage: 30, revenue: currentRevenue * 0.2 },
        { segment: "Regular Customers", count: Math.floor(totalCustomers * 0.5), percentage: 50, revenue: currentRevenue * 0.6 },
        { segment: "VIP Customers", count: Math.floor(totalCustomers * 0.2), percentage: 20, revenue: currentRevenue * 0.2 },
      ],
      spendingBreakdown: {
        guest: {
          revenue: Number(guestSpending[0]?.guest_revenue) || 0,
          orders: Number(guestSpending[0]?.guest_orders) || 0,
        },
        registered: {
          revenue: Number(customerSpending[0]?.customer_revenue) || 0,
          orders: Number(customerSpending[0]?.customer_orders) || 0,
        },
      },
    })
  } catch (error) {
    console.error("[analytics] Failed to fetch analytics:", error)
    return Response.json(
      {
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
