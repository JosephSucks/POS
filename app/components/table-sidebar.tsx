"use client"

import { useTable } from "@/app/context/table-context"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import ReserveTableModal from "./reserve-table-modal"
import ReservationDetailsModal from "./reservation-details-modal"
import { Clock, X } from "lucide-react"

export default function TableSidebar() {
  const { currentTableId, tables, loading, selectTable, deselectTable, unreserveTable } = useTable()
  const [showMobileSheet, setShowMobileSheet] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ tableId: number; x: number; y: number } | null>(null)
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [selectedTableForReserve, setSelectedTableForReserve] = useState<{ id: number; name: string } | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedTableForDetails, setSelectedTableForDetails] = useState<number | null>(null)
  const [countdowns, setCountdowns] = useState<Record<number, string>>({})

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<number, string> = {}
      tables.forEach((table) => {
        if (table.status === "reserved" && table.reserved_to) {
          const now = new Date()
          const endTime = new Date(table.reserved_to)
          const diffMs = endTime.getTime() - now.getTime()

          if (diffMs > 0) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60))
            const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            newCountdowns[table.id] = `${hours}h ${minutes}m`
          }
        }
      })
      setCountdowns(newCountdowns)
    }, 1000)

    return () => clearInterval(interval)
  }, [tables])

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 text-emerald-900 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-800 dark:hover:border-emerald-700 dark:text-emerald-100"
      case "occupied":
        return "bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 opacity-60 cursor-not-allowed dark:bg-red-950 dark:border-red-800 dark:text-red-200"
      case "reserved":
        return "bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 text-amber-900 opacity-75 cursor-not-allowed dark:bg-amber-950 dark:hover:bg-amber-900 dark:border-amber-800 dark:hover:border-amber-700 dark:text-amber-100"
      default:
        return "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 dark:bg-gray-950 dark:hover:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
    }
  }

  const TableGrid = () => (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 w-full">
      {tables.map((table) => (
        <div key={table.id} className="relative w-full h-auto">
          <button
            onClick={() => {
              if (table.status === "available") {
                if (currentTableId === table.id) {
                  deselectTable()
                } else {
                  selectTable(table.id)
                }
              }
              setShowMobileSheet(false)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu({ tableId: table.id, x: e.clientX, y: e.clientY })
            }}
            disabled={table.status === "occupied"}
            className={`w-full aspect-square rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md ${getStatusColor(
              table.status
            )} ${
              table.status === "available" ? "hover:scale-105 active:scale-95" : ""
            } ${
              currentTableId === table.id
                ? "ring-2 ring-offset-1 ring-blue-500 shadow-lg"
                : ""
            }`}
            title={
              table.status === "reserved"
                ? `Reserved${table.reserved_for_customer_name ? ` by ${table.reserved_for_customer_name}` : ""}`
                : undefined
            }
          >
            <span className="text-base font-bold">T{table.table_number}</span>
            <span className="text-xs font-semibold opacity-80">{table.status.charAt(0).toUpperCase()}</span>
          </button>

          {/* Context Menu (Desktop) */}
          {contextMenu?.tableId === table.id && (
            <div
              className="fixed top-0 left-0 z-50 min-w-max bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
              style={{
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {table.status === "available" && (
                <>
                  <button
                    onClick={() => {
                      selectTable(table.id)
                      setContextMenu(null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 rounded-t-lg"
                  >
                    Select Table
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTableForReserve({ id: table.id, name: `T${table.table_number}` })
                      setReserveModalOpen(true)
                      setContextMenu(null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-200"
                  >
                    Reserve Table
                  </button>
                </>
              )}

              {table.status === "reserved" && (
                <>
                  <button
                    onClick={() => {
                      setSelectedTableForDetails(table.id)
                      setDetailsModalOpen(true)
                      setContextMenu(null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700 rounded-t-lg"
                  >
                    View Details
                  </button>
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Reserved{table.reserved_for_customer_name ? ` by ${table.reserved_for_customer_name}` : ""}
                    </div>
                    {table.reserved_for_customer_phone && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">{table.reserved_for_customer_phone}</div>
                    )}
                    {countdowns[table.id] && (
                      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                        Time left: {countdowns[table.id]}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      unreserveTable(table.id)
                      setContextMenu(null)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-b-lg"
                  >
                    Cancel Reservation
                  </button>
                </>
              )}

              {table.status === "occupied" && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 rounded-lg">
                  Table is currently occupied
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  if (loading && tables.length === 0) {
    return (
      <>
        {/* Desktop */}
        <div className="hidden md:block border-gray-200 dark:border-gray-700 px-3 py-2">
          <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">Tables</h3>
          <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
            Loading tables...
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Button
            onClick={() => setShowMobileSheet(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {currentTableId ? `📍 Table ${tables.find((t) => t.id === currentTableId)?.table_number}` : "📍 Select Table"}
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block border-gray-200 dark:border-gray-700">
        <h3 className="px-4 py-3 font-semibold text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">Tables</h3>
        {loading ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground px-4">
            Loading tables...
          </div>
        ) : tables.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-xs text-muted-foreground px-4">
            No tables available
          </div>
        ) : (
          <>
            <div className="overflow-y-auto max-h-72 px-3 py-3">
              <div className="w-full">
                <TableGrid />
              </div>
            </div>
            {currentTableId && tables.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30">
                ✓ Table {tables.find((t) => t.id === currentTableId)?.table_number} selected
              </div>
            )}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              Right-click table for options
            </div>
          </>
        )}
      </div>

      {/* Mobile Version - Button + Sheet */}
      <div className="md:hidden px-4 py-2">
        <Button
          onClick={() => setShowMobileSheet(true)}
          disabled={loading}
          className={`w-full transition-all text-sm font-semibold py-2 ${
            currentTableId
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          } text-white`}
        >
          {loading ? "📍 Loading tables..." : currentTableId
            ? `✓ Table ${tables.find((t) => t.id === currentTableId)?.table_number} Selected`
            : "📍 Select Table"}
        </Button>
      </div>

      {/* Mobile Sheet Modal */}
      <Sheet open={showMobileSheet} onOpenChange={setShowMobileSheet}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-lg flex flex-col">
          <SheetHeader className="mb-3 flex-shrink-0">
            <SheetTitle>Select a Table</SheetTitle>
          </SheetHeader>
          {tables.length === 0 ? (
            <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
              No tables available
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 px-1 -mx-6 px-6">
              <div className="grid grid-cols-3 gap-1.5 pb-8">
                {tables.map((table) => (
                   <div key={table.id} className="flex flex-col gap-1.5 w-full h-auto">
                    <button
                      onClick={() => {
                        if (table.status === "available") {
                          if (currentTableId === table.id) {
                            deselectTable()
                          } else {
                            selectTable(table.id)
                          }
                        }
                        setShowMobileSheet(false)
                      }}
                      disabled={table.status === "occupied"}
                      className={`w-full aspect-square rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md ${getStatusColor(
                        table.status
                      )} ${
                        table.status === "available" ? "active:scale-95" : ""
                      } ${
                        currentTableId === table.id
                          ? "ring-2 ring-offset-1 ring-blue-500 shadow-lg"
                          : ""
                      }`}
                      title={
                        table.status === "reserved"
                          ? `Reserved${table.reserved_for_customer_name ? ` by ${table.reserved_for_customer_name}` : ""}`
                          : undefined
                      }
                    >
                      <span className="text-base font-bold">T{table.table_number}</span>
                      <span className="text-xs font-semibold opacity-80">{table.status.charAt(0).toUpperCase()}</span>
                    </button>
                    
                    {/* Mobile Action Buttons */}
                    {table.status === "available" && (
                      <button
                        onClick={() => {
                          setSelectedTableForReserve({ id: table.id, name: `T${table.table_number}` })
                          setReserveModalOpen(true)
                        }}
                        className="text-xs px-2 py-1.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:from-amber-500 active:to-amber-600 text-white rounded-md font-semibold transition-all shadow-sm hover:shadow-md"
                      >
                        Reserve
                      </button>
                    )}
                    {table.status === "reserved" && (
                      <button
                        onClick={() => unreserveTable(table.id)}
                        className="text-xs px-2 py-1.5 bg-gradient-to-b from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 active:from-red-500 active:to-red-600 text-white rounded-md font-semibold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reserve Table Modal */}
      {selectedTableForReserve && (
        <ReserveTableModal
          isOpen={reserveModalOpen}
          onClose={() => {
            setReserveModalOpen(false)
            setSelectedTableForReserve(null)
          }}
          tableId={selectedTableForReserve.id}
          tableName={selectedTableForReserve.name}
        />
      )}

      {/* Reservation Details Modal */}
      {selectedTableForDetails && (
        <ReservationDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false)
            setSelectedTableForDetails(null)
          }}
          table={tables.find((t) => t.id === selectedTableForDetails)}
        />
      )}
    </>
  )
}
