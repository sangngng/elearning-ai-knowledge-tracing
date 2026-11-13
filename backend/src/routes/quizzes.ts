import { Router } from 'express'
import { pool } from '../config/database'
import { authenticate, type AuthRequest } from '../middleware/auth'

export const quizRouter = Router()

quizRouter.post('/api/quizzes/:quizId/submit', authenticate, async (req: AuthRequest, res, next) => {
  const client = await pool.connect()
  try {
    const answers = req.body?.answers
    if (!Array.isArray(answers) || answers.length === 0 || answers.some((a) => typeof a?.questionId !== 'string' || typeof a?.answer !== 'string')) {
      return res.status(400).json({ error: 'answers must be a non-empty array of { questionId, answer }' })
    }
    if (new Set(answers.map((answer) => answer.questionId)).size !== answers.length) {
      return res.status(400).json({ error: 'Each questionId may appear only once per submission' })
    }
    await client.query('BEGIN')
    const quiz = await client.query(
      `SELECT q.id, q.session_id
       FROM quizzes q JOIN course_sessions cs ON cs.id = q.session_id
       JOIN course_classes cc ON cc.id = cs.class_id
       WHERE q.id = $1 AND q.is_published = true
         AND ($2 = 'admin' OR cc.instructor_id = $3 OR EXISTS (
           SELECT 1 FROM enrollments e
           WHERE e.class_id = cc.id AND e.user_id = $3 AND e.status = 'enrolled'
         ))`,
      [req.params.quizId, req.user!.role, req.user!.id],
    )
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
        'INSERT INTO quiz_interactions (user_id, session_id, question_id, skill_id, is_correct, attempt_count) VALUES ($1, $2, $3, $4, $5, COALESCE((SELECT MAX(attempt_count) + 1 FROM quiz_interactions WHERE user_id = $1 AND question_id = $3), 1)) RETURNING id, attempt_count, created_at',
        [req.user!.id, quiz.rows[0].session_id, q.id, q.skill_id, isCorrect],
      )
      results.push({ questionId: q.id, skillId: q.skill_id, isCorrect, ...interaction.rows[0] })
    }
    await client.query('COMMIT')
    return res.json({ quizId: req.params.quizId, results, score: results.filter((r) => r.isCorrect).length, total: results.length })
  } catch (error) { await client.query('ROLLBACK').catch(() => undefined); return next(error) }
  finally { client.release() }
})
