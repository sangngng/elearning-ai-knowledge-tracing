import { randomInt, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'
import { pool } from '../config/database'
import { authenticate, requireRoles, type AuthRequest } from '../middleware/auth'

export const academicRouter = Router()

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/
// Attendance PIN lifetime. Default 5 minutes; an instructor may choose 1 to 15.
const PIN_DEFAULT_MINUTES = 5
const PIN_MIN_MINUTES = 1
const PIN_MAX_MINUTES = 15

const routeParam = (value: string | string[]) => Array.isArray(value) ? value[0] ?? '' : value

type SessionInput = {
  sessionNumber: number
  title: string
  sessionDate: string
  startTime: string
  endTime: string
  room?: string | null
}

function validSession(item: SessionInput) {
  return Boolean(item && typeof item === 'object')
    && Number.isInteger(item.sessionNumber)
    && item.sessionNumber >= 1 && item.sessionNumber <= 15
    && typeof item.title === 'string' && item.title.trim().length > 0
    && /^\d{4}-\d{2}-\d{2}$/.test(item.sessionDate)
    && timePattern.test(item.startTime) && timePattern.test(item.endTime)
}

async function canManageClass(classId: string, user: NonNullable<AuthRequest['user']>) {
  if (user.role === 'admin') return classExists(classId)
  const result = await pool.query(
    'SELECT 1 FROM course_classes WHERE id = $1 AND instructor_id = $2',
    [classId, user.id],
  )
  return Boolean(result.rowCount)
}

async function classExists(classId: string) {
  const result = await pool.query('SELECT 1 FROM course_classes WHERE id = $1', [classId])
  return Boolean(result.rowCount)
}

academicRouter.use(authenticate)

// A learner sees enrolled classes, while instructors see the classes they teach.
academicRouter.get('/api/schedule', async (req: AuthRequest, res, next) => {
  try {
    const semesterId = req.query.semesterId
    if (semesterId !== undefined && (typeof semesterId !== 'string' || !uuidPattern.test(semesterId))) {
      return res.status(400).json({ error: 'semesterId must be a UUID' })
    }
    const result = await pool.query(
      `SELECT cs.id AS session_id, cs.session_number, cs.title AS session_title,
              cs.session_date, cs.start_time, cs.end_time, cs.room,
              cc.id AS class_id, cc.class_code, cc.default_room, cc.semester_id,
              c.id AS course_id, c.title AS course_title,
              u.id AS instructor_id, u.name AS instructor_name,
              (SELECT ar.status FROM attendance_records ar
               WHERE ar.session_id = cs.id AND ar.user_id = $1) AS my_attendance
       FROM course_sessions cs
       JOIN course_classes cc ON cc.id = cs.class_id
       JOIN courses c ON c.id = cc.course_id
       JOIN users u ON u.id = cc.instructor_id
       WHERE ($2::uuid IS NULL OR cc.semester_id = $2)
         AND ($3 = 'admin' OR cc.instructor_id = $1 OR EXISTS (
           SELECT 1 FROM enrollments e
           WHERE e.class_id = cc.id AND e.user_id = $1 AND e.status = 'enrolled'
         ))
       ORDER BY cs.session_date, cs.start_time, c.title, cc.class_code, cs.session_number`,
      [req.user!.id, semesterId ?? null, req.user!.role],
    )
    return res.json({ sessions: result.rows })
  } catch (error) { return next(error) }
})

academicRouter.post('/api/classes/:classId/enroll', requireRoles('student'), async (req: AuthRequest, res, next) => {
  try {
    const classId = routeParam(req.params.classId)
    if (!uuidPattern.test(classId)) return res.status(400).json({ error: 'classId must be a UUID' })
    const classResult = await pool.query(
      `SELECT cc.id FROM course_classes cc JOIN semesters s ON s.id = cc.semester_id
       WHERE cc.id = $1 AND s.is_active = true`,
      [classId],
    )
    if (!classResult.rowCount) return res.status(404).json({ error: 'Class is not available for enrollment' })
    const result = await pool.query(
      `INSERT INTO enrollments (class_id, user_id, status)
       VALUES ($1, $2, 'enrolled')
       ON CONFLICT (class_id, user_id) DO UPDATE
         SET status = 'enrolled', enrolled_at = now()
         WHERE enrollments.status = 'dropped'
       RETURNING id, class_id, user_id, status, enrolled_at`,
      [classId, req.user!.id],
    )
    if (!result.rowCount) return res.status(409).json({ error: 'Already enrolled in this class' })
    return res.status(201).json({ enrollment: result.rows[0] })
  } catch (error) { return next(error) }
})

academicRouter.get('/api/classes/:classId/sessions', async (req: AuthRequest, res, next) => {
  try {
    const classId = routeParam(req.params.classId)
    if (!uuidPattern.test(classId)) return res.status(400).json({ error: 'classId must be a UUID' })
    const manage = await canManageClass(classId, req.user!)
    const result = await pool.query(
      `SELECT cs.id, cs.class_id, cs.session_number, cs.title, cs.session_date,
              cs.start_time, cs.end_time, cs.room,
              (cs.is_attendance_open AND cs.attendance_expires_at > now()) AS is_attendance_open,
              CASE WHEN $3::boolean AND cs.attendance_expires_at > now()
                   THEN cs.attendance_code ELSE NULL END AS attendance_code,
              cs.attendance_expires_at,
              COALESCE((SELECT json_agg(json_build_object(
                'id', sm.id, 'title', sm.title, 'materialType', sm.material_type,
                'fileUrl', sm.file_url, 'position', sm.position
              ) ORDER BY sm.position) FROM session_materials sm WHERE sm.session_id = cs.id), '[]'::json) AS materials
       FROM course_sessions cs
       WHERE cs.class_id = $1
         AND ($2::boolean OR EXISTS (
           SELECT 1 FROM enrollments e
           WHERE e.class_id = cs.class_id AND e.user_id = $4 AND e.status = 'enrolled'
         ))
       ORDER BY cs.session_number`,
      [classId, manage, manage, req.user!.id],
    )
    if (!manage && !(await classExists(classId))) return res.status(404).json({ error: 'Class not found' })
    if (!manage && result.rowCount === 0) {
      const enrolled = await pool.query("SELECT 1 FROM enrollments WHERE class_id = $1 AND user_id = $2 AND status = 'enrolled'", [classId, req.user!.id])
      if (!enrolled.rowCount) return res.status(403).json({ error: 'You are not enrolled in this class' })
    }
    return res.json({ sessions: result.rows })
  } catch (error) { return next(error) }
})

academicRouter.post('/api/classes/:classId/sessions', requireRoles('instructor', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const classId = routeParam(req.params.classId)
    const item = req.body as SessionInput
    if (!uuidPattern.test(classId) || !validSession(item)) {
      return res.status(400).json({ error: 'Provide classId and a valid session: sessionNumber 1–15, title, YYYY-MM-DD date, startTime, and endTime' })
    }
    if (!(await canManageClass(classId, req.user!))) return res.status(404).json({ error: 'Class not found or not assigned to you' })
    const result = await pool.query(
      `INSERT INTO course_sessions (class_id, session_number, title, session_date, start_time, end_time, room)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, (SELECT default_room FROM course_classes WHERE id = $1)))
       RETURNING id, class_id, session_number, title, session_date, start_time, end_time, room`,
      [classId, item.sessionNumber, item.title.trim(), item.sessionDate, item.startTime, item.endTime, item.room ?? null],
    )
    return res.status(201).json({ session: result.rows[0] })
  } catch (error) { return next(error) }
})

