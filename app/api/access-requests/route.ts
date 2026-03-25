import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import {
  createAccessRequest,
  getPendingAccessRequests,
  getAccessRequestHistory,
  isManagerAccessControlEnabled,
  approveAccessRequest,
  denyAccessRequest,
  getAccessRequestById,
} from "@/lib/access-control"

/**
 * POST /api/access-requests
 * Create a new access request (manager only)
 * Body: { action?: "create", reason?: string }
 * Or for admin actions:
 * Body: { action: "approve"|"deny", requestId: number, ... }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as any
    const action = body?.action || "create"

    if (action === "create") {
      // Manager creates an access request
      const auth = await requireRole(request, ["manager"])
      if ("response" in auth) {
        return auth.response
      }

      // Check if manager access control is enabled
      const controlEnabled = await isManagerAccessControlEnabled()
      if (!controlEnabled) {
        return NextResponse.json(
          { error: "Manager access control is disabled. Access granted directly." },
          { status: 400 }
        )
      }

      const reason = body?.reason || undefined

      // Check if manager already has a pending request
      const history = await getAccessRequestHistory(auth.user.id, 1)
      if (history.length > 0 && history[0].status === "pending") {
        return NextResponse.json(
          { error: "You already have a pending access request. Please wait for admin response." },
          { status: 400 }
        )
      }

      const accessRequest = await createAccessRequest(auth.user.id, reason)
      if (!accessRequest) {
        return NextResponse.json({ error: "Failed to create access request" }, { status: 500 })
      }

      return NextResponse.json(accessRequest, { status: 201 })
    } else if (action === "approve") {
      // Admin approves a request
      const auth = await requireRole(request, ["admin"])
      if ("response" in auth) {
        return auth.response
      }

      const requestId = body?.requestId
      if (!requestId || typeof requestId !== "number") {
        return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
      }

      const existingRequest = await getAccessRequestById(requestId)
      if (!existingRequest) {
        return NextResponse.json({ error: "Access request not found" }, { status: 404 })
      }

      if (existingRequest.status !== "pending") {
        return NextResponse.json(
          { error: "Cannot approve a request that is not pending" },
          { status: 400 }
        )
      }

      const approvedRequest = await approveAccessRequest(requestId, auth.user.id)
      if (!approvedRequest) {
        return NextResponse.json({ error: "Failed to approve request" }, { status: 500 })
      }

      return NextResponse.json(approvedRequest)
    } else if (action === "deny") {
      // Admin denies a request
      const auth = await requireRole(request, ["admin"])
      if ("response" in auth) {
        return auth.response
      }

      const requestId = body?.requestId
      if (!requestId || typeof requestId !== "number") {
        return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
      }

      const existingRequest = await getAccessRequestById(requestId)
      if (!existingRequest) {
        return NextResponse.json({ error: "Access request not found" }, { status: 404 })
      }

      if (existingRequest.status !== "pending") {
        return NextResponse.json(
          { error: "Cannot deny a request that is not pending" },
          { status: 400 }
        )
      }

      const deniedRequest = await denyAccessRequest(auth.user.id, requestId)
      if (!deniedRequest) {
        return NextResponse.json({ error: "Failed to deny request" }, { status: 500 })
      }

      return NextResponse.json(deniedRequest)
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("[access-requests] Failed:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

/**
 * GET /api/access-requests
 * Get pending access requests (admin only)
 */
export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const requests = await getPendingAccessRequests()
    return NextResponse.json(requests)
  } catch (error) {
    console.error("[access-requests] Failed to fetch requests:", error)
    return NextResponse.json({ error: "Failed to fetch access requests" }, { status: 500 })
  }
}
