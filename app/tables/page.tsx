"use client"

import { useRouter } from "next/navigation"
import { useTable } from "@/app/context/table-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, Edit2, X, Clock } from "lucide-react"
import { useState } from "react"

export default function TablesPage() {
  const router = useRouter()
  const { tables, selectTable, updateTableStatus } = useTable()
  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [reservedFrom, setReservedFrom] = useState<string>("")
  const [reservedTo, setReservedTo] = useState<string>("")

  const handleSelectTable = (tableId: number) => {
    selectTable(tableId)
    router.push("/pos")
  }

  const handleStatusChange = async (tableId: number, newStatus: string) => {
    if (newStatus === "reserved") {
      // For reserved status, require time selection
      if (!reservedFrom || !reservedTo) {
        alert("Please select reservation times")
        return
      }
      const fromDate = new Date(reservedFrom)
      const toDate = new Date(reservedTo)
      await updateTableStatus(tableId, newStatus, fromDate, toDate)
    } else {
      await updateTableStatus(tableId, newStatus)
    }
    setEditingTableId(null)
    setReservedFrom("")
    setReservedTo("")
  }

  const formatReservationTime = (from: string | null, to: string | null) => {
    if (!from || !to) return null
    try {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      return `${fromDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}-${toDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    } catch {
      return null
    }
  }

  const availableCount = tables.filter((t) => t.status === "available").length
  const occupiedCount = tables.filter((t) => t.status === "occupied").length
  const reservedCount = tables.filter((t) => t.status === "reserved").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed on Mobile */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Tables</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a table to start taking orders</p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="p-3 md:p-4 border-emerald-200 dark:border-emerald-800">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Available</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {availableCount}
            </p>
          </Card>
          <Card className="p-3 md:p-4 border-amber-200 dark:border-amber-800">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Occupied</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {occupiedCount}
            </p>
          </Card>
          <Card className="p-3 md:p-4 border-blue-200 dark:border-blue-800">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Reserved</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {reservedCount}
            </p>
          </Card>
        </div>

        {/* Tables Grid - Optimized for Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {tables.map((table) => (
            <div key={table.id}>
              {editingTableId === table.id ? (
                // Edit Mode - Full Dialog
                <Dialog open={editingTableId === table.id} onOpenChange={(open) => !open && setEditingTableId(null)}>
                  <DialogContent className="w-[95vw] max-w-md" description="Change table status with optional reservation time">
                    <DialogHeader>
                      <DialogTitle>Table {table.table_number} Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Status Selection */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Select Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["available", "occupied", "reserved", "maintenance"].map((status) => (
                            <Button
                              key={status}
                              variant={status === "reserved" ? "default" : "outline"}
                              onClick={() => {
                                if (status === "reserved") {
                                  // Highlight reserved option
                                } else {
                                  handleStatusChange(table.id, status)
                                }
                              }}
                              className="h-12 text-sm font-medium"
                            >
                              <div
                                className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
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
                      </div>

                      {/* Time Selection - Only for Reserved */}
                      <div className="border-t pt-4 space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Reservation Time
                        </Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm">From</Label>
                            <Input
                              type="datetime-local"
                              value={reservedFrom}
                              onChange={(e) => setReservedFrom(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">To</Label>
                            <Input
                              type="datetime-local"
                              value={reservedTo}
                              onChange={(e) => setReservedTo(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingTableId(null)
                            setReservedFrom("")
                            setReservedTo("")
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(table.id, "reserved")}
                          className="flex-1"
                        >
                          Reserve Table
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : null}

              {/* Table Card */}
              <Card
                className={`p-4 text-center cursor-pointer transition-all duration-300 relative group border-2 h-full flex flex-col justify-between ${
                  table.status === "available"
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 hover:shadow-lg hover:border-emerald-400"
                    : table.status === "occupied"
                      ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 opacity-75"
                      : table.status === "reserved"
                        ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 opacity-75"
                        : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 opacity-75"
                }`}
                onClick={() => table.status === "available" && handleSelectTable(table.id)}
              >
                {/* Table Number */}
                <div>
                  <div className="text-4xl md:text-5xl font-black text-foreground">{table.table_number}</div>

                  {/* Capacity */}
                  <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-muted-foreground mt-2">
                    <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="font-medium">{table.capacity} Seats</span>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    className={`mt-3 w-full justify-center py-1 text-xs font-bold ${
                      table.status === "available"
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                        : table.status === "occupied"
                          ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                          : table.status === "reserved"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {table.status === "available"
                      ? "Available"
                      : table.status === "occupied"
                        ? "Occupied"
                        : table.status === "reserved"
                          ? "Reserved"
                          : "Maintenance"}
                  </Badge>

                  {/* Reservation Time */}
                  {table.status === "reserved" && table.reserved_from && table.reserved_to && (
                    <p className="text-xs mt-2 text-muted-foreground font-medium">
                      {formatReservationTime(table.reserved_from, table.reserved_to)}
                    </p>
                  )}
                </div>

                {/* CTA for Available Tables */}
                {table.status === "available" && (
                  <Button
                    size="sm"
                    className="w-full mt-3 text-xs md:text-sm h-9"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectTable(table.id)
                    }}
                  >
                    Select
                  </Button>
                )}

                {/* Edit Status Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 md:h-9 md:w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTableId(table.id)
                  }}
                  title="Change status"
                >
                  <Edit2 className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

