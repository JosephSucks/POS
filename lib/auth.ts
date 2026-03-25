import { jwtVerify, SignJWT, type JWTPayload } from "jose"
import { NextResponse } from "next/server"

export const AUTH_COOKIE_NAME = "auth-token"
export const AUTH_TOKEN_MAX_AGE_SECONDS = 60 * 60

export type UserRole = "admin" | "manager" | "cashier"

export interface AuthUser {
  id: number
  email: string
  role: UserRole
  name: string
}

interface AuthCookieTarget {
  cookies: {
    set: (name: string, value: string, options: Record<string, unknown>) => void
  }
}

const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured")
  }

  return new TextEncoder().encode(secret)
}

const parseCookieHeader = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) {
    return null
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.slice(name.length + 1))
}

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: AUTH_TOKEN_MAX_AGE_SECONDS,
})

export const setAuthCookie = (response: AuthCookieTarget, token: string) => {
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())
}

export const clearAuthCookie = (response: AuthCookieTarget) => {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  })
}

export const signAuthToken = async (user: AuthUser) => {
  return new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${AUTH_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret())
}

export const verifyAuthToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getAuthSecret())
  return payloadToUser(payload)
}

const payloadToUser = (payload: JWTPayload): AuthUser => {
  if (!payload.sub || !payload.email || !payload.role || !payload.name) {
    throw new Error("Invalid auth token payload")
  }

  return {
    id: Number(payload.sub),
    email: String(payload.email),
    role: String(payload.role) as UserRole,
    name: String(payload.name),
  }
}

export const getAuthTokenFromRequest = (request: Request) => {
  const requestWithCookies = request as Request & {
    cookies?: { get: (name: string) => { value: string } | undefined }
  }

  return (
    requestWithCookies.cookies?.get(AUTH_COOKIE_NAME)?.value ||
    parseCookieHeader(request.headers.get("cookie"), AUTH_COOKIE_NAME)
  )
}

export const getAuthUserFromRequest = async (request: Request) => {
  const token = getAuthTokenFromRequest(request)

  if (!token) {
    return null
  }

  try {
    return await verifyAuthToken(token)
  } catch {
    return null
  }
}

export const unauthorizedResponse = (message = "Unauthorized") =>
  NextResponse.json({ error: message }, { status: 401 })

export const forbiddenResponse = (message = "Forbidden") =>
  NextResponse.json({ error: message }, { status: 403 })

export const badRequestResponse = (message = "Invalid request", details?: unknown) =>
  NextResponse.json(details ? { error: message, details } : { error: message }, { status: 400 })

export const requireAuth = async (request: Request) => {
  const user = await getAuthUserFromRequest(request)

  if (!user) {
    return { response: unauthorizedResponse("Authentication required") } as const
  }

  return { user } as const
}

export const requireRole = async (request: Request, roles: UserRole[]) => {
  const auth = await requireAuth(request)

  if ("response" in auth) {
    return auth
  }

  if (!roles.includes(auth.user.role)) {
    return { response: forbiddenResponse("You do not have permission to perform this action") } as const
  }

  return auth
}

/**
 * Check if user can access admin panel based on role and temporary access grants
 * Admins always have access. Managers need either:
 * - Manager access control setting is OFF, OR
 * - Manager has active approved temporary access grant
 */
export async function canAccessAdmin(user: AuthUser): Promise<boolean> {
  if (user.role === "admin") {
    return true
  }

  if (user.role === "manager") {
    // Dynamically import to avoid circular dependency
    const { isManagerAccessControlEnabled, hasTemporaryAdminAccess } = await import("@/lib/access-control")
    const controlEnabled = await isManagerAccessControlEnabled()
    if (!controlEnabled) {
      return true // Control is OFF, allow direct access
    }
    // Control is ON, check for active temporary access
    return await hasTemporaryAdminAccess(user.id)
  }

  return false
}

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown"
  }

  return request.headers.get("x-real-ip") || "unknown"
}

const hashValue = async (value: string) => {
  const normalizedValue = value.trim()
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedValue))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export const hashEmail = (email: string) => hashValue(email.trim().toLowerCase())

export const hashIp = (ip: string) => hashValue(ip)
