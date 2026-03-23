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
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)

  const loadTables = async () => {
    try {
      const response = await fetch("/api/tables")
      if (!response.ok) throw new Error("Failed to load tables")
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error("[v0] Error loading tables:", error)
    }
  }

  useEffect(() => {
    loadTables()
  }, [])

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null

  const selectTable = (tableId: number) => {
    setSelectedTableId(tableId)
    console.log("[v0] Selected table:", tableId)
  }

  const deselectTable = () => {
    setSelectedTableId(null)
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
