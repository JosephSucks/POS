import { NextResponse } from "next/server"
import { z } from "zod"

import { badRequestResponse, requireRole, type UserRole } from "@/lib/auth"
import { sql } from "@/lib/db"

const roles = ["admin", "manager", "cashier"] as const satisfies readonly UserRole[]
const statuses = ["active", "inactive"] as const

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").optional(),
    email: z.string().trim().email("Enter a valid email address").transform((value) => value.toLowerCase()).optional(),
    role: z.enum(roles).optional(),
    status: z.enum(statuses).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  })

const isUniqueViolation = (error: unknown) => {
  return error instanceof Error && /duplicate key|unique/i.test(error.message)
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const userId = Number(params.id)

    if (!Number.isInteger(userId)) {
      return badRequestResponse("Invalid user id")
    }

    const json = await request.json().catch(() => null)
    const parsedBody = updateUserSchema.safeParse(json)

    if (!parsedBody.success) {
      return badRequestResponse("Invalid user payload", parsedBody.error.flatten())
    }

    const { name, email, role, status } = parsedBody.data

    const result = await sql`
      UPDATE employees
      SET
        name = COALESCE(${name ?? null}, name),
        email = COALESCE(${email ?? null}, email),
        role = COALESCE(${role ?? null}, role),
        status = COALESCE(${status ?? null}, status),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, role, status, created_at
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error("[users] Failed to update user:", error)

    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
