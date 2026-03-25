import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { getAuthTokenFromRequest, verifyAuthToken, canAccessAdmin } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = getAuthTokenFromRequest(request)

  if (!token) {
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("reason", "auth")
    return NextResponse.redirect(loginUrl)
  }

  try {
    const user = await verifyAuthToken(token)

    if (pathname.startsWith("/admin")) {
      const hasAccess = await canAccessAdmin(user)
      if (!hasAccess) {
        const posUrl = new URL("/pos", request.url)
        posUrl.searchParams.set("reason", "forbidden")
        return NextResponse.redirect(posUrl)
      }
    }

    return NextResponse.next()
  } catch {
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("reason", "auth")
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ["/pos/:path*", "/admin/:path*"],
}

