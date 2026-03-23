'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Moon, Sun, Settings as SettingsIcon } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
  theme: 'light' | 'dark'
  onThemeChange: () => void
}

export function SettingsModal({
  open,
  onOpenChange,
  isAdmin,
  theme,
  onThemeChange,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md" description="Application settings and preferences">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Section - Admin Only */}
          {isAdmin && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Dark Mode</Label>
                <div className="flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-400" />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onThemeChange}
                    className="w-20"
                  >
                    {theme === 'light' ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Admin-only setting. Changes apply to all users.
              </p>
            </div>
          )}

          {!isAdmin && (
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Only administrators can modify settings.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
