# Task Board

Owners: **Sang** (frontend, integration, report, leader), **Hao** (backend, database), **Tuan** (requirements, dataset, report content).
Status: `todo`, `doing`, `review`, `done`. The leader checks the board on Wednesday and Friday.

## Sprint 1 --- 16/11 to 22/11 (goal: a real, integrated system)

| ID | Task | Owner | Due | Deliverable | Status |
|---|---|---|---|---|---|
| S1-1 | Replace static data with API calls: login, timetable, session list, PIN check-in | Sang | 20/11 | Frontend branch that runs against the backend | todo |
| S1-2 | Add `.env` handling and a typed API client in the frontend | Sang | 18/11 | `frontend/lib/api.ts` | todo |
| S1-3 | Seed script for CO2003: users, class, 15 sessions, 40 questions, 11 skills | Hao | 18/11 | `backend/db/seed.sql` or script, reproducible | todo |
| S1-4 | Dockerfiles for backend and frontend; make `docker compose up` work | Hao | 19/11 | Dockerfiles, working compose | todo |
| S1-5 | Execute test cases T13--T16 for real and record the results | Hao | 18/11 | Test log in `docs/testing/` | todo |
| S1-6 | Automated tests for PIN attendance: lockout after 5 failures, expired PIN, duplicate check-in | Hao | 19/11 | Test files and a pass/fail report | todo |
| S1-7 | Concurrency test of the capacity trigger | Hao | 20/11 | Script and result | todo |
| S1-8 | Rewrite detailed specifications of UC1--UC3 (same format as UC5--UC7) | Tuan | 18/11 | Updated docx and markdown | todo |
| S1-9 | Review the 40 questions and 11 skill labels against the 15 sessions | Tuan | 19/11 | Corrected JSON and a change list | todo |
| S1-10 | Verify the 44 references and add access dates | Tuan | 20/11 | Corrected reference list | todo |
| S1-11 | Write the BKeL comparison and risk sections | Tuan | 21/11 | Two sections, 4--5 pages | todo |
| S1-12 | API and security chapter (endpoints, authentication, rate limit) | Hao | 21/11 | 3--4 pages | todo |
| S1-13 | Merge contributions, rebuild the report, prepare meeting 5 | Sang | 22/11 | Report and demo | todo |

## Sprint 2 --- 23/11 to 06/12 (goal: complete UC1--UC7, 50 pages)

| ID | Task | Owner | Due |
|---|---|---|---|
| S2-1 | Instructor screens: open and close PIN, attendance summary, session management | Sang | 29/11 |
| S2-2 | Student screens: enrollment, materials, quiz taking with answers stored | Sang | 29/11 |
| S2-3 | Missing endpoints for quizzes (submit, results) and materials, with tests | Hao | 27/11 |
| S2-4 | Role-based access tests (student cannot call instructor endpoints) | Hao | 29/11 |
| S2-5 | Demo script for each use case with expected result | Tuan | 29/11 |
| S2-6 | Report to 50 pages (30/11 milestone) | All | 30/11 |
| S2-7 | End-to-end test of all use cases and a defect list | Tuan | 04/12 |
| S2-8 | Fix defects, performance check of the timetable and summary queries | Hao, Sang | 05/12 |

## Sprint 3 --- 07/12 to 20/12 (goal: quality and 70 pages)

Test report, security review, accessibility and usability check, report to 70 pages by 15/12, slides draft, meeting 7 rehearsal.

## Sprint 4 --- 21/12 to 31/12

Release freeze and tag, final report, slides, two defense rehearsals.
