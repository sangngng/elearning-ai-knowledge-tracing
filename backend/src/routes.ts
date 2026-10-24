import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from './config/database'
import { env } from './config/env'
import { authenticate, type AuthRequest } from './middleware/auth'

export const router = Router()

router.post('/api/auth/register', async (req, res, next) => {
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

router.post('/api/auth/login', async (req, res, next) => {
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

router.get('/api/lessons', authenticate, async (req, res, next) => {
  try {
    const courseId = req.query.courseId
    const result = courseId
      ? await pool.query('SELECT l.id, l.course_id, l.title, l.description, l.content_type, l.content_url, l.position, l.created_at FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.id = $1 AND c.is_published = true ORDER BY l.position', [courseId])
      : await pool.query('SELECT l.id, l.course_id, l.title, l.description, l.content_type, l.content_url, l.position, l.created_at FROM lessons l JOIN courses c ON c.id = l.course_id WHERE c.is_published = true ORDER BY l.course_id, l.position')
    return res.json({ lessons: result.rows })
  } catch (error) { return next(error) }
})

router.post('/api/quizzes/:quizId/submit', authenticate, async (req: AuthRequest, res, next) => {
  const client = await pool.connect()
  try {
    const answers = req.body?.answers
    if (!Array.isArray(answers) || answers.length === 0 || answers.some((a) => typeof a?.questionId !== 'string' || typeof a?.answer !== 'string')) {
      return res.status(400).json({ error: 'answers must be a non-empty array of { questionId, answer }' })
    }
    await client.query('BEGIN')
    const quiz = await client.query('SELECT id FROM quizzes WHERE id = $1 AND is_published = true', [req.params.quizId])
    if (!quiz.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Quiz not found' }) }
    const results = []
    for (const item of answers) {
      // Serialize simultaneous submissions for the same user/question so attempt_count stays monotonic.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [req.user!.id, item.questionId])
      const question = await client.query('SELECT id, skill_id, correct_answer FROM questions WHERE id = $1 AND quiz_id = $2', [item.questionId, req.params.quizId])
      if (!question.rowCount) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Question ${item.questionId} does not belong to this quiz` }) }
      const q = question.rows[0]
      const isCorrect = item.answer === q.correct_answer
      const interaction = await client.query(
        'INSERT INTO quiz_interactions (user_id, question_id, skill_id, is_correct, attempt_count) VALUES ($1, $2, $3, $4, COALESCE((SELECT MAX(attempt_count) + 1 FROM quiz_interactions WHERE user_id = $1 AND question_id = $2), 1)) RETURNING id, attempt_count, created_at',
        [req.user!.id, q.id, q.skill_id, isCorrect],
      )
      results.push({ questionId: q.id, skillId: q.skill_id, isCorrect, ...interaction.rows[0] })
    }
    await client.query('COMMIT')
    return res.json({ quizId: req.params.quizId, results, score: results.filter((r) => r.isCorrect).length, total: results.length })
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); return next(error) }
  finally { client.release() }
})
