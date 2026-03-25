import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequestResponse, getClientIp, hashEmail, hashIp, setAuthCookie, signAuthToken, type AuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required"),
})

const GENERIC_LOGIN_ERROR = "Invalid email or password"
const LOCKED_OUT_ERROR = "Too many failed attempts. Try again in 15 minutes."

type EmployeeRow = {
  id: number
  name: string
  email: string
  role: AuthUser["role"]
  status: string
  password_hash: string | null
}

const recordAttempt = async (emailHash: string, ipHash: string, success: boolean) => {
  await sql`
    INSERT INTO auth_attempts (email_hash, ip_hash, success)
    VALUES (${emailHash}, ${ipHash}, ${success})
  `
}

const clearRecentFailures = async (emailHash: string, ipHash: string) => {
  await sql`
    DELETE FROM auth_attempts
    WHERE email_hash = ${emailHash}
      AND ip_hash = ${ipHash}
      AND success = false
      AND created_at >= NOW() - INTERVAL '15 minutes'
  `
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null)
    const parsedBody = loginSchema.safeParse(json)

    if (!parsedBody.success) {
      return badRequestResponse("Invalid login request", parsedBody.error.flatten())
    }

    const { email, password } = parsedBody.data
    const ip = getClientIp(request)
    const [emailHash, ipHash] = await Promise.all([hashEmail(email), hashIp(ip)])

    const failureCountResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM auth_attempts
      WHERE email_hash = ${emailHash}
        AND ip_hash = ${ipHash}
        AND success = false
        AND created_at >= NOW() - INTERVAL '15 minutes'
    `

    const failureCount = Number(failureCountResult[0]?.count || 0)
    if (failureCount >= 5) {
      return NextResponse.json({ error: LOCKED_OUT_ERROR }, { status: 429 })
    }

    const employeeResult = await sql`
      SELECT id, name, email, role, status, password_hash
      FROM employees
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `

    const employee = employeeResult[0] as EmployeeRow | undefined

    if (!employee || !employee.password_hash) {
      await recordAttempt(emailHash, ipHash, false)
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 })
    }

    if (employee.status !== "active") {
      await recordAttempt(emailHash, ipHash, false)
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 403 })
    }

    const passwordMatches = await bcrypt.compare(password, employee.password_hash)

    if (!passwordMatches) {
      await recordAttempt(emailHash, ipHash, false)
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 })
    }

    await recordAttempt(emailHash, ipHash, true)
    await clearRecentFailures(emailHash, ipHash)

    const user: AuthUser = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
    }

    const token = await signAuthToken(user)
    const response = NextResponse.json({ user })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    console.error("[auth] Login failed:", error)
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
  }
}
