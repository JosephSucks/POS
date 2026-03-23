"use client"

import { useRouter } from "next/navigation"
import { useTable } from "@/app/context/table-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Edit2, X, ChevronRight } from "lucide-react"
import { useState } from "react"

export default function TablesPage() {
  const router = useRouter()
  const { tables, selectTable, updateTableStatus } = useTable()
  const [editingTableId, setEditingTableId] = useState<number | null>(null)

  const handleSelectTable = (tableId: number) => {
    selectTable(tableId)
    router.push("/pos")
  }

  const handleStatusChange = async (tableId: number, newStatus: string) => {
    await updateTableStatus(tableId, newStatus)
    setEditingTableId(null)
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "available":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950",
          border: "border-emerald-200 dark:border-emerald-800",
          badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300",
          hover: "hover:shadow-lg hover:border-emerald-400 dark:hover:border-emerald-600",
        }
      case "occupied":
        return {
          bg: "bg-amber-50 dark:bg-amber-950",
          border: "border-amber-200 dark:border-amber-800",
          badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
          hover: "hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700",
        }
      case "reserved":
        return {
          bg: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200 dark:border-blue-800",
          badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
          hover: "hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700",
        }
      case "maintenance":
        return {
          bg: "bg-red-50 dark:bg-red-950",
          border: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
          hover: "hover:shadow-md hover:border-red-300 dark:hover:border-red-700",
        }
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-950",
          border: "border-gray-200 dark:border-gray-800",
          badge: "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300",
          hover: "hover:shadow-md",
        }
    }
  }

  const availableCount = tables.filter((t) => t.status === "available").length
  const occupiedCount = tables.filter((t) => t.status === "occupied").length
  const reservedCount = tables.filter((t) => t.status === "reserved").length

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Table Management</h1>
          <p className="text-muted-foreground text-lg">Select a table to start taking orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          <Card className="p-4 md:p-6 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Available</p>
                <p className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {availableCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Occupied</p>
                <p className="text-3xl md:text-4xl font-bold text-amber-600 dark:text-amber-400">
                  {occupiedCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Reserved</p>
                <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {reservedCount}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tables Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Tables</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {tables.map((table) => {
              const styles = getStatusStyles(table.status)
              const isAvailable = table.status === "available"

              return (
                <div key={table.id}>
                  {editingTableId === table.id ? (
                    // Edit Mode
                    <Card className={`p-4 md:p-5 space-y-3 border-2 border-primary ${styles.bg}`}>
                      <p className="text-xs md:text-sm font-bold uppercase tracking-wide text-primary">
                        Change Status
                      </p>
                      <div className="space-y-2">
                        {["available", "occupied", "reserved", "maintenance"].map((status) => (
                          <Button
                            key={status}
                            variant={status === table.status ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs md:text-sm font-medium"
                            onClick={() => handleStatusChange(table.id, status)}
                          >
                            <div
                              className="h-2 w-2 rounded-full mr-2"
                              style={{
                                backgroundColor:
                                  status === "available"
                                    ? "#10b981"
                                    : status === "occupied"
                                      ? "#f59e0b"
                                      : status === "reserved"
                                        ? "#3b82f6"
                                        : "#ef4444",
                              }}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs md:text-sm"
                        onClick={() => setEditingTableId(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </Card>
                  ) : (
                    // Display Mode
                    <Card
                      className={`p-5 md:p-6 text-center cursor-pointer transition-all duration-300 relative group border-2 ${styles.bg} ${styles.border} ${isAvailable ? styles.hover : "opacity-70 cursor-not-allowed"}`}
                      onClick={() => isAvailable && handleSelectTable(table.id)}
                    >
                      <div className="space-y-3">
                        {/* Table Number */}
                        <div className="text-5xl md:text-6xl font-black text-foreground">
                          {table.table_number}
                        </div>

                        {/* Capacity */}
                        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">{table.capacity} Seats</span>
                        </div>

                        {/* Status Badge */}
                        <Badge className={`${styles.badge} text-xs md:text-sm font-bold w-full justify-center py-1.5`}>
                          {table.status === "available"
                            ? "Available"
                            : table.status === "occupied"
                              ? "Occupied"
                              : table.status === "reserved"
                                ? "Reserved"
                                : "Maintenance"}
                        </Badge>

                        {/* CTA for Available Tables */}
                        {isAvailable && (
                          <Button
                            size="sm"
                            className="w-full mt-2 gap-1.5 text-xs md:text-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectTable(table.id)
                            }}
                          >
                            Select Table
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      {/* Edit Status Button - Hover Visible */}
                      {!isAvailable && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 md:h-8 md:w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingTableId(table.id)
                          }}
                          title="Change status"
                        >
                          <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      )}

                      {/* Edit Status Button - Always Visible for Available Tables */}
                      {isAvailable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 md:h-8 md:w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingTableId(table.id)
                          }}
                          title="Mark table as occupied/reserved"
                        >
                          <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                      )}
                    </Card>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
