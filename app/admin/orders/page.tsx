"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Printer, RefreshCw, Calendar, DollarSign, Package, MoreHorizontal, CreditCard, Banknote, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { db, type Transaction } from "../../services/database"

interface OrderDetails extends Transaction {
  customerName?: string
  customerEmail?: string
  status?: string
}

const orderStatuses = [
  { value: "pending", label: "Pending", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-800 border-purple-200" },
]
export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDetails[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<OrderDetails | null>(null)
  const [editFormData, setEditFormData] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    items: [] as Array<{ id: number; name: string; quantity: number; price: number; total: number }>
  })

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

const loadOrders = async () => {
  try {
    // Fetch from orders table instead of transactions
    const response = await fetch('/api/orders')
    const data = await response.json()

    console.log('[v0] Orders API response:', data)

    const ordersArray = Array.isArray(data) ? data : data.orders || data.data || []

    const ordersWithCustomerInfo: OrderDetails[] = ordersArray.map((order: any) => ({
      ...order,
      id: order.id,
      receiptNumber: String(order.id),
      total: order.total || 0,
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      items: order.items || [],
      timestamp: new Date(order.created_at || Date.now()),
      customerName: order.customer_name || `Customer ${order.customer_id || 'Guest'}`,
      customerEmail: order.customer_email || '',
      paymentMethod: order.payment_method || 'cash',
      status: order.status || 'pending',
    }))

    setOrders(ordersWithCustomerInfo.reverse())
  } catch (error) {
    console.error('[v0] Error loading orders:', error)
  }
}

  const filterOrders = () => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      // Filter by actual order status
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const getOrderStatus = (order: OrderDetails) => {
    return order.status || 'pending'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = orderStatuses.find((s) => s.value === status)
    return statusConfig || orderStatuses[0]
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      console.log(`[v0] Updating order ${orderId} status to ${newStatus}`)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Reload orders to reflect the change
      await loadOrders()
      console.log('[v0] Order status updated successfully')
    } catch (error) {
      console.error('[v0] Error updating order status:', error)
    }
  }

  const handleViewOrder = (order: OrderDetails) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  const handleEditOrder = (order: OrderDetails) => {
    setEditingOrder(order)
    setEditFormData({
      subtotal: Number(order.subtotal) || 0,
      tax: Number(order.tax) || 0,
      discount: Number(order.discount) || 0,
      total: Number(order.total) || 0,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total)
      }))
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
    
    try {
      const response = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtotal: editFormData.subtotal,
          tax: editFormData.tax,
          discount: editFormData.discount,
          total: editFormData.total,
          items: editFormData.items
        }),
      })

      if (!response.ok) throw new Error('Failed to update order')
      
      await loadOrders()
      setShowEditModal(false)
      setEditingOrder(null)
    } catch (error) {
      console.error('[v0] Error updating order:', error)
      alert('Failed to update order')
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete order')
      
      await loadOrders()
    } catch (error) {
      console.error('[v0] Error deleting order:', error)
      alert('Failed to delete order')
    }
  }

  const updateItemQuantity = (index: number, newQuantity: number) => {
    const newItems = [...editFormData.items]
    newItems[index].quantity = newQuantity
    newItems[index].total = newItems[index].price * newQuantity
    
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const newTax = newSubtotal * 0.1
    const newTotal = newSubtotal + newTax - editFormData.discount
    
    setEditFormData({
      ...editFormData,
      items: newItems,
      subtotal: newSubtotal,
      tax: newTax,
      total: newTotal
    })
  }

  const updateItemPrice = (index: number, newPrice: number) => {
    const newItems = [...editFormData.items]
    newItems[index].price = newPrice
    newItems[index].total = newPrice * newItems[index].quantity
    
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const newTax = newSubtotal * 0.1
    const newTotal = newSubtotal + newTax - editFormData.discount
    
    setEditFormData({
      ...editFormData,
      items: newItems,
      subtotal: newSubtotal,
      tax: newTax,
      total: newTotal
    })
  }

  const removeItem = (index: number) => {
    const newItems = editFormData.items.filter((_, i) => i !== index)
    const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0)
    const newTax = newSubtotal * 0.1
    const newTotal = newSubtotal + newTax - editFormData.discount
    
    setEditFormData({
      ...editFormData,
      items: newItems,
      subtotal: newSubtotal,
      tax: newTax,
      total: newTotal
    })
  }

  const updateDiscount = (newDiscount: number) => {
    const newTotal = editFormData.subtotal + editFormData.tax - newDiscount
    setEditFormData({
      ...editFormData,
      discount: newDiscount,
      total: newTotal
    })
  }

  const handlePrintReceipt = (order: OrderDetails) => {
    // Create a printable receipt window
    const receiptWindow = window.open('', '_blank', 'width=400,height=600')
    if (!receiptWindow) {
      alert('Please allow pop-ups to print receipts')
      return
    }
    
    const itemsHtml = order.items.map(item => 
      `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span>${item.name} × ${item.quantity}</span>
        <span>$${Number(item.total).toFixed(2)}</span>
      </div>`
    ).join('')
    
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${order.receiptNumber}</title>
        <style>
          body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 10px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .bold { font-weight: bold; }
          .center { text-align: center; }
          .small { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>POS Receipt</h1>
        <p class="center small">Order #${order.receiptNumber}</p>
        <p class="center small">${formatDate(order.timestamp)}</p>
        <div class="divider"></div>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <div class="divider"></div>
        ${itemsHtml || '<p class="center small">No items</p>'}
        <div class="divider"></div>
        <div class="row"><span>Subtotal</span><span>$${Number(order.subtotal).toFixed(2)}</span></div>
        <div class="row"><span>Tax</span><span>$${Number(order.tax).toFixed(2)}</span></div>
        ${order.discount > 0 ? `<div class="row"><span>Discount</span><span>-$${Number(order.discount).toFixed(2)}</span></div>` : ''}
        <div class="divider"></div>
        <div class="row bold"><span>Total</span><span>$${Number(order.total).toFixed(2)}</span></div>
        <div class="divider"></div>
        <p class="center small">Thank you for your purchase!</p>
        <script>window.print(); window.onafterprint = function() { window.close(); }</script>
      </body>
      </html>
    `)
    receiptWindow.document.close()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage and track all orders</p>
        </div>
        <Button onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold mt-1">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold mt-1">${(orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)).toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{orders.filter((order) => order.status === "pending").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {
                orders.filter((order) => {
                  const today = new Date().toDateString()
                  return new Date(order.timestamp).toDateString() === today
                }).length
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table - Desktop Only */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-2">Order ID</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-1">Items</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {filteredOrders.map((order) => {
                  const status = getOrderStatus(order)
                  const statusConfig = getStatusBadge(status)

                  return (
                    <div key={order.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50">
                      <div className="col-span-2">
                        <p className="font-medium">#{order.receiptNumber}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {order.paymentMethod === 'card' ? (
                            <CreditCard className="h-3 w-3" />
                          ) : (
                            <Banknote className="h-3 w-3" />
                          )}
                          <span className="capitalize">{order.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium">{order.customerName}</p>
                        {order.customerEmail && <p className="text-xs text-muted-foreground">{order.customerEmail}</p>}
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">{formatDate(order.timestamp)}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-sm">{order.items.length}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-medium">${Number(order.total).toFixed(2)}</p>
                        {order.discount > 0 && (
                          <p className="text-xs text-green-600">-${Number(order.discount).toFixed(2)} discount</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        {/* All orders can have status changed with color-coded dropdown */}
                        <Select value={status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                          <SelectTrigger className={`w-full border ${statusConfig.color}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <span className={`px-2 py-0.5 rounded text-sm ${s.color}`}>{s.label}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Order
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintReceipt(order)}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No orders found</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Cards - Mobile Only */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const status = getOrderStatus(order)
            const statusConfig = getStatusBadge(status)
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-base">Order #{order.receiptNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-lg">${Number(order.total).toFixed(2)}</p>
                        {order.discount > 0 && (
                          <p className="text-xs text-green-600">-${Number(order.discount).toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{formatDate(order.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Items</p>
                        <p className="font-medium">{order.items.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs">
                        {order.paymentMethod === 'card' ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <Banknote className="h-4 w-4" />
                        )}
                        <span className="capitalize">{order.paymentMethod}</span>
                      </div>
                      <Select value={status} onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}>
                        <SelectTrigger className={`flex-1 h-8 text-xs ${statusConfig.color}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              <span className={`px-2 py-0.5 rounded text-sm ${s.color}`}>{s.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePrintReceipt(order)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteOrder(order.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
