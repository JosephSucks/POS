"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminAccessRequestModal } from "@/components/admin-access-request-modal"
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react"

interface AccessStatus {
  status: "idle" | "loading" | "submitting" | "submitted" | "error"
  error: string | null
  expiresAt: string | null
  minutesRemaining: number | null
}

interface AdminAccessRequestButtonProps {
  controlEnabled: boolean
  currentStatus?: "pending" | "approved" | "denied" | null
  expiresAt?: string | null
}

export function AdminAccessRequestButton({
  controlEnabled,
  currentStatus = null,
  expiresAt = null,
}: AdminAccessRequestButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [status, setStatus] = useState<AccessStatus>({
    status: "idle",
    error: null,
    expiresAt: expiresAt,
    minutesRemaining: null,
  })

  // Calculate minutes remaining and update every minute
  useEffect(() => {
    if (!status.expiresAt) return

    const updateMinutes = () => {
      const expires = new Date(status.expiresAt!).getTime()
      const now = Date.now()
      const diffMs = expires - now

      if (diffMs <= 0) {
        setStatus((prev) => ({ ...prev, expiresAt: null, minutesRemaining: null }))
      } else {
        const minutes = Math.ceil(diffMs / (1000 * 60))
        setStatus((prev) => ({ ...prev, minutesRemaining: minutes }))
      }
    }

    updateMinutes()
    const interval = setInterval(updateMinutes, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [status.expiresAt])

  const handleSubmit = async (reason?: string) => {
    setStatus((prev) => ({ ...prev, status: "submitting", error: null }))

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "create", reason }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit request")
      }

      const data = await response.json()
      setStatus((prev) => ({
        ...prev,
        status: "submitted",
        expiresAt: null,
        error: null,
      }))

      // Close modal after success and delay
      setTimeout(() => {
        setIsModalOpen(false)
        setStatus((prev) => ({ ...prev, status: "idle" }))
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit request"
      setStatus((prev) => ({ ...prev, status: "error", error: message }))
    }
  }

  if (!controlEnabled) {
    // Control is disabled, don't show button
    return null
  }

  if (currentStatus === "pending") {
    return (
      <Button variant="outline" disabled className="gap-2 h-8 md:h-9">
        <Clock className="h-4 w-4" />
        <span className="text-xs">Request Pending</span>
      </Button>
    )
  }

  if (currentStatus === "approved" && status.minutesRemaining !== null) {
    return (
      <Button variant="outline" disabled className="gap-2 h-8 md:h-9">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-xs">Expires in {status.minutesRemaining}m</span>
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 h-8 md:h-9"
        onClick={() => setIsModalOpen(true)}
        disabled={status.status === "submitting"}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="hidden sm:inline text-xs">Request Admin Access</span>
        <span className="sm:hidden text-xs">Request Access</span>
      </Button>

      <AdminAccessRequestModal
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false)
            setStatus((prev) => ({ ...prev, error: null }))
          }}
        onSubmit={handleSubmit}
        isLoading={status.status === "submitting"}
        error={status.error}
        success={status.status === "submitted"}
      />
    </>
  )
}