// Creates exactly the 15 numbered sessions in one transaction.
academicRouter.post('/api/classes/:classId/sessions/bulk', requireRoles('instructor', 'admin'), async (req: AuthRequest, res, next) => {
  const client = await pool.connect()
  try {
    const classId = routeParam(req.params.classId)
    const sessions = req.body?.sessions as SessionInput[]
    if (!uuidPattern.test(classId) || !Array.isArray(sessions) || sessions.length !== 15
      || sessions.some((item) => !validSession(item))
      || new Set(sessions.map((item) => item.sessionNumber)).size !== 15
      || !Array.from({ length: 15 }, (_, index) => index + 1).every((num) => sessions.some((item) => item.sessionNumber === num))) {
      return res.status(400).json({ error: 'sessions must contain each valid sessionNumber from 1 through 15 exactly once' })
    }
    if (!(await canManageClass(classId, req.user!))) return res.status(404).json({ error: 'Class not found or not assigned to you' })
    await client.query('BEGIN')
    const rows = []
    for (const item of [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber)) {
      const result = await client.query(
        `INSERT INTO course_sessions (class_id, session_number, title, session_date, start_time, end_time, room)
         VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, (SELECT default_room FROM course_classes WHERE id = $1)))
         RETURNING id, class_id, session_number, title, session_date, start_time, end_time, room`,
        [classId, item.sessionNumber, item.title.trim(), item.sessionDate, item.startTime, item.endTime, item.room ?? null],
      )
      rows.push(result.rows[0])
    }
    await client.query('COMMIT')
    return res.status(201).json({ sessions: rows })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    return next(error)
  } finally { client.release() }
})

