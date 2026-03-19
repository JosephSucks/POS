import { db } from "@/app/services/database"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const lowStock = url.searchParams.get('lowStock')

    if (lowStock === 'true') {
      const items = await db.getLowStockItems()
      return Response.json(items)
    }

    const inventory = await db.getInventory()
    return Response.json(inventory)
  } catch (error) {
    console.error('[v0] Error in inventory GET:', error)
    return Response.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, stock } = body

    // Update stock for the item
    const inventory = await db.getInventory()
    const updatedInventory = inventory.map((item) =>
      item.id === id ? { ...item, stock, lastRestocked: new Date() } : item
    )
    await db.saveInventory(updatedInventory)

    return Response.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in inventory PUT:', error)
    return Response.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
