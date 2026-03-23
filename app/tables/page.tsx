'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Edit2, Moon, Sun, Settings } from 'lucide-react'
import { useTheme } from '@/app/components/theme-provider'

interface Table {
  id: string
  table_number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  reserved_from?: string
  reserved_to?: string
}

export default function TablesPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (!response.ok) throw new Error('Failed to fetch tables')
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTable = (tableId: string) => {
    router.push(`/pos?tableId=${tableId}`)
  }

  const handleUpdateStatus = async (tableId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) throw new Error('Failed to update table')
      setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus as any } : t))
      setEditingTableId(null)
      setEditStatus('')
    } catch (error) {
      console.error('Error updating table:', error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const isDark = theme === 'dark'
    switch (status) {
      case 'available':
        return isDark ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
      case 'occupied':
        return isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-amber-100 text-amber-700 border border-amber-300'
      case 'reserved':
        return isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-blue-100 text-blue-700 border border-blue-300'
      case 'maintenance':
        return isDark ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-red-100 text-red-700 border border-red-300'
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400 border border-gray-500/40' : 'bg-gray-100 text-gray-700 border border-gray-300'
    }
  }

  const getTableCardBorder = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-emerald-500'
      case 'occupied':
        return 'border-amber-600'
      case 'reserved':
        return 'border-blue-500'
      case 'maintenance':
        return 'border-red-500'
      default:
        return 'border-gray-300'
    }
  }

  const formatReservationTime = (from: string, to: string) => {
    const fromDate = new Date(from).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    const toDate = new Date(to).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${fromDate}-${toDate}`
  }

  const availableCount = tables.filter(t => t.status === 'available').length
  const occupiedCount = tables.filter(t => t.status === 'occupied').length
  const reservedCount = tables.filter(t => t.status === 'reserved').length

  if (loading) return <div className="p-6">Loading tables...</div>

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">Tables</h1>
            <p className={`text-sm md:text-base ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Select a table to start taking orders
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-lg">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 max-w-sm">
          <Card className={`rounded-xl p-3 md:p-4 border-2 border-emerald-500 overflow-hidden flex flex-col items-center justify-center aspect-square ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-xs font-medium text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Available</p>
            <p className="text-3xl md:text-4xl font-bold text-emerald-500 text-center leading-tight mt-1">{availableCount}</p>
          </Card>

          <Card className={`rounded-xl p-3 md:p-4 border-2 border-amber-600 overflow-hidden flex flex-col items-center justify-center aspect-square ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-xs font-medium text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Occupied</p>
            <p className="text-3xl md:text-4xl font-bold text-amber-500 text-center leading-tight mt-1">{occupiedCount}</p>
          </Card>

          <Card className={`rounded-xl p-3 md:p-4 border-2 border-blue-500 overflow-hidden flex flex-col items-center justify-center aspect-square ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
            <p className={`text-xs font-medium text-center ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Reserved</p>
            <p className="text-3xl md:text-4xl font-bold text-blue-500 text-center leading-tight mt-1">{reservedCount}</p>
          </Card>
        </div>

        {/* Your Tables Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Your Tables</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
            {tables.map((table) => {
              const isAvailable = table.status === 'available'
              const isEditing = editingTableId === table.id

              return (
                <div key={table.id}>
                  {isEditing ? (
                    <Card className={`rounded-lg md:rounded-xl p-3 md:p-4 border-2 space-y-3 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <Select value={editStatus} onValueChange={setEditStatus}>
                        <SelectTrigger className="text-xs md:text-sm">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(table.id, editStatus)}
                        className="w-full text-xs md:text-sm h-8"
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTableId(null)}
                        className="w-full text-xs md:text-sm h-8"
                      >
                        Cancel
                      </Button>
                    </Card>
                  ) : (
                    <Card className={`rounded-lg md:rounded-xl p-2.5 md:p-3 border-2 flex flex-col justify-between h-40 md:h-48 ${getTableCardBorder(table.status)} ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
                      {/* Compact Header */}
                      <div className="flex items-center justify-between gap-1 flex-shrink-0">
                        <div className="text-xl md:text-2xl font-black leading-none">{table.table_number}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTableId(table.id)
                            setEditStatus(table.status)
                          }}
                          className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0"
                        >
                          <Edit2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        </Button>
                      </div>

                      {/* Middle Content - Scrollable if needed */}
                      <div className="flex flex-col gap-1 min-h-0 flex-1 overflow-y-auto">
                        {/* Capacity - Minimal Spacing */}
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground flex-shrink-0">
                          <Users className="h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0" />
                          <span className="font-medium">{table.capacity} Seats</span>
                        </div>

                        {/* Status Badge - Compact */}
                        <Badge className={`${getStatusBadgeColor(table.status)} text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full inline-block self-center flex-shrink-0`}>
                          {table.status === 'available'
                            ? 'Available'
                            : table.status === 'occupied'
                              ? 'Occupied'
                              : table.status === 'reserved'
                                ? 'Reserved'
                                : 'Maintenance'}
                        </Badge>

                        {/* Reservation Time - Only if Reserved */}
                        {table.status === 'reserved' && table.reserved_from && table.reserved_to && (
                          <p className="text-xs text-muted-foreground/60 font-medium text-center leading-tight flex-shrink-0">{formatReservationTime(table.reserved_from, table.reserved_to)}</p>
                        )}
                      </div>

                      {/* Select Button - Fixed at Bottom */}
                      {isAvailable && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectTable(table.id)}
                          className="w-full text-xs md:text-sm h-6 md:h-7 rounded-md flex-shrink-0"
                        >
                          Select
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