academicRouter.post('/api/sessions/:sessionId/attendance/open', requireRoles('instructor', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const sessionId = routeParam(req.params.sessionId)
    const durationMinutes = req.body?.durationMinutes ?? PIN_DEFAULT_MINUTES
    if (!uuidPattern.test(sessionId) || !Number.isInteger(durationMinutes) || durationMinutes < PIN_MIN_MINUTES || durationMinutes > PIN_MAX_MINUTES) {
      return res.status(400).json({ error: `sessionId must be a UUID and durationMinutes must be between ${PIN_MIN_MINUTES} and ${PIN_MAX_MINUTES}` })
    }
    const code = randomInt(0, 10_000).toString().padStart(4, '0')
    const result = await pool.query(
      `UPDATE course_sessions cs
       SET attendance_code = $2, is_attendance_open = true,
           attendance_expires_at = now() + ($3::integer * interval '1 minute')
       FROM course_classes cc
       WHERE cs.id = $1 AND cs.class_id = cc.id
         AND ($4 = 'admin' OR cc.instructor_id = $5)
       RETURNING cs.id, cs.attendance_code, cs.attendance_expires_at`,
      [sessionId, code, durationMinutes, req.user!.role, req.user!.id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Session not found or not assigned to you' })
    return res.json({ sessionId, attendanceCode: result.rows[0].attendance_code, expiresAt: result.rows[0].attendance_expires_at })
  } catch (error) { return next(error) }
})

academicRouter.post('/api/sessions/:sessionId/attendance/close', requireRoles('instructor', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const sessionId = routeParam(req.params.sessionId)
    if (!uuidPattern.test(sessionId)) return res.status(400).json({ error: 'sessionId must be a UUID' })
    const result = await pool.query(
      `UPDATE course_sessions cs
       SET attendance_code = NULL, is_attendance_open = false, attendance_expires_at = NULL
       FROM course_classes cc
       WHERE cs.id = $1 AND cs.class_id = cc.id
         AND ($2 = 'admin' OR cc.instructor_id = $3)
       RETURNING cs.id`,
      [sessionId, req.user!.role, req.user!.id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Session not found or not assigned to you' })
    return res.json({ sessionId, attendanceOpen: false })
  } catch (error) { return next(error) }
})

academicRouter.post('/api/sessions/:sessionId/attendance/check-in', requireRoles('student'), async (req: AuthRequest, res, next) => {
  const client = await pool.connect()
  try {
    const sessionId = routeParam(req.params.sessionId)
    const code = req.body?.attendanceCode
    if (!uuidPattern.test(sessionId) || typeof code !== 'string' || !/^\d{4}$/.test(code)) {
      return res.status(400).json({ error: 'Provide a sessionId UUID and a four-digit attendanceCode' })
    }
    await client.query('BEGIN')
    const sessionResult = await client.query(
      `SELECT id, class_id, attendance_code, is_attendance_open,
              attendance_expires_at, session_date, start_time
       FROM course_sessions WHERE id = $1 FOR UPDATE`,
      [sessionId],
    )
    if (!sessionResult.rowCount) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Session not found' }) }
    const session = sessionResult.rows[0]
    const enrollment = await client.query(
      "SELECT 1 FROM enrollments WHERE class_id = $1 AND user_id = $2 AND status = 'enrolled'",
      [session.class_id, req.user!.id],
    )
    if (!enrollment.rowCount) { await client.query('ROLLBACK'); return res.status(403).json({ error: 'You are not enrolled in this class' }) }
    const existing = await client.query(
      "SELECT status, method FROM attendance_records WHERE session_id = $1 AND user_id = $2",
      [sessionId, req.user!.id],
    )
    if (existing.rowCount && existing.rows[0].method === 'pin' && ['present', 'late'].includes(existing.rows[0].status)) {
      await client.query('COMMIT')
      return res.json({ sessionId, status: existing.rows[0].status, alreadyCheckedIn: true })
    }
    if (!session.is_attendance_open || !session.attendance_expires_at || new Date(session.attendance_expires_at) <= new Date()) {
      await client.query(
        `UPDATE course_sessions SET attendance_code = NULL, is_attendance_open = false, attendance_expires_at = NULL
         WHERE id = $1 AND attendance_expires_at <= now()`, [sessionId],
      )
      await client.query('COMMIT')
      return res.status(410).json({ error: 'Attendance PIN is closed or expired' })
    }
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', [sessionId, req.user!.id])
    const attempts = await client.query(
      `SELECT count(*)::integer AS failed_count FROM attendance_pin_attempts
       WHERE session_id = $1 AND user_id = $2 AND succeeded = false
         AND attempted_at >= now() - interval '15 minutes'`,
      [sessionId, req.user!.id],
    )
    if (attempts.rows[0].failed_count >= 5) {
      await client.query('ROLLBACK')
      return res.status(429).json({ error: 'Too many incorrect PIN attempts. Try again after 15 minutes.' })
    }
    const expected = String(session.attendance_code)
    const matches = timingSafeEqual(Buffer.from(code), Buffer.from(expected))
    if (!matches) {
      await client.query('INSERT INTO attendance_pin_attempts (session_id, user_id, succeeded) VALUES ($1, $2, false)', [sessionId, req.user!.id])
      await client.query('COMMIT')
      return res.status(401).json({ error: 'Incorrect attendance PIN' })
    }
    const checkin = await client.query(
      `INSERT INTO attendance_records (session_id, user_id, status, checkin_time, method)
       SELECT cs.id, $2::uuid,
         CASE WHEN timezone('Asia/Ho_Chi_Minh', now()) > (cs.session_date + cs.start_time)
              THEN 'late' ELSE 'present' END,
         now(), 'pin'
       FROM course_sessions cs WHERE cs.id = $1::uuid
       ON CONFLICT (session_id, user_id) DO NOTHING
       RETURNING id, status, checkin_time`,
      [sessionId, req.user!.id],
    )
    if (!checkin.rowCount) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'An attendance record already exists for this session' })
    }
    await client.query('INSERT INTO attendance_pin_attempts (session_id, user_id, succeeded) VALUES ($1, $2, true)', [sessionId, req.user!.id])
    await client.query('COMMIT')
    return res.status(201).json({ sessionId, ...checkin.rows[0] })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    return next(error)
  } finally { client.release() }
})

