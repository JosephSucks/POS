import { NextResponse } from "next/server"

import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const { darkMode } = await request.json()

    if (typeof darkMode !== "boolean") {
      return NextResponse.json({ error: "Invalid darkMode value" }, { status: 400 })
    }

    await sql`
      INSERT INTO settings (key, value, created_at, updated_at)
      VALUES ('darkMode', ${JSON.stringify(darkMode)}, NOW(), NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = ${JSON.stringify(darkMode)}, updated_at = NOW()
    `

    return NextResponse.json({ success: true, darkMode }, { status: 200 })
  } catch (error) {
    console.error("[settings] Failed to update theme setting:", error)
    return NextResponse.json({ error: "Failed to update theme setting" }, { status: 500 })
  }
}
