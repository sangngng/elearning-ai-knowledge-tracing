import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'

export type AuthRequest = Request & { user?: { id: string; role: string } }

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    req.user = jwt.verify(token, env.jwtSecret) as { id: string; role: string }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
