import { db } from "@/app/services/database"

export async function GET() {
  try {
    console.log('[v0] Fetching transactions from database...')
    
    const transactions = await db.getTransactions()
    
    console.log(`[v0] Successfully fetched ${transactions.length} transactions`)
    
    return Response.json(transactions)
  } catch (error) {
    console.error('[v0] Error fetching transactions:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json(
      { 
        error: 'Failed to fetch transactions',
        details: errorMessage
      }, 
      { status: 500 }
    )
  }
}
