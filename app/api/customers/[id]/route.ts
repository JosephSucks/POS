import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const customerId = params.id

    const result = await sql`
      SELECT *
      FROM customers
      WHERE id = ${customerId}
    `

    if (result.length === 0) {
      return Response.json({ error: "Customer not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[customers] Failed to fetch customer:", error)
    return Response.json(
      {
        error: "Failed to fetch customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const customerId = params.id
    const body = await request.json()
    const { name, email, phone, loyalty_points } = body

    const result = await sql`
      UPDATE customers
      SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        loyalty_points = COALESCE(${loyalty_points}, loyalty_points),
        updated_at = NOW()
      WHERE id = ${customerId}
      RETURNING *
    `

    if (result.length === 0) {
      return Response.json({ error: "Customer not found" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[customers] Failed to update customer:", error)
    return Response.json(
      {
        error: "Failed to update customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const customerId = params.id

    const result = await sql`
      DELETE FROM customers
      WHERE id = ${customerId}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json({ error: "Customer not found" }, { status: 404 })
    }

    return Response.json({ success: true, id: customerId })
  } catch (error) {
    console.error("[customers] Failed to delete customer:", error)
    return Response.json(
      {
        error: "Failed to delete customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
