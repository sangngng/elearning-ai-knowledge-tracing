import dotenv from 'dotenv'

dotenv.config()

const required = (name: string, fallback?: string) => {
  const value = process.env[name] ?? fallback
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  databaseUrl: required('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/elearning'),
  jwtSecret: required('JWT_SECRET'),
}
