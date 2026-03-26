const fs = require('fs');
const path = require('path');

// Create directories
const dirs = [
  'C:\\KinexFinal\\app\\api\\tables',
  'C:\\KinexFinal\\app\\api\\tables\\[id]'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
});

// Create route.ts in tables directory
const routeContent = `import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const tables = await sql\`
      SELECT id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to
      FROM "tables" 
      ORDER BY table_number ASC
    \`

    return Response.json(tables || [])
  } catch (error) {
    console.error("[GET /api/tables]", error)
    return Response.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    )
  }
}`;

fs.writeFileSync('C:\\KinexFinal\\app\\api\\tables\\route.ts', routeContent);
console.log('Created: C:\\KinexFinal\\app\\api\\tables\\route.ts');

// Create [id]/route.ts
const idRouteContent = `import { requireAuth } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const tableId = Number.parseInt(params.id, 10)
    
    const table = await sql\`
      SELECT id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to
      FROM "tables" 
      WHERE id = \${tableId}
    \`

    if (table.length === 0) {
      return Response.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    return Response.json(table[0])
  } catch (error) {
    console.error("[GET /api/tables/[id]]", error)
    return Response.json(
      { error: "Failed to fetch table" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request)
  if ("response" in auth) {
    return auth.response
  }

  try {
    const params = await props.params
    const tableId = Number.parseInt(params.id, 10)
    const body = await request.json()
    const { status, current_order_id } = body

    if (!status || !["available", "occupied", "reserved"].includes(status)) {
      return Response.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    const result = await sql\`
      UPDATE "tables" 
      SET status = \${status}, current_order_id = \${current_order_id || null}, updated_at = CURRENT_TIMESTAMP
      WHERE id = \${tableId}
      RETURNING id, table_number, capacity, status, current_order_id, created_at, updated_at, reserved_from, reserved_to
    \`

    if (result.length === 0) {
      return Response.json(
        { error: "Table not found" },
        { status: 404 }
      )
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("[PUT /api/tables/[id]]", error)
    return Response.json(
      { error: "Failed to update table" },
      { status: 500 }
    )
  }
}`;

fs.writeFileSync('C:\\KinexFinal\\app\\api\\tables\\[id]\\route.ts', idRouteContent);
console.log('Created: C:\\KinexFinal\\app\\api\\tables\\[id]\\route.ts');

console.log('Done! All files created successfully.');
