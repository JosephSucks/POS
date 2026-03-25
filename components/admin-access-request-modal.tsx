"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface AdminAccessRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason?: string) => Promise<void>
  isLoading?: boolean
  error?: string | null
  success?: boolean
}

export function AdminAccessRequestModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  success = false,
}: AdminAccessRequestModalProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = async () => {
    await onSubmit(reason || undefined)
    if (!error) {
      setReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Admin Access</DialogTitle>
          <DialogDescription>
            Request temporary access to the admin panel for 1 hour. An admin will review and approve or deny your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Your access request has been submitted. Admins will review it shortly.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter a brief reason for requesting admin access..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading || success}
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">{reason.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading || success}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || success}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success ? "Request Submitted" : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
