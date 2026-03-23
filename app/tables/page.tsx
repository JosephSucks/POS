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
        {/* Stats Cards - Smaller size */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md md:max-w-lg">
          <Card
            className={`rounded-xl p-3 md:p-4 border-2 border-emerald-500 overflow-hidden flex flex-col items-center justify-center aspect-square ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <p className={`text-xs font-medium text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Available
            </p>
            <p className="text-3xl md:text-4xl font-bold text-emerald-500 text-center leading-tight mt-1">{availableCount}</p>
          </Card>

          <Card
            className={`rounded-xl p-3 md:p-4 border-2 border-amber-600 overflow-hidden flex flex-col items-center justify-center aspect-square ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <p className={`text-xs font-medium text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Occupied
            </p>
            <p className="text-3xl md:text-4xl font-bold text-amber-500 text-center leading-tight mt-1">{occupiedCount}</p>
          </Card>

          <Card
            className={`rounded-xl p-3 md:p-4 border-2 border-blue-500 overflow-hidden flex flex-col items-center justify-center aspect-square ${
              isDark ? 'bg-slate-900' : 'bg-white'
            }`}
          >
            <p className={`text-xs font-medium text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Reserved
            </p>
            <p className="text-3xl md:text-4xl font-bold text-blue-500 text-center leading-tight mt-1">{reservedCount}</p>
          </Card>
        </div>

        {/* Tables Section */}
        <div>
          <h2 className={`text-xl md:text-2xl font-semibold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            Your Tables
          </h2>

          {/* Table Grid - Responsive */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
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
                    // Table Card Display - Improved Design
                    <Card
                      className={`rounded-lg md:rounded-xl p-3 md:p-4 border-2 h-full flex flex-col justify-between overflow-hidden ${
                        getTableCardBorder(table.status)
                      } ${
                        isDark
                          ? 'bg-slate-900/50'
                          : 'bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Header: Table Number and Edit Button */}
                        <div className="flex items-start justify-between">
                          <div className="text-2xl md:text-3xl font-black text-foreground">{table.table_number}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTableId(table.id)}
                            className={`h-7 w-7 md:h-8 md:w-8 rounded-md flex-shrink-0 ${
                              isDark
                                ? 'text-slate-400'
                                : 'text-slate-600'
                            }`}
                          >
                            <Edit2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </Button>
                        </div>

                        {/* Capacity */}
                        <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                          <Users className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                          <span className="font-medium">{table.capacity} Seats</span>
                        </div>

                        {/* Status Badge - No hover effects */}
                        <Badge className={`${getStatusBadgeColor(table.status)} text-xs font-semibold px-2.5 md:px-3 py-1 rounded-full w-fit truncate`}>
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
                          className="w-full mt-2.5 text-xs md:text-sm h-8 md:h-9 rounded-lg"
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
