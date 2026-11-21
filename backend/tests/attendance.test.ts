import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import path from 'node:path'
import jwt from 'jsonwebtoken'
import { after, before, test } from 'node:test'
import type { Pool } from 'pg'

const testDatabaseUrl = process.env.TEST_DATABASE_URL
if (!testDatabaseUrl) throw new Error('Set TEST_DATABASE_URL to a dedicated test database before running npm test')
let pool: Pool
let createApp: typeof import('../src/app').createApp

const suffix = randomUUID().replace(/-/g, '').slice(0, 12)
const emails = Array.from({ length: 7 }, (_, index) => `integration-${suffix}-${index}@example.test`)
const names = ['Instructor Test', 'Student One', 'Student Two', 'Student Three', 'Student Four', 'Student Five', 'Student Six']
const users: Array<{ id: string; email: string; name: string; role: 'instructor' | 'student' }> = []
let semesterId = ''
let courseId = ''
let rosterClassId = ''
let capacityClassId = ''
const sessionIds: string[] = []
let server: Server
let baseUrl = ''

function tokenFor(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!)
}

async function request(pathname: string, user: { id: string; role: string }, method = 'GET', body?: unknown) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: { authorization: `Bearer ${tokenFor(user)}`, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json() as Record<string, any>
  return { response, payload }
}

before(async () => {
  process.env.DATABASE_URL = testDatabaseUrl
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'integration-test-secret-only-do-not-deploy'
  ;({ pool } = await import('../src/config/database'))
  ;({ createApp } = await import('../src/app'))
  const schema = await readFile(path.resolve(__dirname, '../db/schema.sql'), 'utf8')
  await pool.query(schema)
  for (const [index, email] of emails.entries()) {
    const role = index === 0 ? 'instructor' : 'student'
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, 'test-only', $3::user_role) RETURNING id`,
      [names[index], email, role],
    )
    users.push({ id: result.rows[0].id, email, name: names[index], role })
  }
  const semester = await pool.query(
    `INSERT INTO semesters (code, name, start_date, end_date, is_active)
     VALUES ($1, 'Integration Test Semester', '2026-01-01', '2099-12-31', false) RETURNING id`,
    [`IT-${suffix}`],
  )
  semesterId = semester.rows[0].id
  const course = await pool.query(
    `INSERT INTO courses (instructor_id, title, description, is_published)
     VALUES ($1, $2, 'Automated integration fixture', true) RETURNING id`,
    [users[0].id, `Integration Test ${suffix}`],
  )
  courseId = course.rows[0].id
  const rosterClass = await pool.query(
    `INSERT INTO course_classes (course_id, semester_id, class_code, instructor_id, max_capacity)
     VALUES ($1, $2, $3, $4, 6) RETURNING id`,
    [courseId, semesterId, `ROSTER-${suffix}`, users[0].id],
  )
  rosterClassId = rosterClass.rows[0].id
  const capacityClass = await pool.query(
    `INSERT INTO course_classes (course_id, semester_id, class_code, instructor_id, max_capacity)
     VALUES ($1, $2, $3, $4, 1) RETURNING id`,
    [courseId, semesterId, `CAP-${suffix}`, users[0].id],
  )
  capacityClassId = capacityClass.rows[0].id
  for (const student of users.slice(1, 3)) {
    await pool.query("INSERT INTO enrollments (class_id, user_id, status) VALUES ($1, $2, 'enrolled')", [rosterClassId, student.id])
  }
  for (const number of [1, 2, 3]) {
    const result = await pool.query(
      `INSERT INTO course_sessions (class_id, session_number, title, session_date, start_time, end_time)
       VALUES ($1, $2, $3, '2026-01-05', '07:00', '09:50') RETURNING id`,
      [rosterClassId, number, `Integration session ${number}`],
    )
    sessionIds.push(result.rows[0].id)
  }

  server = createServer(createApp())
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve())
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Could not bind integration test server')
  baseUrl = `http://127.0.0.1:${address.port}`
})

after(async () => {
  if (server?.listening) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  if (courseId) await pool.query('DELETE FROM courses WHERE id = $1', [courseId])
  if (semesterId) await pool.query('DELETE FROM semesters WHERE id = $1', [semesterId])
  for (const user of users) await pool.query('DELETE FROM users WHERE id = $1', [user.id])
  await pool.end()
})

test('GET /api/me and GET /api/classes return the authenticated student and enrolled class roster', async () => {
  const student = users[1]
  const me = await request('/api/me', student)
  assert.equal(me.response.status, 200)
  assert.equal(me.payload.user.id, student.id)
  assert.equal(me.payload.user.role, 'student')

  const classes = await request('/api/classes', student)
  assert.equal(classes.response.status, 200)
  assert.equal(classes.payload.classes.length, 1)
  assert.equal(classes.payload.classes[0].class_id, rosterClassId)
  assert.equal(classes.payload.classes[0].enrolled_count, 2)

  const instructorClasses = await request('/api/classes', users[0])
  assert.equal(instructorClasses.response.status, 200)
  assert.equal(instructorClasses.payload.classes.length, 2)
  const taught = instructorClasses.payload.classes.find((item: { class_id: string }) => item.class_id === rosterClassId)
  assert.equal(taught.my_role, 'instructor')
  assert.equal(taught.enrolled_count, 2)
})

