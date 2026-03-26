"use client"

import { useTable } from "@/app/context/table-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export default function TableSidebar() {
  const { currentTableId, tables, selectTable, deselectTable } = useTable()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 hover:bg-green-200 border-green-300"
      case "occupied":
        return "bg-red-100 hover:bg-red-200 border-red-300 cursor-not-allowed"
      case "reserved":
        return "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 cursor-not-allowed"
      default:
        return "bg-gray-100 hover:bg-gray-200 border-gray-300"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="border-t pt-4">
      <h3 className="mb-3 font-semibold text-sm text-gray-700">Tables</h3>
      <ScrollArea className="h-40 w-full rounded-md border p-2">
        <div className="grid grid-cols-3 gap-2">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => {
                if (table.status === "available") {
                  if (currentTableId === table.id) {
                    deselectTable()
                  } else {
                    selectTable(table.id)
                  }
                }
              }}
              disabled={table.status !== "available"}
              className={`flex flex-col items-center justify-center p-2 rounded border transition-colors ${getStatusColor(
                table.status
              )} ${currentTableId === table.id ? "ring-2 ring-blue-500" : ""}`}
            >
              <span className="text-sm font-semibold text-gray-800">
                T{table.table_number}
              </span>
              <span className="text-xs text-gray-600">{table.capacity} seats</span>
              <Badge className={`mt-1 text-xs ${getStatusBadgeColor(table.status)}`}>
                {table.status}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
      {currentTableId && (
        <div className="mt-2 text-xs text-blue-600 font-medium">
          Selected: Table {tables.find((t) => t.id === currentTableId)?.table_number}
        </div>
      )}
    </div>
  )
}
