'use client'

import { useRouter } from 'next/navigation'
import { useTable } from '@/app/context/table-context'
import { useTheme } from '@/hooks/use-theme'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Clock, Settings, Moon, Sun, Edit2, X } from 'lucide-react'
import { useState } from 'react'

export default function TablesPage() {
  const router = useRouter()
  const { tables, selectTable, updateTableStatus } = useTable()
  const { theme, toggleTheme, mounted } = useTheme()
  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [reservedFrom, setReservedFrom] = useState<string>('')
  const [reservedTo, setReservedTo] = useState<string>('')
  const isAdmin = true

  const handleSelectTable = (tableId: number) => {
    selectTable(tableId)
    router.push('/pos')
  }

  const handleStatusChange = async (tableId: number, newStatus: string) => {
    if (newStatus === 'reserved') {
      if (!reservedFrom || !reservedTo) {
        alert('Please select reservation times')
        return
      }
      const fromDate = new Date(reservedFrom)
      const toDate = new Date(reservedTo)
      await updateTableStatus(tableId, newStatus, fromDate, toDate)
    } else {
      await updateTableStatus(tableId, newStatus)
    }
    setEditingTableId(null)
    setReservedFrom('')
    setReservedTo('')
  }

  const formatReservationTime = (from: string | null, to: string | null) => {
    if (!from || !to) return null
    try {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      return `${fromDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}-${toDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    } catch {
      return null
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const isDark = theme === 'dark'
    switch (status) {
      case 'available':
        return isDark ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50' : 'bg-emerald-200 text-emerald-800 border-emerald-300'
      case 'occupied':
        return isDark ? 'bg-amber-600/30 text-amber-300 border-amber-600/50' : 'bg-amber-200 text-amber-800 border-amber-300'
      case 'reserved':
        return isDark ? 'bg-blue-500/30 text-blue-300 border-blue-500/50' : 'bg-blue-200 text-blue-800 border-blue-300'
      case 'maintenance':
        return isDark ? 'bg-red-600/30 text-red-300 border-red-600/50' : 'bg-red-200 text-red-800 border-red-300'
      default:
        return isDark ? 'bg-gray-500/30 text-gray-300' : 'bg-gray-200 text-gray-800'
    }
  }

  const getTableCardBorder = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-emerald-500/50'
      case 'occupied':
        return 'border-amber-600/50'
      case 'reserved':
        return 'border-blue-500/50'
      case 'maintenance':
        return 'border-red-600/50'
      default:
        return 'border-slate-300/50'
    }
  }

  const availableCount = tables.filter((t) => t.status === 'available').length
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Header */}
      <div
        className={`border-b sticky top-0 z-20 backdrop-blur-sm ${
          isDark
            ? 'border-slate-700/50 bg-slate-900/50'
            : 'border-slate-200 bg-slate-50/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-500">Tables</h1>
            <p className={`text-sm md:text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select a table to start taking orders
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleTheme()}
              className={`rounded-lg h-9 w-9 md:h-10 md:w-10 ${
                isDark
                  ? 'border-slate-600 hover:bg-slate-700/50'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
              )}
            </Button>

            {/* Admin Settings Button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/admin')}
                className={`rounded-lg h-9 w-9 md:h-10 md:w-10 ${
                  isDark
                    ? 'border-slate-600 hover:bg-slate-700/50 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Settings className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Stats Cards - Consistent styling */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <Card
            className={`rounded-lg md:rounded-xl p-5 md:p-6 border-2 border-emerald-500 overflow-hidden ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <p className={`text-xs md:text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Available
            </p>
            <p className="text-4xl md:text-5xl font-bold text-emerald-500 leading-none">{availableCount}</p>
          </Card>

          <Card
            className={`rounded-lg md:rounded-xl p-5 md:p-6 border-2 border-amber-600 overflow-hidden ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <p className={`text-xs md:text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Occupied
            </p>
            <p className="text-4xl md:text-5xl font-bold text-amber-500 leading-none">{occupiedCount}</p>
          </Card>

          <Card
            className={`rounded-lg md:rounded-xl p-5 md:p-6 border-2 border-blue-500 overflow-hidden ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <p className={`text-xs md:text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Reserved
            </p>
            <p className="text-4xl md:text-5xl font-bold text-blue-500 leading-none">{reservedCount}</p>
          </Card>
        </div>

        {/* Tables Section */}
        <div>
          <h2 className={`text-xl md:text-2xl font-semibold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            Your Tables
          </h2>

          {/* Table Grid - Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {tables.map((table) => {
              const isAvailable = table.status === 'available'

              return (
                <div key={table.id}>
                  {editingTableId === table.id ? (
                    // Edit Modal
                    <Dialog open={editingTableId === table.id} onOpenChange={(open) => !open && setEditingTableId(null)}>
                      <DialogContent
                        className={`w-[95vw] max-w-md rounded-xl ${
                          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                        }`}
                        description="Change table status and set reservation times"
                      >
                        <DialogHeader>
                          <DialogTitle className={isDark ? 'text-white' : 'text-slate-900'}>
                            Table {table.table_number} Status
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Status Selection */}
                          <div className="space-y-2">
                            <Label className="text-base font-semibold">Select Status</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {['available', 'occupied', 'reserved', 'maintenance'].map((status) => (
                                <Button
                                  key={status}
                                  variant={status === 'reserved' ? 'default' : 'outline'}
                                  onClick={() => {
                                    if (status !== 'reserved') {
                                      handleStatusChange(table.id, status)
                                    }
                                  }}
                                  className={`h-11 text-sm font-medium rounded-lg ${
                                    isDark && status !== 'reserved' ? 'bg-slate-800 hover:bg-slate-700 border-slate-600' : ''
                                  }`}
                                >
                                  <div
                                    className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                                    style={{
                                      backgroundColor:
                                        status === 'available'
                                          ? '#10b981'
                                          : status === 'occupied'
                                            ? '#f59e0b'
                                            : status === 'reserved'
                                              ? '#3b82f6'
                                              : '#ef4444',
                                    }}
                                  />
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {/* Time Selection for Reserved */}
                          <div className="border-t pt-4 space-y-3" style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}>
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
                                  className={`mt-1 rounded-lg ${isDark ? 'bg-slate-800 border-slate-600' : ''}`}
                                />
                              </div>
                              <div>
                                <Label className="text-sm">To</Label>
                                <Input
                                  type="datetime-local"
                                  value={reservedTo}
                                  onChange={(e) => setReservedTo(e.target.value)}
                                  className={`mt-1 rounded-lg ${isDark ? 'bg-slate-800 border-slate-600' : ''}`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-4 border-t" style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingTableId(null)
                                setReservedFrom('')
                                setReservedTo('')
                              }}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button onClick={() => handleStatusChange(table.id, 'reserved')} className="flex-1">
                              Reserve Table
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    // Table Card Display
                    <Card
                      className={`rounded-lg md:rounded-xl p-4 md:p-5 border-2 h-full flex flex-col justify-between relative group transition-all ${
                        getTableCardBorder(table.status)
                      } ${
                        isDark
                          ? 'bg-slate-900/50 hover:bg-slate-900/70'
                          : 'bg-slate-50/50 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Table Number */}
                        <div className="text-3xl md:text-4xl font-black text-foreground">{table.table_number}</div>

                        {/* Capacity */}
                        <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="font-medium">{table.capacity} Seats</span>
                        </div>

                        {/* Status Badge */}
                        <Badge className={`${getStatusBadgeColor(table.status)} text-xs md:text-sm font-bold px-4 py-2 rounded-full`}>
                          {table.status === 'available'
                            ? 'Available'
                            : table.status === 'occupied'
                              ? 'Occupied'
                              : table.status === 'reserved'
                                ? 'Reserved'
                                : 'Maintenance'}
                        </Badge>

                        {/* Reservation Time */}
                        {table.status === 'reserved' && table.reserved_from && table.reserved_to && (
                          <p className="text-xs text-muted-foreground/70 font-medium">{formatReservationTime(table.reserved_from, table.reserved_to)}</p>
                        )}
                      </div>

                      {/* Select Button for Available Tables */}
                      {isAvailable && (
                        <Button
                          size="sm"
                          onClick={() => handleSelectTable(table.id)}
                          className="w-full mt-3 text-xs md:text-sm h-9 rounded-lg"
                        >
                          Select
                        </Button>
                      )}

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingTableId(table.id)}
                        className={`absolute top-2 right-2 h-8 w-8 md:h-9 md:w-9 rounded-lg ${
                          isDark
                            ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200'
                            : 'hover:bg-slate-200/50 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Edit2 className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
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
