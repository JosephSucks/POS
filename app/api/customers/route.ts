import { db } from "@/app/services/database"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const lowStock = url.searchParams.get('lowStock')

    if (search) {
      const results = await db.searchCustomers(search)
      return Response.json(results)
    }

    const customers = await db.getCustomers()
    return Response.json(customers)
  } catch (error) {
    console.error('[v0] Error in customers GET:', error)
    return Response.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await db.saveCustomer(body)
    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in customers POST:', error)
    return Response.json({ error: 'Failed to save customer' }, { status: 500 })
  }
}
