import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { apiRouter } from './routes'

export function createApp() {
  const app = express()
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
  }))
  app.use(express.json({ limit: '1mb' }))
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  app.use(apiRouter)
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const databaseError = error as { code?: string; message?: string }
    if (databaseError?.code === '23505') return res.status(409).json({ error: 'A record with these values already exists' })
    if (databaseError?.code === '23514' && databaseError.message === 'Class capacity has been reached') {
      return res.status(409).json({ error: 'Class capacity has been reached' })
    }
    if (['22P02', '22008', '23503', '23514'].includes(databaseError?.code ?? '')) {
      return res.status(400).json({ error: 'Invalid or conflicting data' })
    }
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  })
  return app
}
