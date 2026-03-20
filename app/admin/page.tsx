"use client"

import { useState, useEffect } from "react"
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Eye,
  BarChart3,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface InventoryItem {
  id: number
  name: string
  stock: number
  lowStockThreshold: number
}

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  lowStockItems: number
  topProducts: Array<{
    id: number
    name: string
    sales: number
  }>
  recentOrders: Array<{
    id: string
    customer: string
    total: number
    status: string
    timestamp: Date
  }>
  lowStockItemsList: InventoryItem[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('[v0] Fetching TODAY dashboard data')
      const response = await fetch('/api/admin/dashboard')
      
      console.log('[v0] Dashboard response status:', response.status)
      
      if (!response.ok) {
        console.error('[v0] Dashboard API returned status:', response.status)
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      console.log('[v0] Dashboard data received:', data)
      
      if (!data) {
        throw new Error('No data returned from API')
      }
      
      setStats(data)
      setError(null)
    } catch (err) {
      console.error("[v0] Failed to load dashboard data:", err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard'
      setError(errorMsg)
      setStats({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        lowStockItems: 0,
        topProducts: [],
        recentOrders: [],
        lowStockItemsList: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Today's Overview</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        {error && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <p className="text-amber-900 font-medium">Could not fully load dashboard</p>
              <p className="text-sm text-amber-700 mt-2">{error}</p>
              <Button onClick={loadDashboardData} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        {error && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <p className="text-amber-900 font-medium">Could not fully load dashboard</p>
              <p className="text-sm text-amber-700 mt-2">{error}</p>
              <Button onClick={loadDashboardData} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Today's Overview</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* KPI Cards - TODAY ONLY */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total revenue today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Transactions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique customers</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.lowStockItems}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Items need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Action: Low Stock Items */}
      {stats.lowStockItemsList && stats.lowStockItemsList.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Low Stock Items - Action Required</span>
              <Badge variant="destructive">{stats.lowStockItemsList.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockItemsList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded border border-amber-200 dark:border-amber-900">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Stock: {item.stock} / Threshold: {item.lowStockThreshold}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/admin/products')}
                    className="gap-1"
                  >
                    Reorder
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {stats.lowStockItemsList.length > 10 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/products')}
                >
                  View All Low Stock Items ({stats.lowStockItems} total)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products Today */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products - Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.length > 0 ? (
                stats.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">${product.sales.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sales yet today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Today */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders - Today</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/admin/orders')}
            >
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${order.total.toFixed(2)}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No orders yet today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button 
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/admin/products')}
            >
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => router.push('/admin/orders')}
            >
              <ShoppingCart className="h-6 w-6" />
              View Orders
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => router.push('/admin/customers')}
            >
              <Users className="h-6 w-6" />
              Manage Customers
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2 bg-transparent"
              onClick={() => router.push('/admin/analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
