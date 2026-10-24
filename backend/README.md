# E-Learning AI Backend

Express and TypeScript API backed by PostgreSQL.

## Setup

1. Create a PostgreSQL database named `elearning`.
2. Run `db/schema.sql` against that database.
3. Copy `.env.example` to `.env`, then set `DATABASE_URL` and a private random `JWT_SECRET`.
4. From this folder, install dependencies with `npm install`, then start the API with `npm run dev`.

The API defaults to `http://localhost:8080`. The `GET /health` endpoint does not require a database connection.

## Endpoints

- `POST /api/auth/register` — body: `{ "name", "email", "password" }`; new accounts are students.
- `POST /api/auth/login` — body: `{ "email", "password" }`; returns a one-day JWT.
- `GET /api/lessons` — JWT required; optional `?courseId=...` filter.
- `POST /api/quizzes/:quizId/submit` — JWT required; body: `{ "answers": [{ "questionId": "...", "answer": "..." }] }`.

Pass tokens as `Authorization: Bearer <token>`. Quiz submissions record each answer in `quiz_interactions`, including correctness, skill, and attempt number.

Do not share `.env`; use `.env.example` as the template.
