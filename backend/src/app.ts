import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { router } from './routes'

export function createApp() {
  const app = express()
  app.use(cors({ origin: env.corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))
  app.use(router)
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if ((error as { code?: string })?.code === '23505') return res.status(409).json({ error: 'Email already registered' })
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  })
  return app
}
