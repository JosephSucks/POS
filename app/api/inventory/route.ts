import { db } from "@/app/services/database"
import { requireAuth } from "@/lib/auth"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const url = new URL(request.url)
    const lowStock = url.searchParams.get("lowStock")

    if (lowStock === "true") {
      const items = await db.getLowStockItems()
      return Response.json(items)
    }

    const inventory = await db.getInventory()
    return Response.json(inventory)
  } catch (error) {
    console.error("[inventory] Failed to fetch inventory:", error)
    return Response.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const body = await request.json()
    const { id, stock } = body

    const inventory = await db.getInventory()
    const updatedInventory = inventory.map((item) =>
      item.id === id ? { ...item, stock, lastRestocked: new Date() } : item,
    )

    await db.saveInventory(updatedInventory)

    return Response.json({ success: true })
  } catch (error) {
    console.error("[inventory] Failed to update inventory:", error)
    return Response.json({ error: "Failed to update inventory" }, { status: 500 })
  }
}
