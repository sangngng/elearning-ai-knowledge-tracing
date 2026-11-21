import dotenv from 'dotenv'

dotenv.config()

const required = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  // Default: the Next.js dev server (3000) and the UI test server (frontend/tests, 3010).
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:3010')
    .split(',').map((origin) => origin.trim()).filter(Boolean),
  databaseUrl: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/elearning'),
  jwtSecret: required('JWT_SECRET'),
}
