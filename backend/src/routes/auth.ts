import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/database'
import { env } from '../config/env'

export const authRouter = Router()

authRouter.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {}
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim() || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Name, email, and password (at least 8 characters) are required' })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role',
      [name.trim(), email.trim().toLowerCase(), passwordHash],
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: '1d' })
    return res.status(201).json({ user, token })
  } catch (error) { return next(error) }
})

authRouter.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {}
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required' })
    const result = await pool.query('SELECT id, name, email, role, password_hash FROM users WHERE email = $1', [email.trim().toLowerCase()])
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' })
    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: '1d' })
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
  } catch (error) { return next(error) }
})
