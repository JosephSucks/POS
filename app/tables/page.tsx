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
import { Users, Clock, Settings, Moon, Sun, Edit2 } from 'lucide-react'
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

  const getTableBorderColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-emerald-500/50 dark:border-emerald-500/40'
      case 'occupied':
        return 'border-amber-600/50 dark:border-amber-600/40'
      case 'reserved':
        return 'border-blue-500/50 dark:border-blue-500/40'
      case 'maintenance':
        return 'border-red-600/50 dark:border-red-600/40'
      default:
        return 'border-gray-400/50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500/20 text-emerald-400 dark:bg-emerald-600/30'
      case 'occupied':
        return 'bg-amber-600/20 text-amber-500 dark:bg-amber-700/30'
      case 'reserved':
        return 'bg-blue-500/20 text-blue-400 dark:bg-blue-600/30'
      case 'maintenance':
        return 'bg-red-600/20 text-red-400 dark:bg-red-700/30'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const availableCount = tables.filter((t) => t.status === 'available').length
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-white dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">Tables</h1>
            <p className="text-slate-400 mt-1">Select a table to start taking orders</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleTheme()}
              className="rounded-lg border-slate-600 hover:bg-slate-700/50 h-10 w-10"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-400" />
              )}
            </Button>

            {/* Admin Settings Button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/admin')}
                className="rounded-lg border-slate-600 hover:bg-slate-700/50 h-10 w-10"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Card className="border-emerald-500/50 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Available</p>
                <p className="text-4xl font-bold text-emerald-400 mt-2">{availableCount}</p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Users className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="border-amber-600/50 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Occupied</p>
                <p className="text-4xl font-bold text-amber-500 mt-2">{occupiedCount}</p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-amber-600/20 flex items-center justify-center">
                <Users className="h-7 w-7 text-amber-500" />
              </div>
            </div>
          </Card>

          <Card className="border-blue-500/50 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Reserved</p>
                <p className="text-4xl font-bold text-blue-400 mt-2">{reservedCount}</p>
              </div>
              <div className="h-14 w-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Your Tables Section */}
        <h2 className="text-2xl font-bold text-slate-200 mb-6">Your Tables</h2>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.id}>
              {editingTableId === table.id ? (
                // Edit Dialog
                <Dialog open={editingTableId === table.id} onOpenChange={(open) => !open && setEditingTableId(null)}>
                  <DialogContent className="w-[95vw] max-w-md bg-slate-900 border-slate-700" description="Change table status and reservation time">
                    <DialogHeader>
                      <DialogTitle className="text-xl text-slate-200">Edit Table {table.table_number}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                      {/* Status Selection */}
                      <div className="space-y-3">
                        <Label className="text-slate-300 font-semibold">Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['available', 'occupied', 'reserved', 'maintenance'] as const).map((status) => (
                            <Button
                              key={status}
                              onClick={() => {
                                if (status !== 'reserved') {
                                  handleStatusChange(table.id, status)
                                }
                              }}
                              className={`h-11 rounded-lg font-medium transition-all ${
                                table.status === status
                                  ? status === 'available'
                                    ? 'bg-emerald-500/50 border-emerald-400 text-emerald-300'
                                    : status === 'occupied'
                                      ? 'bg-amber-600/50 border-amber-400 text-amber-300'
                                      : status === 'reserved'
                                        ? 'bg-blue-500/50 border-blue-400 text-blue-300'
                                        : 'bg-red-600/50 border-red-400 text-red-300'
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                              variant={table.status === status ? 'default' : 'outline'}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Reservation Time - Only for Reserved */}
                      <div className="border-t border-slate-700 pt-5 space-y-3">
                        <Label className="text-slate-300 font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Reservation Time
                        </Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-slate-400">From</Label>
                            <Input
                              type="datetime-local"
                              value={reservedFrom}
                              onChange={(e) => setReservedFrom(e.target.value)}
                              className="mt-1 bg-slate-800 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-400">To</Label>
                            <Input
                              type="datetime-local"
                              value={reservedTo}
                              onChange={(e) => setReservedTo(e.target.value)}
                              className="mt-1 bg-slate-800 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 border-t border-slate-700 pt-5">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingTableId(null)
                            setReservedFrom('')
                            setReservedTo('')
                          }}
                          className="flex-1 border-slate-600 hover:bg-slate-700/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(table.id, 'reserved')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
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
                className={`relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer group ${getTableBorderColor(
                  table.status
                )} ${
                  table.status === 'available'
                    ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 hover:shadow-lg hover:shadow-emerald-500/20'
                    : table.status === 'occupied'
                      ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 opacity-75'
                      : table.status === 'reserved'
                        ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 opacity-75'
                        : 'bg-gradient-to-br from-slate-900/80 to-slate-800/50 opacity-75'
                }`}
              >
                {/* Table Number */}
                <div className="text-5xl font-black text-white mb-3">{table.table_number}</div>

                {/* Capacity */}
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{table.capacity} Seats</span>
                </div>

                {/* Status Badge */}
                <Badge className={`${getStatusColor(table.status)} font-semibold mb-2 text-sm px-3 py-1 rounded-full`}>
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
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {formatReservationTime(table.reserved_from, table.reserved_to)}
                  </p>
                )}

                {/* Select Button - Only for Available */}
                {table.status === 'available' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectTable(table.id)
                    }}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  >
                    Select
                  </Button>
                )}

                {/* Edit Button - Always Visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingTableId(table.id)
                  }}
                  className="absolute top-3 right-3 h-9 w-9 bg-slate-800/50 hover:bg-slate-700 rounded-lg opacity-100 group-hover:bg-slate-600 transition-all"
                >
                  <Edit2 className="h-4 w-4 text-slate-300" />
                </Button>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
