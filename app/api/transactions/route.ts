import { neon } from '@neondatabase/serverless'

const getDatabaseUrl = () => {
  const url = 
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (!url) {
    throw new Error('No database connection string found')
  }
  return url
}

const sql = neon(getDatabaseUrl())

export async function GET() {
  try {
    const transactions = await sql`SELECT * FROM transactions ORDER BY timestamp DESC`
    return Response.json(transactions)
  } catch (error) {
    console.error('[v0] Error fetching transactions:', error)
    return Response.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
