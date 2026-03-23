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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, Edit2, Clock } from "lucide-react"
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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4 md:p-6">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Tables</h1>
        <p className="text-sm text-muted-foreground mt-1">Select a table to start taking orders</p>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 p-3 md:p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs md:text-sm text-emerald-700 dark:text-emerald-300 font-medium">Available</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">{availableCount}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30 p-3 md:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs md:text-sm text-amber-700 dark:text-amber-300 font-medium">Occupied</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-300 mt-1">{occupiedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium">Reserved</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-300 mt-1">{reservedCount}</p>
          </div>
        </div>

        {/* Tables Grid - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {tables.map((table) => {
            const isAvailable = table.status === "available"
            const isOccupied = table.status === "occupied"
            const isReserved = table.status === "reserved"
            const isMaintenance = table.status === "maintenance"

            return (
              <div key={table.id}>
                {editingTableId === table.id ? (
                  <Dialog open={true} onOpenChange={(open) => !open && setEditingTableId(null)}>
                    <DialogContent className="w-[90vw] max-w-sm" description="Change table status">
                      <DialogHeader>
                        <DialogTitle>Table {table.table_number}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {/* Status Selection */}
                        <div className="space-y-3">
                          <Label className="text-sm font-semibold">Select Status</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: "available", label: "Available", color: "#10b981" },
                              { value: "occupied", label: "Occupied", color: "#f59e0b" },
                              { value: "reserved", label: "Reserved", color: "#3b82f6" },
                              { value: "maintenance", label: "Maintenance", color: "#ef4444" },
                            ].map((status) => (
                              <button
                                key={status.value}
                                onClick={() => {
                                  if (status.value !== "reserved") {
                                    handleStatusChange(table.id, status.value)
                                  }
                                }}
                                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center gap-2 justify-center ${
                                  table.status === status.value
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: status.color }}
                                />
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Time Selection for Reserved */}
                        <div className="border-t pt-4 space-y-3">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Reservation Time
                          </Label>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">From</Label>
                              <Input
                                type="datetime-local"
                                value={reservedFrom}
                                onChange={(e) => setReservedFrom(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">To</Label>
                              <Input
                                type="datetime-local"
                                value={reservedTo}
                                onChange={(e) => setReservedTo(e.target.value)}
                                className="mt-1 text-sm"
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
                            className="flex-1 text-sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(table.id, "reserved")}
                            className="flex-1 text-sm"
                          >
                            Reserve
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}

                {/* Table Card */}
                <Card
                  className={`p-4 md:p-5 text-center transition-all duration-300 relative group border-2 h-full flex flex-col justify-between ${
                    isAvailable
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 hover:shadow-lg hover:border-emerald-400 dark:hover:border-emerald-600"
                      : isOccupied
                        ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 opacity-75 cursor-not-allowed"
                        : isReserved
                          ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 opacity-75 cursor-not-allowed"
                          : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 opacity-75 cursor-not-allowed"
                  }`}
                >
                  {/* Content */}
                  <div>
                    {/* Table Number */}
                    <div className="text-4xl md:text-5xl font-black text-foreground">{table.table_number}</div>

                    {/* Capacity */}
                    <div className="flex items-center justify-center gap-1 text-xs md:text-sm text-muted-foreground mt-2">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-medium">{table.capacity} Seats</span>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      className={`mt-3 w-full justify-center py-1 text-xs font-bold ${
                        isAvailable
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                          : isOccupied
                            ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                            : isReserved
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {isAvailable
                        ? "Available"
                        : isOccupied
                          ? "Occupied"
                          : isReserved
                            ? "Reserved"
                            : "Maintenance"}
                    </Badge>

                    {/* Reservation Time */}
                    {isReserved && table.reserved_from && table.reserved_to && (
                      <p className="text-xs mt-2 text-muted-foreground font-medium">
                        {formatReservationTime(table.reserved_from, table.reserved_to)}
                      </p>
                    )}
                  </div>

                  {/* Select Button - Only for Available */}
                  {isAvailable && (
                    <Button
                      size="sm"
                      className="w-full mt-4 text-xs md:text-sm font-semibold"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectTable(table.id)
                      }}
                    >
                      Select
                    </Button>
                  )}

                  {/* Edit Status Button - Corner Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTableId(table.id)
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Change status"
                  >
                    <Edit2 className="h-4 w-4 md:h-5 md:w-5 text-foreground/70" />
                  </button>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
