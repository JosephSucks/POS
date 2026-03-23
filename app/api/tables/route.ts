import { sql } from "@vercel/postgres"

export async function GET(request: Request) {
  try {
    const tables = await sql`
      SELECT id, table_number, capacity, status, current_order_id
      FROM tables
      ORDER BY table_number ASC
    `

    console.log("[v0] Fetched tables:", tables.rows.length)
    return Response.json(tables.rows)
  } catch (error) {
    console.error("[v0] Error fetching tables:", error)
    return Response.json({ error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { table_id, status } = await request.json()

    if (!table_id || !status) {
      return Response.json(
        { error: "Missing table_id or status" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE tables
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${table_id}
      RETURNING id, table_number, capacity, status, current_order_id
    `

    if (result.rows.length === 0) {
      return Response.json({ error: "Table not found" }, { status: 404 })
    }

    console.log("[v0] Updated table status:", table_id, status)
    return Response.json(result.rows[0])
  } catch (error) {
    console.error("[v0] Error updating table:", error)
    return Response.json({ error: "Failed to update table" }, { status: 500 })
  }
}
