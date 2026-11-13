# Project Roadmap — E-Learning System (HK261-DAGD1-480)

Project leader: coordination, scheduling, quality gate. Supervisor meetings are held on Sundays, every two weeks.

## Scope rule

The supervisor asked for the e-learning system to be finished well first and the AI part later. Until told otherwise, `ai_service/` is parked (baseline only) and the report does not cover AI beyond the HK262 plan.

## Supervisor meetings and report milestones

| Date | Event | What must be ready |
|---|---|---|
| 15/11/2026 | Report milestone | Report at least 30 pages (done: 40 pages) |
| 22/11/2026 | Supervisor meeting 5 | Frontend connected to the backend for login, timetable, sessions and PIN attendance; test results for T13--T16; report draft |
| 30/11/2026 | Report milestone | Report at least 50 pages |
| 06/12/2026 | Supervisor meeting 6 | Complete system running with one command; full test report; 50-page report |
| 15/12/2026 | Report milestone | Report at least 70 pages |
| 20/12/2026 | Supervisor meeting 7 | Final report draft; rehearsal of the demo |
| 31/12/2026 | Final defense | Frozen release, report, slides |

## Phases

| Phase | Dates | Goal | Exit criteria |
|---|---|---|---|
| 1. Stabilise | 16/11 -- 22/11 | One repository layout, one source of truth, system actually integrated | Frontend calls the real API; `docker compose up` works; T13--T16 executed |
| 2. Complete | 23/11 -- 06/12 | All use cases UC1--UC7 working end to end | Each use case has a passing test and a demo script |
| 3. Harden | 07/12 -- 20/12 | Quality, security, performance, report | Test report, 70-page report, no open critical defects |
| 4. Defend | 21/12 -- 31/12 | Freeze and rehearse | Release tag, slides, two rehearsals |

## Definition of Done (applies to every task)

1. Code merged through a pull request reviewed by another member; TypeScript typecheck passes.
2. A test or a written manual test record exists.
3. Documentation under `docs/` or `report/` updated when behaviour changes.
4. No secrets, absolute local paths, or emoji in source and documents.
5. The owner reports the result to the leader with evidence (log, screenshot, link).

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Frontend uses static data and never calls the API | The demo does not show a real system | Task S1-1 is the top priority of phase 1 |
| `docker-compose.yml` refers to Dockerfiles that do not exist | The system cannot be started with one command | Task S1-4 |
| Report 50 and 70 page milestones | Missing a milestone | Content is written ahead of the dates in the task board |
| Three members work in parallel on one repository | Merge conflicts | Short-lived branches, pull requests, one owner per folder |
