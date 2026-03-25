import { neon } from "@neondatabase/serverless"

export const getDatabaseUrl = () => {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (!url) {
    throw new Error("No database connection string found")
  }

  return url
}

export const sql = neon(getDatabaseUrl())
