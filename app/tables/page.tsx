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
import { SettingsModal } from '@/components/settings-modal'
import { Users, Clock, Settings, ChevronRight, Zap } from 'lucide-react'
import { useState } from 'react'

export default function TablesPage() {
  const router = useRouter()
  const { tables, selectTable, updateTableStatus } = useTable()
  const { theme, toggleTheme, mounted } = useTheme()
  const [editingTableId, setEditingTableId] = useState<number | null>(null)
  const [reservedFrom, setReservedFrom] = useState<string>('')
  const [reservedTo, setReservedTo] = useState<string>('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const isAdmin = true // In real app, check user role from context/auth

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

  const availableCount = tables.filter((t) => t.status === 'available').length
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length
  const reservedCount = tables.filter((t) => t.status === 'reserved').length

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
      {/* Header with Settings */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-background/80 dark:bg-slate-950/80 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Tables
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select a table to start taking orders
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="rounded-full h-10 w-10 hover:bg-primary/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card className="p-4 md:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-200 dark:bg-emerald-800/50 flex items-center justify-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  Available
                </p>
                <p className="text-2xl md:text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  {availableCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-200 dark:bg-amber-800/50 flex items-center justify-center">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  Occupied
                </p>
                <p className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-400">
                  {occupiedCount}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">
                  Reserved
                </p>
                <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {reservedCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tables Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-muted-foreground">
            Your Tables
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {tables.map((table) => (
              <div key={table.id}>
                {editingTableId === table.id ? (
                  <Dialog
                    open={editingTableId === table.id}
                    onOpenChange={(open) => !open && setEditingTableId(null)}
                  >
                    <DialogContent className="w-[90vw] max-w-md" description="Change table status and reservation time">
                      <DialogHeader>
                        <DialogTitle>Table {table.table_number}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Status Selection */}
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">
                            Status
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {['available', 'occupied', 'reserved', 'maintenance'].map(
                              (status) => (
                                <Button
                                  key={status}
                                  variant={
                                    status === 'reserved' ? 'default' : 'outline'
                                  }
                                  onClick={() => {
                                    if (status !== 'reserved') {
                                      handleStatusChange(table.id, status)
                                    }
                                  }}
                                  className="h-10 text-xs md:text-sm"
                                >
                                  <div
                                    className="h-2 w-2 rounded-full mr-1.5 flex-shrink-0"
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
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </Button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Time Selection */}
                        <div className="border-t pt-4 space-y-3">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Reservation Time
                          </Label>
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs md:text-sm">From</Label>
                              <Input
                                type="datetime-local"
                                value={reservedFrom}
                                onChange={(e) =>
                                  setReservedFrom(e.target.value)
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm">To</Label>
                              <Input
                                type="datetime-local"
                                value={reservedTo}
                                onChange={(e) =>
                                  setReservedTo(e.target.value)
                                }
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
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
                          <Button
                            onClick={() =>
                              handleStatusChange(table.id, 'reserved')
                            }
                            className="flex-1"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : null}

                {/* Table Card */}
                <Card
                  className={`p-4 md:p-5 text-center h-full flex flex-col justify-between cursor-pointer transition-all duration-300 border-2 group ${
                    table.status === 'available'
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-300 dark:border-emerald-700 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-600'
                      : table.status === 'occupied'
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-300 dark:border-amber-700 opacity-75'
                        : table.status === 'reserved'
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-300 dark:border-blue-700 opacity-75'
                          : 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/20 border-red-300 dark:border-red-700 opacity-75'
                  }`}
                >
                  {/* Table Number */}
                  <div className="space-y-2">
                    <div className="text-4xl md:text-5xl font-black">
                      {table.table_number}
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span className="font-medium">{table.capacity}</span>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      className={`w-full justify-center py-1 text-xs font-bold ${
                        table.status === 'available'
                          ? 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300'
                          : table.status === 'occupied'
                            ? 'bg-amber-200 dark:bg-amber-800/60 text-amber-700 dark:text-amber-300'
                            : table.status === 'reserved'
                              ? 'bg-blue-200 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300'
                              : 'bg-red-200 dark:bg-red-800/60 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {table.status === 'available'
                        ? 'Available'
                        : table.status === 'occupied'
                          ? 'Occupied'
                          : table.status === 'reserved'
                            ? 'Reserved'
                            : 'Maintenance'}
                    </Badge>

                    {/* Reservation Time */}
                    {table.status === 'reserved' &&
                      table.reserved_from &&
                      table.reserved_to && (
                        <p className="text-xs md:text-xs text-muted-foreground font-medium mt-2">
                          {formatReservationTime(
                            table.reserved_from,
                            table.reserved_to
                          )}
                        </p>
                      )}
                  </div>

                  {/* Select Button */}
                  {table.status === 'available' && (
                    <Button
                      size="sm"
                      className="w-full mt-3 gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs md:text-sm h-9"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectTable(table.id)
                      }}
                    >
                      Select <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {/* Edit Status Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingTableId(table.id)
                    }}
                    title="Change status"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        isAdmin={isAdmin}
        theme={theme}
        onThemeChange={toggleTheme}
      />
    </div>
  )
}
