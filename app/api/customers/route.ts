import { db } from "@/app/services/database"
import { requireAuth } from "@/lib/auth"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const url = new URL(request.url)
    const search = url.searchParams.get("search")

    if (search) {
      const results = await db.searchCustomers(search)
      return Response.json(results)
    }

    const customers = await db.getCustomers()
    return Response.json(customers)
  } catch (error) {
    console.error("[customers] Failed to fetch customers:", error)
    return Response.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const body = await request.json()
    await db.saveCustomer(body)
    return Response.json({ success: true })
  } catch (error) {
    console.error("[customers] Failed to save customer:", error)
    return Response.json({ error: "Failed to save customer" }, { status: 500 })
  }
}
