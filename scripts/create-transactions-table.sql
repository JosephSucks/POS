 GET /admin/orders 200 in 97ms (next.js: 22ms, application-code: 76ms)
[v0] Fetching transactions from database...
[v0] Error fetching transactions: Error [NeonDbError]: relation "transactions" does not exist
    at async GET (app\api\transactions\route.ts:22:26)
  20 |     console.log('[v0] Fetching transactions from database...')
  21 |
> 22 |     const transactions = await sql`
     |                          ^
  23 |       SELECT
  24 |         id,
  25 |         user_id, {
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '141',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1449',
  routine: 'parserOpenTable',
  sourceError: undefined
}
 GET /api/transactions 500 in 1167ms (next.js: 5ms, application-code: 1162ms)
[v0] Fetching transactions from database...
[v0] Error fetching transactions: Error [NeonDbError]: relation "transactions" does not exist
    at async GET (app\api\transactions\route.ts:22:26)
  20 |     console.log('[v0] Fetching transactions from database...')
  21 |
> 22 |     const transactions = await sql`
     |                          ^
  23 |       SELECT
  24 |         id,
  25 |         user_id, {
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '141',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1449',
  routine: 'parserOpenTable',
  sourceError: undefined
}
 GET /api/transactions 500 in 442ms (next.js: 11ms, application-code: 432ms)
