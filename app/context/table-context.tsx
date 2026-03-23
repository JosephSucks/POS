"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface Table {
  id: number
  table_number: number
  capacity: number
  status: "available" | "occupied" | "reserved" | "maintenance"
  current_order_id: number | null
}

interface TableContextType {
  tables: Table[]
  selectedTableId: number | null
  selectedTable: Table | null
  selectTable: (tableId: number) => void
  deselectTable: () => void
  loadTables: () => Promise<void>
  updateTableStatus: (tableId: number, status: string) => Promise<void>
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load tables and restore selected table from localStorage on mount
  useEffect(() => {
    loadTables()
    
    // Restore selected table from localStorage
    const savedTableId = localStorage.getItem("selected-table-id")
    if (savedTableId) {
      setSelectedTableId(parseInt(savedTableId, 10))
      console.log("[v0] Restored selected table from localStorage:", savedTableId)
    }
    
    setIsHydrated(true)
  }, [])

  const loadTables = async () => {
    try {
      const response = await fetch("/api/tables")
      if (!response.ok) throw new Error("Failed to load tables")
      const data = await response.json()
      setTables(data)
      console.log("[v0] Loaded tables:", data.length)
    } catch (error) {
      console.error("[v0] Error loading tables:", error)
    }
  }

  const updateTableStatus = async (tableId: number, status: string) => {
    try {
      const response = await fetch("/api/tables", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table_id: tableId, status }),
      })
      
      if (!response.ok) throw new Error("Failed to update table status")
      
      const updatedTable = await response.json()
      setTables(tables.map(t => t.id === tableId ? updatedTable : t))
      console.log("[v0] Updated table status:", tableId, status)
    } catch (error) {
      console.error("[v0] Error updating table status:", error)
    }
  }

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null

  const selectTable = (tableId: number) => {
    setSelectedTableId(tableId)
    localStorage.setItem("selected-table-id", tableId.toString())
    console.log("[v0] Selected table:", tableId)
  }

  const deselectTable = () => {
    setSelectedTableId(null)
    localStorage.removeItem("selected-table-id")
    console.log("[v0] Deselected table")
  }

  return (
    <TableContext.Provider
      value={{
        tables,
        selectedTableId,
        selectedTable,
        selectTable,
        deselectTable,
        loadTables,
        updateTableStatus,
      }}
    >
      {children}
    </TableContext.Provider>
  )
}

export function useTable() {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error("useTable must be used within TableProvider")
  }
  return context
}
