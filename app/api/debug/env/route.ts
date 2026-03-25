import { requireRole } from "@/lib/auth"

export async function GET(request: Request) {
  const auth = await requireRole(request, ["admin"])
  if ("response" in auth) {
    return auth.response
  }

  const envVars = Object.keys(process.env)
    .filter((key) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("NEON"))
    .reduce((acc, key) => {
      acc[key] = process.env[key]?.slice(0, 30) + "..." || "undefined"
      return acc
    }, {} as Record<string, string>)

  return Response.json({
    message: "Environment variables found:",
    count: Object.keys(envVars).length,
    vars: envVars,
    allEnvKeys: Object.keys(process.env).sort(),
  })
}
