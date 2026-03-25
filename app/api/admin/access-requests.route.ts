import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth"
import {
  createAccessRequest,
  getPendingAccessRequests,
  getAccessRequestHistory,
  isManagerAccessControlEnabled,
} from "@/lib/access-control"

export async function POST(request: Request) {
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

  try {
    const body = (await request.json().catch(() => null)) as {
      reason?: string
    } | null

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
  } catch (error) {
    console.error("[access-requests] Failed to create request:", error)
    return NextResponse.json({ error: "Failed to create access request" }, { status: 500 })
  }
}

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
