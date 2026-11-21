import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Pool } from 'pg'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

type SessionData = {
  session_number: number
  title: string
  skill_code: string
  objective: string
  week: number
  room: string
  start_time: string
  end_time: string
}

type QuestionData = {
  question_code: string
  session_number: number
  skill_code: string
  difficulty: string
  question: string
  options: Array<{ id: string; text: string }>
  correct_answer: string
  explanation: string
}

const samplePassword = 'Demo@2026'
const instructor = { name: 'Nguyen Van A', email: 'a.nguyen@hcmut.edu.vn', role: 'instructor' }
const students = [
  { name: 'Nguyen Van B', email: 'b.nguyen@hcmut.edu.vn' },
  { name: 'Tran Thi C', email: 'c.tran@hcmut.edu.vn' },
  { name: 'Le Van D', email: 'd.le@hcmut.edu.vn' },
  { name: 'Pham Van E', email: 'e.pham@hcmut.edu.vn' },
  { name: 'Hoang Thi F', email: 'f.hoang@hcmut.edu.vn' },
  { name: 'Vu Van G', email: 'g.vu@hcmut.edu.vn' },
  { name: 'Do Van H', email: 'h.do@hcmut.edu.vn' },
  { name: 'Ngo Thi K', email: 'k.ngo@hcmut.edu.vn' },
]

const skillNames: Record<string, string> = {
  'DSA-ARRAY': 'Arrays and pointers',
  'DSA-COMPLEXITY': 'Algorithm complexity',
  'DSA-LINKEDLIST': 'Linked lists',
  'DSA-STACK': 'Stacks',
  'DSA-QUEUE': 'Queues',
  'DSA-RECURSION': 'Recursion',
  'DSA-SORT': 'Sorting',
  'DSA-TREE': 'Trees',
  'DSA-HEAP': 'Heaps',
  'DSA-GRAPH': 'Graphs',
  'DSA-HASH': 'Hash tables',
}

