"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  X,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AccessRequest {
  id: number
  requester_id: number
  requester_name: string
  requester_email: string
  request_reason: string | null
  status: "pending" | "approved" | "denied" | "expired"
  requested_at: string
  responded_at: string | null
  responded_by: number | null
  responder_name?: string
  expires_at: string | null
}

interface ConfirmDialog {
  isOpen: boolean
  requestId: number | null
  action: "approve" | "deny" | null
}

export default function AccessRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isControlEnabled, setIsControlEnabled] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    requestId: null,
    action: null,
  })

  useEffect(() => {
    loadRequests()
    const interval = setInterval(loadRequests, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadRequests = async () => {
    try {
      setError(null)
      const response = await fetch("/api/access-requests", {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 403) {
          setIsControlEnabled(false)
          setError("Manager access control is disabled. Access requests feature is not available.")
          setRequests([])
          return
        }
        throw new Error("Failed to fetch access requests")
      }

      const data: AccessRequest[] = await response.json()
      setRequests(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load access requests"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (requestId: number, action: "approve" | "deny") => {
    setConfirmDialog({ isOpen: true, requestId, action })
  }

  const confirmAction = async () => {
    if (!confirmDialog.requestId || !confirmDialog.action) return

    const requestId = confirmDialog.requestId
    const action = confirmDialog.action
    setProcessingId(requestId)

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          requestId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`)
      }

      const updatedRequest: AccessRequest = await response.json()
      setRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)))
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${action} request`
      setError(message)
    } finally {
      setProcessingId(null)
      setConfirmDialog({ isOpen: false, requestId: null, action: null })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><Check className="mr-1 h-3 w-3" /> Approved</Badge>
      case "denied":
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" /> Denied</Badge>
      case "expired":
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const otherRequests = requests.filter((r) => r.status !== "pending")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading access requests...</p>
        </div>
      </div>
    )
  }

  if (!isControlEnabled) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Manager access control is disabled in settings. This page is not active.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Access Requests</h1>
          <p className="text-muted-foreground">Manage manager admin access requests</p>
        </div>
        <Button onClick={loadRequests} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <Badge className="ml-auto">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {pendingRequests.length === 0
              ? "No pending access requests"
              : "Review and approve or deny manager access requests"}
          </CardDescription>
        </CardHeader>
        {pendingRequests.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead className="hidden sm:table-cell">Reason</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.requester_name}</p>
                        <p className="text-xs text-muted-foreground">{request.requester_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-xs">
                      {request.request_reason ? (
                        <p className="text-sm line-clamp-2">{request.request_reason}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No reason provided</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {new Date(request.requested_at).toLocaleDateString()} {new Date(request.requested_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right gap-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleAction(request.id, "approve")}
                        disabled={processingId === request.id}
                      >
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Approve</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-red-600 hover:text-red-700 dark:text-red-400 hover:dark:text-red-300"
                        onClick={() => handleAction(request.id, "deny")}
                        disabled={processingId === request.id}
                      >
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline">Deny</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* History */}
      {otherRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
            <CardDescription>Previously approved or denied requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Responded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.requester_name}</p>
                        <p className="text-xs text-muted-foreground">{request.requester_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {new Date(request.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {request.responded_at ? (
                        <div>
                          <p>{new Date(request.responded_at).toLocaleDateString()}</p>
                          {request.responder_name && (
                            <p className="text-xs text-muted-foreground">by {request.responder_name}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, requestId: null, action: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "approve" ? "Approve Access Request?" : "Deny Access Request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "approve"
                ? "This manager will be granted 1-hour temporary access to the admin panel."
                : "This manager's access request will be denied. They can submit another request later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={confirmDialog.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {confirmDialog.action === "approve" ? "Approve" : "Deny"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
