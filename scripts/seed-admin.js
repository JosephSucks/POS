require("dotenv").config()

const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcryptjs")

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED

if (!databaseUrl) {
  throw new Error("No database connection string found")
}

const adminEmail = process.env.ADMIN_EMAIL
const adminPassword = process.env.ADMIN_PASSWORD
const adminName = process.env.ADMIN_NAME || "Initial Admin"

if (!adminEmail || !adminPassword) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set")
}

if (adminPassword.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters long")
}

const sql = neon(databaseUrl)

const generateLegacyPin = () => String(Math.floor(1000 + Math.random() * 9000))

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const result = await sql`
    INSERT INTO employees (name, email, pin, role, status, password_hash)
    VALUES (${adminName}, ${adminEmail.trim().toLowerCase()}, ${generateLegacyPin()}, 'admin', 'active', ${passwordHash})
    ON CONFLICT (email) DO UPDATE
    SET
      name = EXCLUDED.name,
      role = 'admin',
      status = 'active',
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW()
    RETURNING id, name, email, role, status, created_at
  `

  console.log("Seeded admin user:", result[0])
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin user:", error)
  process.exit(1)
})