academicRouter.get('/api/classes/:classId/attendance/summary', requireRoles('instructor', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const classId = routeParam(req.params.classId)
    if (!uuidPattern.test(classId)) return res.status(400).json({ error: 'classId must be a UUID' })
    if (!(await canManageClass(classId, req.user!))) return res.status(404).json({ error: 'Class not found or not assigned to you' })
    const result = await pool.query(
      `WITH roster AS (
         SELECT e.user_id, u.name, u.email
         FROM enrollments e JOIN users u ON u.id = e.user_id
         WHERE e.class_id = $1 AND e.status = 'enrolled'
       ), completed AS (
         SELECT id FROM course_sessions
         WHERE class_id = $1
           AND timezone('Asia/Ho_Chi_Minh', now()) > (session_date + end_time)
       ), per_student AS (
         SELECT r.user_id, r.name, r.email,
                count(cs.id)::integer AS completed_sessions,
                count(ar.id) FILTER (WHERE ar.status IN ('present', 'late'))::integer AS attended_sessions,
                count(ar.id) FILTER (WHERE ar.status = 'excused')::integer AS excused_sessions
         FROM roster r LEFT JOIN completed cs ON true
         LEFT JOIN attendance_records ar ON ar.session_id = cs.id AND ar.user_id = r.user_id
         GROUP BY r.user_id, r.name, r.email
       ), class_info AS (
         SELECT cc.max_capacity, cc.class_code, c.title AS course_title, s.code AS semester_code
         FROM course_classes cc JOIN courses c ON c.id = cc.course_id
         JOIN semesters s ON s.id = cc.semester_id WHERE cc.id = $1
       )
       SELECT ci.class_code, ci.course_title, ci.semester_code, ci.max_capacity,
              count(ps.user_id)::integer AS enrolled_count,
              COALESCE(max(ps.completed_sessions), 0)::integer AS completed_sessions,
              COALESCE(sum(ps.attended_sessions), 0)::integer AS attended_checkins,
              round(100.0 * COALESCE(sum(ps.attended_sessions), 0)
                / NULLIF(sum(ps.completed_sessions - ps.excused_sessions), 0), 2) AS attendance_rate_percent,
              COALESCE(json_agg(json_build_object(
                'userId', ps.user_id, 'name', ps.name, 'email', ps.email,
                'completedSessions', ps.completed_sessions,
                'attendedSessions', ps.attended_sessions,
                'excusedSessions', ps.excused_sessions,
                'attendanceRatePercent', round(100.0 * ps.attended_sessions
                  / NULLIF(ps.completed_sessions - ps.excused_sessions, 0), 2)
              ) ORDER BY ps.name) FILTER (WHERE ps.user_id IS NOT NULL), '[]'::json) AS students
       FROM class_info ci LEFT JOIN per_student ps ON true
       GROUP BY ci.class_code, ci.course_title, ci.semester_code, ci.max_capacity`,
      [classId],
    )
    return res.json({ summary: result.rows[0] })
  } catch (error) { return next(error) }
})

