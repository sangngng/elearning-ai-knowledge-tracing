# E-Learning AI Backend

Express/TypeScript API for PostgreSQL (14 tables). The database covers semesters, course classes, enrollments, 15-session schedules, attendance PINs, session materials, and session-linked quiz telemetry.

## Database setup

- For a new database, create a PostgreSQL database and run `db/schema.sql`.
- To re-apply the schema to an existing database, back up first; the script is idempotent and can be rerun safely.
- Copy `.env.example` to `.env` and set `DATABASE_URL` and a long, private `JWT_SECRET`.

Install from this folder with `npm ci`; start with `npm run dev`. The API defaults to `http://localhost:8080`.

## Authentication

Registration and login return a one-day JWT. Send it as `Authorization: Bearer <token>`. Registration creates student accounts. Instructors and administrators must be provisioned with their roles by an administrator.

## Source layout

```text
src/
  server.ts            start-up and the attendance expiry sweep
  app.ts              CORS, JSON parser, health check, error handler
  config/             env.ts (environment) and database.ts (pg pool)
  middleware/auth.ts  authenticate and requireRoles
  routes/             index.ts, auth.ts, academic.ts, quizzes.ts
```

## Main endpoints

- `GET /api/me` — authenticated user's profile (`id`, `name`, `email`, `role`, `created_at`).
- `GET /api/classes` — classes taught by the current instructor or enrolled by the current student, with course, semester, instructor, capacity, and enrolled count.
- `GET /api/schedule?semesterId=<uuid>` — current user's enrolled/taught class sessions, ordered by date and time.
- `GET /api/classes/:classId/sessions` — the class's numbered sessions and materials; PIN is visible only to its instructor/admin while active.
- `POST /api/classes/:classId/enrollments/import` — instructor of the class (or admin) imports the class list from the university registration system, body `{ "emails": ["b.nguyen@hcmut.edu.vn", ...] }` (1–500). All or nothing; returns `added`, `alreadyEnrolled`, `notFound`. The database capacity trigger rejects an import that would exceed `max_capacity` (409), also under concurrent imports. Students cannot enroll themselves.
- `POST /api/classes/:classId/sessions` — instructor creates one session (`sessionNumber` 1–15).
- `POST /api/classes/:classId/sessions/bulk` — instructor creates exactly sessions 1 through 15 transactionally.
- `POST /api/sessions/:sessionId/attendance/open` — instructor opens PIN check-in; valid 1 minute by default (`durationMinutes` 1–15). Returns the four-digit PIN and expiry.
- `POST /api/sessions/:sessionId/attendance/close` — instructor closes check-in and clears the PIN.
- `POST /api/sessions/:sessionId/attendance/check-in` — enrolled student body: `{ "attendanceCode": "4829" }`. Two attempts per student and session: a wrong PIN returns 401 with `attemptsLeft`; after two wrong PINs the student gets 429 and the lecturer records attendance manually. The PIN expires at the database expiry time.
- `PUT /api/sessions/:sessionId/attendance/:userId` — assigned instructor/admin records `{ "status": "present|absent|late|excused", "note": "..." }`. Only enrolled students can be marked; an existing PIN or manual record is updated in place.
- `GET /api/classes/:classId/attendance/summary` — instructor view of capacity, enrolled count, completed sessions, overall/per-student rates, and `sessions` (counts and rate for each numbered session). A completed session without a record counts as absent; an upcoming session without a record does not. Excused students are excluded from the rate denominator.
- `GET /api/sessions/:sessionId/quizzes` — published session quiz/questions; never returns `correct_answer`.
- `POST /api/auth/register`, `POST /api/auth/login` — account creation and login.
- `POST /api/quizzes/:quizId/submit` — records per-question correctness, skill, attempt count, and session for AI telemetry.

See `db/schema.dbml` for the ERD source and `db/schema.sql` for constraints, cascading deletes, and indexes.

## Official CO2003 seed

Run `npm run seed` from this directory after applying `db/schema.sql`. The seed reads `docs/data/dsa_co2003_sessions_en.json` and `docs/data/dsa_co2003_questions_en.json`, uses PostgreSQL-generated UUIDs, and is safe to rerun. It creates the sample instructor, eight students, CO2003/CC01, 15 sessions, 11 skills, and 40 questions. Sample password for all seeded accounts: `Demo@2026`.

The integration tests use a dedicated database URL. Set `TEST_DATABASE_URL` to an empty local test database before running `npm test`; the suite applies the schema and cleans up its fixture rows. For PowerShell, set `$env:TEST_DATABASE_URL = 'postgresql://postgres:postgres@localhost:55432/elearning_test'` first. Do not point it at a database containing user data.
