import { NextResponse } from "next/server"

import { getAuthUserFromRequest } from "@/lib/auth"
import { hasTemporaryAdminAccess, isManagerAccessControlEnabled } from "@/lib/access-control"

export async function GET(request: Request) {
  const user = await getAuthUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // For managers, include temporary admin access status
  let temporaryAdminAccess = false
  if (user.role === "manager") {
    const controlEnabled = await isManagerAccessControlEnabled()
    if (controlEnabled) {
      temporaryAdminAccess = await hasTemporaryAdminAccess(user.id)
    } else {
      temporaryAdminAccess = false // Access control disabled, direct access granted
    }
  }

  return NextResponse.json({ user, temporaryAdminAccess, managerAccessControlEnabled: user.role === "manager" ? await isManagerAccessControlEnabled() : undefined })
}
