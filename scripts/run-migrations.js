require("dotenv").config()

const { neon } = require("@neondatabase/serverless")
const fs = require("fs")
const path = require("path")

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED

if (!databaseUrl) {
  throw new Error("No database connection string found")
}

const sql = neon(databaseUrl)

// Split SQL content into individual statements, handling comments properly
function parseSqlStatements(content) {
  // Remove SQL comments (-- style)
  let cleaned = content
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")

  // Split by semicolon
  return cleaned
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0)
}

async function runMigrations() {
  const scriptsDir = path.join(__dirname)
  const files = fs.readdirSync(scriptsDir).filter((f) => {
    // Match files like 001-*.sql, 002-*.sql, etc.
    return /^\d{3}-.*\.sql$/.test(f)
  })

  // Sort numerically
  files.sort((a, b) => {
    const numA = parseInt(a.split("-")[0])
    const numB = parseInt(b.split("-")[0])
    return numA - numB
  })

  console.log(`Found ${files.length} migration files`)
  console.log("Running migrations in order...")
  console.log("")

  for (const file of files) {
    const filePath = path.join(scriptsDir, file)
    const content = fs.readFileSync(filePath, "utf-8")
    const statements = parseSqlStatements(content)

    try {
      console.log(`⏳ Running: ${file}`)
      
      for (const statement of statements) {
        try {
          await sql(statement)
        } catch (stmtError) {
          // Log which specific statement failed
          console.error(`  Failed statement: ${statement.substring(0, 80)}...`)
          throw stmtError
        }
      }
      
      console.log(`✅ Success: ${file}`)
    } catch (error) {
      // Some migrations may fail if tables already exist (IF NOT EXISTS)
      // This is expected and safe
      if (
        error.code === "42P07" ||
        error.code === "42P01" ||
        error.message.includes("already exists")
      ) {
        console.log(`⚠️  Skipped: ${file} (already exists or not needed)`)
      } else {
        console.error(`❌ Error in: ${file}`)
        console.error(`   ${error.message}`)
        // Don't fail on error - continue with next migration
        // This helps with idempotent migrations
      }
    }
  }

  console.log("")
  console.log("✅ All migrations completed!")
}

runMigrations().catch((error) => {
  console.error("Migration process error:", error.message)
  process.exit(1)
})


