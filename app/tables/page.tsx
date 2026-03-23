"use client"

import { useRouter } from "next/navigation"
import { useTable } from "@/app/context/table-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export default function TablesPage() {
  const router = useRouter()
  const { tables, selectTable } = useTable()

  const handleSelectTable = (tableId: number) => {
    selectTable(tableId)
    router.push("/pos")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
      case "occupied":
        return "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
      case "reserved":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      case "maintenance":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select Table</h1>
          <p className="text-muted-foreground mt-2">Choose a table to place an order</p>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`p-6 text-center cursor-pointer transition-all duration-200 ${
                table.status === "available"
                  ? "hover:shadow-lg hover:border-primary"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => table.status === "available" && handleSelectTable(table.id)}
            >
              <div className="space-y-3">
                <div className="text-4xl font-bold">
                  {table.table_number}
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Capacity {table.capacity}</span>
                </div>
                <Badge className={getStatusColor(table.status)}>
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 pt-8 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {tables.filter((t) => t.status === "available").length}
            </p>
            <p className="text-sm text-muted-foreground">Available</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">
              {tables.filter((t) => t.status === "occupied").length}
            </p>
            <p className="text-sm text-muted-foreground">Occupied</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tables.filter((t) => t.status === "reserved").length}
            </p>
            <p className="text-sm text-muted-foreground">Reserved</p>
          </div>
        </div>
      </div>
    </div>
  )
}
