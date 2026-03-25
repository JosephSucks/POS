import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequestResponse, requireRole, type UserRole } from "@/lib/auth"
import { sql } from "@/lib/db"

const roles = ["admin", "manager", "cashier"] as const satisfies readonly UserRole[]

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  role: z.enum(roles),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const generateLegacyPin = () => String(Math.floor(1000 + Math.random() * 9000))

const isUniqueViolation = (error: unknown) => {
  return error instanceof Error && /duplicate key|unique/i.test(error.message)
}

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const users = await sql`
      SELECT id, name, email, role, status, created_at
      FROM employees
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[users] Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const json = await request.json().catch(() => null)
    const parsedBody = createUserSchema.safeParse(json)

    if (!parsedBody.success) {
      return badRequestResponse("Invalid user payload", parsedBody.error.flatten())
    }

    const { name, email, role, password } = parsedBody.data
    const passwordHash = await bcrypt.hash(password, 10)

    const result = await sql`
      INSERT INTO employees (name, email, pin, role, status, password_hash)
      VALUES (${name}, ${email}, ${generateLegacyPin()}, ${role}, 'active', ${passwordHash})
      RETURNING id, name, email, role, status, created_at
    `

    return NextResponse.json({ user: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[users] Failed to create user:", error)

    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