// Compatibility endpoint for session-level quiz reads; answer keys are never sent to learners.
academicRouter.get('/api/sessions/:sessionId/quizzes', async (req: AuthRequest, res, next) => {
  try {
    const sessionId = routeParam(req.params.sessionId)
    if (!uuidPattern.test(sessionId)) return res.status(400).json({ error: 'sessionId must be a UUID' })
    const access = await pool.query(
      `SELECT 1 FROM course_sessions cs JOIN course_classes cc ON cc.id = cs.class_id
       WHERE cs.id = $1 AND ($2 = 'admin' OR cc.instructor_id = $3 OR EXISTS (
         SELECT 1 FROM enrollments e WHERE e.class_id = cc.id AND e.user_id = $3 AND e.status = 'enrolled'
       ))`,
      [sessionId, req.user!.role, req.user!.id],
    )
    if (!access.rowCount) return res.status(404).json({ error: 'Session not found or inaccessible' })
    const result = await pool.query(
      `SELECT q.id AS quiz_id, q.title AS quiz_title,
              COALESCE(json_agg(json_build_object(
                'id', question.id, 'skillId', question.skill_id, 'skillCode', sk.code,
                'prompt', question.prompt, 'options', question.options, 'position', question.position
              ) ORDER BY question.position) FILTER (WHERE question.id IS NOT NULL), '[]'::json) AS questions
       FROM quizzes q LEFT JOIN questions question ON question.quiz_id = q.id
       LEFT JOIN skills sk ON sk.id = question.skill_id
       WHERE q.session_id = $1 AND q.is_published = true
       GROUP BY q.id ORDER BY q.title`,
      [sessionId],
    )
    return res.json({ quizzes: result.rows })
  } catch (error) { return next(error) }
})

// Exported for the server's 15-second expiry sweep and the lazy close route state.
export async function closeExpiredAttendance() {
  await pool.query(
    `UPDATE course_sessions SET attendance_code = NULL, is_attendance_open = false, attendance_expires_at = NULL
     WHERE is_attendance_open = true AND attendance_expires_at <= now()`,
  )
}
