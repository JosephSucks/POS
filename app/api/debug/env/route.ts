export async function GET() {
  const envVars = Object.keys(process.env)
    .filter(k => k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('NEON'))
    .reduce((acc, k) => {
      acc[k] = process.env[k]?.substring(0, 30) + '...' || 'undefined'
      return acc
    }, {} as Record<string, string>)

  return Response.json({
    message: 'Environment variables found:',
    count: Object.keys(envVars).length,
    vars: envVars,
    allEnvKeys: Object.keys(process.env).sort(),
  })
}
