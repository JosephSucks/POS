import { db } from "@/app/services/database"
import { requireAuth } from "@/lib/auth"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const transactions = await db.getTransactions()
    return Response.json(transactions)
  } catch (error) {
    console.error("[transactions] Failed to fetch transactions:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return Response.json(
      {
        error: "Failed to fetch transactions",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