test('PIN check-in accepts a valid PIN once and rejects duplicate check-in', async () => {
  const opened = await request(`/api/sessions/${sessionIds[0]}/attendance/open`, users[0], 'POST', {})
  assert.equal(opened.response.status, 200)
  assert.match(opened.payload.attendanceCode, /^\d{4}$/)
  const student = users[1]
  const first = await request(`/api/sessions/${sessionIds[0]}/attendance/check-in`, student, 'POST', { attendanceCode: opened.payload.attendanceCode })
  assert.equal(first.response.status, 201)
  assert.equal(first.payload.status, 'present')
  const duplicate = await request(`/api/sessions/${sessionIds[0]}/attendance/check-in`, student, 'POST', { attendanceCode: opened.payload.attendanceCode })
  assert.equal(duplicate.response.status, 200)
  assert.equal(duplicate.payload.alreadyCheckedIn, true)
})

test('PIN expires and two incorrect attempts require lecturer intervention', async () => {
  const expiredOpen = await request(`/api/sessions/${sessionIds[1]}/attendance/open`, users[0], 'POST', {})
  assert.equal(expiredOpen.response.status, 200)
  await pool.query("UPDATE course_sessions SET attendance_expires_at = now() - interval '1 second' WHERE id = $1", [sessionIds[1]])
  const expired = await request(`/api/sessions/${sessionIds[1]}/attendance/check-in`, users[1], 'POST', { attendanceCode: expiredOpen.payload.attendanceCode })
  assert.equal(expired.response.status, 410)

  const opened = await request(`/api/sessions/${sessionIds[2]}/attendance/open`, users[0], 'POST', {})
  const wrongCode = opened.payload.attendanceCode === '0000' ? '9999' : '0000'
  const first = await request(`/api/sessions/${sessionIds[2]}/attendance/check-in`, users[2], 'POST', { attendanceCode: wrongCode })
  assert.equal(first.response.status, 401)
  assert.equal(first.payload.attemptsLeft, 1)
  const second = await request(`/api/sessions/${sessionIds[2]}/attendance/check-in`, users[2], 'POST', { attendanceCode: wrongCode })
  assert.equal(second.response.status, 401)
  assert.equal(second.payload.attemptsLeft, 0)
  const locked = await request(`/api/sessions/${sessionIds[2]}/attendance/check-in`, users[2], 'POST', { attendanceCode: opened.payload.attendanceCode })
  assert.equal(locked.response.status, 429)
})

test('manual attendance updates the record and the summary includes per-session counts', async () => {
  const marked = await request(`/api/sessions/${sessionIds[0]}/attendance/${users[1].id}`, users[0], 'PUT', { status: 'late', note: 'Verified by lecturer' })
  assert.equal(marked.response.status, 200)
  assert.equal(marked.payload.attendance.status, 'late')
  assert.equal(marked.payload.attendance.method, 'manual')
  assert.equal(marked.payload.attendance.note, 'Verified by lecturer')

  const forbiddenStudent = await request(`/api/sessions/${sessionIds[0]}/attendance/${users[3].id}`, users[0], 'PUT', { status: 'present' })
  assert.equal(forbiddenStudent.response.status, 404)

  const summary = await request(`/api/classes/${rosterClassId}/attendance/summary`, users[0])
  assert.equal(summary.response.status, 200)
  assert.equal(summary.payload.summary.sessions.length, 3)
  assert.equal(summary.payload.summary.sessions[0].lateCount, 1)
  assert.equal(summary.payload.summary.sessions[0].absentCount, 1)
  assert.equal(summary.payload.summary.sessions[0].attendanceRatePercent, 50)
})

test('session roster shows statuses and locked PIN attempts; schedule maps times to periods', async () => {
  const roster = await request(`/api/sessions/${sessionIds[0]}/attendance`, users[0])
  assert.equal(roster.response.status, 200)
  assert.equal(roster.payload.session.session_number, 1)
  const marked = roster.payload.students.find((s: { user_id: string }) => s.user_id === users[1].id)
  assert.equal(marked.status, 'late')
  assert.equal(marked.method, 'manual')
  const unmarked = roster.payload.students.find((s: { user_id: string }) => s.user_id === users[2].id)
  assert.equal(unmarked.status, null)

  const lockedRoster = await request(`/api/sessions/${sessionIds[2]}/attendance`, users[0])
  const locked = lockedRoster.payload.students.find((s: { user_id: string }) => s.user_id === users[2].id)
  assert.equal(locked.failed_pin_attempts, 2)

  const asStudent = await request(`/api/sessions/${sessionIds[0]}/attendance`, users[1])
  assert.equal(asStudent.response.status, 403)

  const schedule = await request('/api/schedule', users[1])
  assert.equal(schedule.response.status, 200)
  assert.ok(schedule.payload.sessions.length >= 3)
  for (const session of schedule.payload.sessions) {
    assert.equal(session.period_start, 2)
    assert.equal(session.period_end, 4)
  }
})

test('six simultaneous class-list imports cannot exceed the last seat', async () => {
  const attempts = await Promise.all(users.slice(1).map((student) => request(
    `/api/classes/${capacityClassId}/enrollments/import`,
    users[0],
    'POST',
    { emails: [student.email] },
  )))
  assert.equal(attempts.filter(({ response }) => response.status === 201).length, 1)
  assert.equal(attempts.filter(({ response }) => response.status === 409).length, 5)
  const enrolled = await pool.query("SELECT count(*)::integer AS count FROM enrollments WHERE class_id = $1 AND status = 'enrolled'", [capacityClassId])
  assert.equal(enrolled.rows[0].count, 1)
})
