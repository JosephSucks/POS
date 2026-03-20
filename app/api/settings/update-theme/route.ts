import { NextRequest, NextResponse } from 'next/server'
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function POST(req: NextRequest) {
  try {
    const { darkMode } = await req.json()

    if (typeof darkMode !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid darkMode value' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      // Update or insert the darkMode setting
      await client.query(
        `INSERT INTO settings (key, value, created_at, updated_at) 
         VALUES ($1, $2, NOW(), NOW())
         ON CONFLICT (key) DO UPDATE 
         SET value = $2, updated_at = NOW()`,
        ['darkMode', JSON.stringify({ enabled: darkMode })]
      )

      return NextResponse.json(
        { success: true, darkMode },
        { status: 200 }
      )
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating theme setting:', error)
    return NextResponse.json(
      { error: 'Failed to update theme setting' },
      { status: 500 }
    )
  }
}