function firstTuesdayOnOrAfter(date: string) {
  const cursor = new Date(`${date}T00:00:00.000Z`)
  while (cursor.getUTCDay() !== 2) cursor.setUTCDate(cursor.getUTCDate() + 1)
  return cursor
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

async function loadJson<T>(fileName: string): Promise<T> {
  const filePath = path.resolve(__dirname, '../../docs/data', fileName)
  return JSON.parse(await readFile(filePath, 'utf8')) as T
}

async function seed() {
  const sessionsFile = await loadJson<{ course_code: string; course_name: string; sessions: SessionData[] }>('dsa_co2003_sessions_en.json')
  const questionsFile = await loadJson<{ course_code: string; questions: QuestionData[] }>('dsa_co2003_questions_en.json')
  const skillCodes = [...new Set(questionsFile.questions.map((item) => item.skill_code))]
  // The question bank grows over time, so only require a minimum per skill (4) rather than a fixed total.
  const MIN_QUESTIONS_PER_SKILL = 4
  const perSkill = new Map<string, number>()
  for (const item of questionsFile.questions) perSkill.set(item.skill_code, (perSkill.get(item.skill_code) ?? 0) + 1)
  const thinSkills = [...perSkill].filter(([, count]) => count < MIN_QUESTIONS_PER_SKILL).map(([code]) => code)
  if (sessionsFile.sessions.length !== 15 || skillCodes.length !== 11 || thinSkills.length) {
    throw new Error(`Expected 15 sessions, 11 skills and at least ${MIN_QUESTIONS_PER_SKILL} questions per skill; found ${sessionsFile.sessions.length} sessions, ${skillCodes.length} skills, thin skills: ${thinSkills.join(', ') || 'none'}`)
  }
  const sessionNumbers = new Set(sessionsFile.sessions.map((item) => item.session_number))
  if (!Array.from({ length: 15 }, (_, index) => index + 1).every((number) => sessionNumbers.has(number))
    || questionsFile.questions.some((item) => !sessionNumbers.has(item.session_number))) {
    throw new Error('Session JSON must define each session from 1 to 15 and every question must reference one of them')
  }
  if (sessionsFile.course_code !== 'CO2003' || questionsFile.course_code !== 'CO2003') {
    throw new Error('Seed JSON files must both describe CO2003')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/elearning',
    connectionTimeoutMillis: 5_000,
  })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const passwordHash = await bcrypt.hash(samplePassword, 10)
    const userIds = new Map<string, string>()
    for (const user of [instructor, ...students]) {
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4::user_role)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name,
           password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
         RETURNING id`,
        [user.name, user.email, passwordHash, 'role' in user ? user.role : 'student'],
      )
      userIds.set(user.email, result.rows[0].id)
    }

    await client.query("UPDATE semesters SET is_active = false WHERE is_active AND code <> 'HK261'")
    const semesterResult = await client.query(
      `INSERT INTO semesters (code, name, start_date, end_date, is_active)
       VALUES ('HK261', 'Semester 1, 2026-2027', '2026-09-07', '2026-12-27', true)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date, is_active = true
       RETURNING id`,
    )
    const semesterId = semesterResult.rows[0].id
    const instructorId = userIds.get(instructor.email)!
    const courseTitle = `${sessionsFile.course_code} ${sessionsFile.course_name}`
    let courseResult = await client.query(
      'SELECT id FROM courses WHERE instructor_id = $1 AND title = $2 ORDER BY created_at LIMIT 1',
      [instructorId, courseTitle],
    )
    if (!courseResult.rowCount) {
      courseResult = await client.query(
        `INSERT INTO courses (instructor_id, title, description, is_published)
         VALUES ($1, $2, '15-session demonstration course for HK261', true) RETURNING id`,
        [instructorId, courseTitle],
      )
    } else {
      await client.query('UPDATE courses SET description = $2, is_published = true WHERE id = $1', [courseResult.rows[0].id, '15-session demonstration course for HK261'])
    }
    const courseId = courseResult.rows[0].id
    const classResult = await client.query(
      `INSERT INTO course_classes (course_id, semester_id, class_code, instructor_id, max_capacity, default_room)
       VALUES ($1, $2, 'CC01', $3, 60, 'H6-302')
       ON CONFLICT (semester_id, class_code) DO UPDATE SET course_id = EXCLUDED.course_id,
         instructor_id = EXCLUDED.instructor_id, max_capacity = EXCLUDED.max_capacity,
         default_room = EXCLUDED.default_room
       RETURNING id`,
      [courseId, semesterId, instructorId],
    )
    const classId = classResult.rows[0].id

    for (const code of skillCodes) {
      await client.query(
        `INSERT INTO skills (code, name) VALUES ($1, $2)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name`,
        [code, skillNames[code] ?? code.replace(/^DSA-/, '').toLowerCase()],
      )
    }

    for (const student of students) {
      await client.query(
        `INSERT INTO enrollments (class_id, user_id, status) VALUES ($1, $2, 'enrolled')
         ON CONFLICT (class_id, user_id) DO UPDATE SET status = 'enrolled', enrolled_at = now()`,
        [classId, userIds.get(student.email)],
      )
    }

    const firstDate = firstTuesdayOnOrAfter('2026-09-07')
    const sessionIds = new Map<number, string>()
    for (const session of sessionsFile.sessions) {
      const sessionDate = new Date(firstDate)
      sessionDate.setUTCDate(firstDate.getUTCDate() + (session.session_number - 1) * 7)
      const result = await client.query(
        `INSERT INTO course_sessions (class_id, session_number, title, session_date, start_time, end_time, room)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (class_id, session_number) DO UPDATE SET title = EXCLUDED.title,
           session_date = EXCLUDED.session_date, start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time, room = EXCLUDED.room
         RETURNING id`,
        [classId, session.session_number, session.title, formatDate(sessionDate), session.start_time, session.end_time, session.room],
      )
      const sessionId = result.rows[0].id
      sessionIds.set(session.session_number, sessionId)
      const quizTitle = `Quiz ${session.session_number}`
      let quizResult = await client.query('SELECT id FROM quizzes WHERE session_id = $1 AND title = $2 LIMIT 1', [sessionId, quizTitle])
      if (!quizResult.rowCount) {
        quizResult = await client.query(
          'INSERT INTO quizzes (session_id, title, is_published) VALUES ($1, $2, true) RETURNING id',
          [sessionId, quizTitle],
        )
      } else {
        await client.query('UPDATE quizzes SET is_published = true WHERE id = $1', [quizResult.rows[0].id])
      }
      const quizId = quizResult.rows[0].id
      const quizQuestions = questionsFile.questions.filter((item) => item.session_number === session.session_number)
      for (const [index, question] of quizQuestions.entries()) {
        await client.query(
          `INSERT INTO questions (quiz_id, skill_id, prompt, options, correct_answer, position)
           VALUES ($1, (SELECT id FROM skills WHERE code = $2), $3, $4::jsonb, $5, $6)
           ON CONFLICT (quiz_id, position) DO UPDATE SET skill_id = EXCLUDED.skill_id,
             prompt = EXCLUDED.prompt, options = EXCLUDED.options, correct_answer = EXCLUDED.correct_answer`,
          [quizId, question.skill_code, question.question, JSON.stringify(question.options), question.correct_answer, index + 1],
        )
      }
    }

    await client.query('COMMIT')
    console.log(`Seeded ${courseTitle}: 1 instructor, ${students.length} students, 1 class, ${sessionIds.size} sessions, ${skillCodes.length} skills, ${questionsFile.questions.length} questions.`)
    console.log(`Sample login: ${instructor.email} / ${samplePassword}`)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((error: unknown) => {
  console.error('CO2003 seed failed:', error)
  process.exitCode = 1
})
