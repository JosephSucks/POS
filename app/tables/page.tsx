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

  const getTableStyles = (status: string) => {
    const isDark = theme === 'dark'
    const baseStyles = 'min-h-48 flex flex-col justify-between rounded-xl border-2 p-4 md:p-6 transition-all duration-300'
    
    switch (status) {
      case 'available':
        return `${baseStyles} ${isDark ? 'border-emerald-500/50 bg-slate-900/40' : 'border-emerald-500/60 bg-emerald-50/30'}`
      case 'occupied':
        return `${baseStyles} ${isDark ? 'border-amber-600/50 bg-slate-900/40' : 'border-amber-600/60 bg-amber-50/30'}`
      case 'reserved':
        return `${baseStyles} ${isDark ? 'border-blue-500/50 bg-slate-900/40' : 'border-blue-500/60 bg-blue-50/30'}`
      case 'maintenance':
        return `${baseStyles} ${isDark ? 'border-red-600/50 bg-slate-900/40' : 'border-red-600/60 bg-red-50/30'}`
      default:
        return baseStyles
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const isDark = theme === 'dark'
    switch (status) {
      case 'available':
        return isDark ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-200 text-emerald-800'
      case 'occupied':
        return isDark ? 'bg-amber-600/30 text-amber-300' : 'bg-amber-200 text-amber-800'
      case 'reserved':
        return isDark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-200 text-blue-800'
      case 'maintenance':
        return isDark ? 'bg-red-600/30 text-red-300' : 'bg-red-200 text-red-800'
      default:
        return isDark ? 'bg-gray-500/30 text-gray-300' : 'bg-gray-200 text-gray-800'
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
        isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Header */}
      <div
        className={`border-b sticky top-0 z-20 backdrop-blur-sm ${
          isDark
            ? 'border-slate-700/50 bg-slate-900/50'
            : 'border-slate-200 bg-white/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-500">Tables</h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Select a table to start taking orders
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleTheme()}
              className={`rounded-lg h-10 w-10 ${
                isDark
                  ? 'border-slate-600 hover:bg-slate-700/50'
                  : 'border-slate-300 hover:bg-slate-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600" />
              )}
            </Button>

            {/* Admin Settings Button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/admin')}
                className={`rounded-lg h-10 w-10 ${
                  isDark
                    ? 'border-slate-600 hover:bg-slate-700/50 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card
            className={`rounded-xl p-6 border-2 border-emerald-500/50 ${
              isDark ? 'bg-slate-900/40' : 'bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Available
                </p>
                <p className="text-3xl font-bold text-emerald-500 mt-2">{availableCount}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-500 opacity-50" />
            </div>
          </Card>

          <Card
            className={`rounded-xl p-6 border-2 border-amber-600/50 ${
              isDark ? 'bg-slate-900/40' : 'bg-amber-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Occupied
                </p>
                <p className="text-3xl font-bold text-amber-500 mt-2">{occupiedCount}</p>
              </div>
              <Users className="h-8 w-8 text-amber-600 opacity-50" />
            </div>
          </Card>

          <Card
            className={`rounded-xl p-6 border-2 border-blue-500/50 ${
              isDark ? 'bg-slate-900/40' : 'bg-blue-50/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Reserved
                </p>
                <p className="text-3xl font-bold text-blue-500 mt-2">{reservedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Tables Grid */}
        <div>
          <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Your Tables
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <div key={table.id}>
                {editingTableId === table.id ? (
                  <Dialog open={editingTableId === table.id} onOpenChange={(open) => !open && setEditingTableId(null)}>
                    <DialogContent
                      className={`w-[95vw] max-w-md rounded-xl ${
                        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                      }`}
                      description="Change table status with optional reservation time"
                    >
                      <DialogHeader>
                        <DialogTitle className={isDark ? 'text-white' : 'text-slate-900'}>
                          Table {table.table_number} Status
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Status Selection */}
                        <div className="space-y-3">
                          <Label className={`text-base font-semibold block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            Select Status
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            {['available', 'occupied', 'reserved', 'maintenance'].map((status) => (
                              <Button
                                key={status}
                                variant={status === editingTableId ? 'default' : 'outline'}
                                onClick={() => {
                                  if (status === 'reserved') {
                                    // Show time selection
                                  } else {
                                    handleStatusChange(table.id, status)
                                  }
                                }}
                                className={`h-12 text-sm font-medium ${
                                  isDark
                                    ? 'border-slate-600 hover:bg-slate-800'
                                    : 'border-slate-300 hover:bg-slate-50'
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

                        {/* Time Selection */}
                        <div className={`border-t pt-6 space-y-3 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                          <Label className={`text-base font-semibold flex items-center gap-2 block ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <Clock className="h-4 w-4" />
                            Reservation Time
                          </Label>
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm">From</Label>
                              <Input
                                type="datetime-local"
                                value={reservedFrom}
                                onChange={(e) => setReservedFrom(e.target.value)}
                                className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">To</Label>
                              <Input
                                type="datetime-local"
                                value={reservedTo}
                                onChange={(e) => setReservedTo(e.target.value)}
                                className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingTableId(null)
                              setReservedFrom('')
                              setReservedTo('')
                            }}
                            className={`flex-1 ${isDark ? 'border-slate-600 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(table.id, 'reserved')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            Reserve Table
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}

                {/* Table Card */}
                <Card className={`${getTableStyles(table.status)} cursor-pointer group relative`}>
                  <div className="space-y-3 flex-1">
                    {/* Table Number */}
                    <div className="text-5xl md:text-6xl font-black">{table.table_number}</div>

                    {/* Capacity */}
                    <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{table.capacity} Seats</span>
                    </div>

                    {/* Status Badge */}
                    <Badge className={`${getStatusBadgeColor(table.status)} w-fit text-xs font-bold px-3 py-1`}>
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
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {formatReservationTime(table.reserved_from, table.reserved_to)}
                      </p>
                    )}
                  </div>

                  {/* Edit Button - Always Visible */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8 opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTableId(table.id)
                    }}
                    title="Change status"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  {/* Select Button */}
                  {table.status === 'available' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectTable(table.id)
                      }}
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Select
                    </Button>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
