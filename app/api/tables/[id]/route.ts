import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const tableId = Number.parseInt(params.id, 10)
    
    const table = await sql`
      SELECT id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to, reserved_by_staff_id, reserved_for_customer_name, reserved_for_customer_phone, reserved_notes, reserved_at
      FROM "tables" 
      WHERE id = ${tableId}
    `

    if (table.length === 0) {
      return Response.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    return Response.json(table[0])
  } catch (error) {
    console.error("[GET /api/tables/[id]]", error)
    return Response.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const tableId = Number.parseInt(params.id, 10)
    const body = await request.json()
    const { status, current_order_id } = body

    if (!status || !["available", "occupied", "reserved"].includes(status)) {
      return Response.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE "tables" 
      SET status = ${status}, current_order_id = ${current_order_id || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${tableId}
      RETURNING id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to, reserved_by_staff_id, reserved_for_customer_name, reserved_for_customer_phone, reserved_notes, reserved_at
    `

    if (result.length === 0) {
      return Response.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[PUT /api/tables/[id]]", error)
    return Response.json(
      { error: "Failed to update table" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const tableId = Number.parseInt(params.id, 10)
    const body = await request.json()
    const { action, type, from, to, customerName, customerPhone, notes } = body

    if (!action) {
      return Response.json(
        { error: "Missing action (reserve/unreserve/extend)" },
        { status: 400 }
      )
    }

    if (action === "reserve") {
      if (!type || !["simple", "timed"].includes(type)) {
        return Response.json(
          { error: "Invalid reservation type" },
          { status: 400 }
        )
      }

      // For timed reservations, validate times
      if (type === "timed") {
        if (!from || !to) {
          return Response.json(
            { error: "Timed reservations require 'from' and 'to' times" },
            { status: 400 }
          )
        }

        const fromTime = new Date(from)
        const toTime = new Date(to)
        const now = new Date()

        // Can't reserve in the past
        if (fromTime < now) {
          return Response.json(
            { error: "Cannot reserve in the past" },
            { status: 400 }
          )
        }

        // From must be before To
        if (fromTime >= toTime) {
          return Response.json(
            { error: "Reservation start time must be before end time" },
            { status: 400 }
          )
        }

        // Minimum 30 minutes
        const durationMinutes = (toTime.getTime() - fromTime.getTime()) / (1000 * 60)
        if (durationMinutes < 30) {
          return Response.json(
            { error: "Reservation must be at least 30 minutes" },
            { status: 400 }
          )
        }

        // Check for overlapping reservations
        const overlapping = await sql`
          SELECT id FROM "tables"
          WHERE id = ${tableId}
          AND status = 'reserved'
          AND reserved_from < ${toTime.toISOString()}
          AND reserved_to > ${fromTime.toISOString()}
        `

        if (overlapping.length > 0) {
          return Response.json(
            { error: "Table is already reserved during this time period" },
            { status: 409 }
          )
        }
      }

      // Update table with reservation
      const result = await sql`
        UPDATE "tables"
        SET 
          status = 'reserved',
          reserved_by_staff_id = ${auth.user.id},
          reserved_for_customer_name = ${customerName || null},
          reserved_for_customer_phone = ${customerPhone || null},
          reserved_notes = ${notes || null},
          reserved_from = ${type === "timed" ? new Date(from).toISOString() : null},
          reserved_to = ${type === "timed" ? new Date(to).toISOString() : null},
          reserved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${tableId}
        RETURNING id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to, reserved_by_staff_id, reserved_for_customer_name, reserved_for_customer_phone, reserved_notes, reserved_at
      `

      if (result.length === 0) {
        return Response.json(
          { error: "Table not found" },
          { status: 404 }
        )
      }

      return Response.json(result[0])

    } else if (action === "unreserve") {
      // Cancel reservation and set to available
      const result = await sql`
        UPDATE "tables"
        SET 
          status = 'available',
          reserved_by_staff_id = null,
          reserved_for_customer_name = null,
          reserved_for_customer_phone = null,
          reserved_notes = null,
          reserved_from = null,
          reserved_to = null,
          reserved_at = null,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${tableId}
        RETURNING id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to, reserved_by_staff_id, reserved_for_customer_name, reserved_for_customer_phone, reserved_notes, reserved_at
      `

      if (result.length === 0) {
        return Response.json(
          { error: "Table not found" },
          { status: 404 }
        )
      }

      return Response.json(result[0])

    } else if (action === "extend") {
      if (!to) {
        return Response.json(
          { error: "New end time required for extend action" },
          { status: 400 }
        )
      }

      const toTime = new Date(to)
      const now = new Date()

      if (toTime <= now) {
        return Response.json(
          { error: "New end time must be in the future" },
          { status: 400 }
        )
      }

      // Get current reservation
      const current = await sql`
        SELECT reserved_from FROM "tables" WHERE id = ${tableId}
      `

      if (current.length === 0) {
        return Response.json(
          { error: "Table not found" },
          { status: 404 }
        )
      }

      const fromTime = new Date(current[0].reserved_from)

      // Minimum 30 minutes
      const durationMinutes = (toTime.getTime() - fromTime.getTime()) / (1000 * 60)
      if (durationMinutes < 30) {
        return Response.json(
          { error: "Reservation must be at least 30 minutes" },
          { status: 400 }
        )
      }

      // Check for overlapping with other reservations (excluding this table)
      const overlapping = await sql`
        SELECT id FROM "tables"
        WHERE id != ${tableId}
        AND status = 'reserved'
        AND reserved_from < ${toTime.toISOString()}
        AND reserved_to > ${fromTime.toISOString()}
      `

      if (overlapping.length > 0) {
        return Response.json(
          { error: "Cannot extend - conflicts with another reservation" },
          { status: 409 }
        )
      }

      // Extend reservation
      const result = await sql`
        UPDATE "tables"
        SET 
          reserved_to = ${toTime.toISOString()},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${tableId}
        RETURNING id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to, reserved_by_staff_id, reserved_for_customer_name, reserved_for_customer_phone, reserved_notes, reserved_at
      `

      if (result.length === 0) {
        return Response.json(
          { error: "Table not found" },
          { status: 404 }
        )
      }

      return Response.json(result[0])

    } else {
      return Response.json(
        { error: "Invalid action. Use 'reserve', 'unreserve', or 'extend'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("[PATCH /api/tables/[id]]", error)
    return Response.json(
      { error: "Failed to process reservation action" },
      { status: 500 }
    )
  }
}