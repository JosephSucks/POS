import { requireAuth, requireRole } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const rows = await sql`
      SELECT key, value
      FROM settings
      ORDER BY key
    `

    const settings: Record<string, unknown> = {}
    rows.forEach((row: any) => {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    })

    return Response.json(settings)
  } catch (error) {
    console.error("[settings] Failed to fetch settings:", error)
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ error: "Invalid settings payload" }, { status: 400 })
    }

    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = ${JSON.stringify(value)}, updated_at = NOW()
      `
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("[settings] Failed to save settings:", error)
    return Response.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
