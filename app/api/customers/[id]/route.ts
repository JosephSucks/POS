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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customerId = id

    console.log(`[v0] Fetching customer ${customerId}`)

    const result = await sql`
      SELECT * FROM customers WHERE id = ${customerId}
    `

    if (result.length === 0) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return Response.json(result[0])
  } catch (error) {
    console.error('[v0] Error fetching customer:', error)
    return Response.json(
      { 
        error: 'Failed to fetch customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customerId = id
    const body = await request.json()
    const { name, email, phone, loyalty_points } = body

    console.log(`[v0] Updating customer ${customerId}:`, body)

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
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Customer updated successfully:', result[0])

    return Response.json(result[0])
  } catch (error) {
    console.error('[v0] Error updating customer:', error)
    return Response.json(
      { 
        error: 'Failed to update customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customerId = id

    console.log(`[v0] Deleting customer ${customerId}`)

    const result = await sql`
      DELETE FROM customers WHERE id = ${customerId}
      RETURNING id
    `

    if (result.length === 0) {
      return Response.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    console.log('[v0] Customer deleted successfully')

    return Response.json({ success: true, id: customerId })
  } catch (error) {
    console.error('[v0] Error deleting customer:', error)
    return Response.json(
      { 
        error: 'Failed to delete customer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
