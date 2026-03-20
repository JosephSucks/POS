import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    const result = await sql`
      SELECT key, value FROM settings ORDER BY key
    `
    
    // Convert to object with parsed values
    const settings: Record<string, any> = {}
    result.rows.forEach((row: any) => {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    })
    
    return Response.json(settings)
  } catch (error) {
    console.error('[v0] Error fetching settings:', error)
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Upsert each setting
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
    console.error('[v0] Error saving settings:', error)
    return Response.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
