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

- `GET /api/schedule?semesterId=<uuid>` — current user's enrolled/taught class sessions, ordered by date and time.
- `GET /api/classes/:classId/sessions` — the class's numbered sessions and materials; PIN is visible only to its instructor/admin while active.
- `POST /api/classes/:classId/enroll` — student enrollment; the database capacity trigger serializes concurrent joins.
- `POST /api/classes/:classId/sessions` — instructor creates one session (`sessionNumber` 1–15).
- `POST /api/classes/:classId/sessions/bulk` — instructor creates exactly sessions 1 through 15 transactionally.
- `POST /api/sessions/:sessionId/attendance/open` — instructor opens PIN check-in for 10–15 minutes; defaults to 10. Returns the four-digit PIN and expiry.
- `POST /api/sessions/:sessionId/attendance/close` — instructor closes check-in and clears the PIN.
- `POST /api/sessions/:sessionId/attendance/check-in` — enrolled student body: `{ "attendanceCode": "4829" }`. PIN expires at the database expiry time and is rate-limited to five failed attempts per 15 minutes.
- `GET /api/classes/:classId/attendance/summary` — instructor view of capacity, enrolled count, completed sessions, overall attendance rate, and per-student rates. Excused sessions are excluded from the denominator.
- `GET /api/sessions/:sessionId/quizzes` — published session quiz/questions; never returns `correct_answer`.
- `POST /api/auth/register`, `POST /api/auth/login` — account creation and login.
- `POST /api/quizzes/:quizId/submit` — records per-question correctness, skill, attempt count, and session for AI telemetry.

See `db/schema.dbml` for the ERD source and `db/schema.sql` for constraints, cascading deletes, and indexes.
