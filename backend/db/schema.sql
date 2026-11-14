-- E-Learning AI PostgreSQL schema (14 tables, 3NF).
-- Safe to rerun: every statement is idempotent.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_date <= end_date)
);

CREATE TABLE IF NOT EXISTS course_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
  class_code VARCHAR(40) NOT NULL,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  max_capacity INTEGER NOT NULL DEFAULT 60 CHECK (max_capacity > 0),
  default_room VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (semester_id, class_code)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES course_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  final_grade NUMERIC(5,2) CHECK (final_grade BETWEEN 0 AND 100),
  UNIQUE (class_id, user_id)
);

CREATE OR REPLACE FUNCTION enforce_course_class_capacity() RETURNS trigger AS $$
DECLARE
  capacity_limit INTEGER;
  current_enrollment_count INTEGER;
BEGIN
  IF NEW.status <> 'enrolled' THEN
    RETURN NEW;
  END IF;

  -- Serialize joins to the same class so concurrent requests cannot exceed capacity.
  SELECT max_capacity INTO capacity_limit
  FROM course_classes WHERE id = NEW.class_id FOR UPDATE;

  SELECT count(*) INTO current_enrollment_count
  FROM enrollments
  WHERE class_id = NEW.class_id AND status = 'enrolled'
    AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF current_enrollment_count >= capacity_limit THEN
    RAISE EXCEPTION 'Class capacity has been reached' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS course_class_capacity_trigger ON enrollments;
CREATE TRIGGER course_class_capacity_trigger
BEFORE INSERT OR UPDATE OF class_id, status ON enrollments
FOR EACH ROW EXECUTE FUNCTION enforce_course_class_capacity();

CREATE TABLE IF NOT EXISTS course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES course_classes(id) ON DELETE CASCADE,
  session_number SMALLINT NOT NULL CHECK (session_number BETWEEN 1 AND 15),
  title VARCHAR(200) NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(80),
  attendance_code VARCHAR(4),
  is_attendance_open BOOLEAN NOT NULL DEFAULT false,
  attendance_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, session_number),
  CHECK (end_time > start_time),
  CHECK (attendance_code IS NULL OR attendance_code ~ '^[0-9]{4}$'),
  CHECK (is_attendance_open = (attendance_code IS NOT NULL AND attendance_expires_at IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS session_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  material_type VARCHAR(16) NOT NULL CHECK (material_type IN ('slide', 'code', 'video')),
  file_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1 CHECK (position > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, position)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  position INTEGER NOT NULL CHECK (position > 0),
  UNIQUE (quiz_id, position),
  UNIQUE (id, skill_id)
);

CREATE TABLE IF NOT EXISTS quiz_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  is_correct BOOLEAN NOT NULL,
  attempt_count INTEGER NOT NULL CHECK (attempt_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT quiz_interactions_question_skill_fk
    FOREIGN KEY (question_id, skill_id) REFERENCES questions(id, skill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  checkin_time TIMESTAMPTZ,
  method VARCHAR(16) CHECK (method IN ('pin', 'qr', 'manual')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id),
  CHECK (status NOT IN ('present', 'late') OR (checkin_time IS NOT NULL AND method IS NOT NULL))
);

-- Limits guessing attempts for the short-lived four-digit PIN.
CREATE TABLE IF NOT EXISTS attendance_pin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  succeeded BOOLEAN NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS semesters_single_active_idx ON semesters(is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS course_classes_course_semester_idx ON course_classes(course_id, semester_id);
CREATE INDEX IF NOT EXISTS enrollments_class_status_idx ON enrollments(class_id, status);
CREATE INDEX IF NOT EXISTS enrollments_user_status_idx ON enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS course_sessions_class_date_idx ON course_sessions(class_id, session_date, start_time);
CREATE INDEX IF NOT EXISTS session_materials_session_position_idx ON session_materials(session_id, position);
CREATE INDEX IF NOT EXISTS quizzes_session_idx ON quizzes(session_id);
CREATE INDEX IF NOT EXISTS questions_quiz_position_idx ON questions(quiz_id, position);
CREATE INDEX IF NOT EXISTS attendance_records_user_session_idx ON attendance_records(user_id, session_id);
CREATE INDEX IF NOT EXISTS attendance_pin_attempts_rate_limit_idx ON attendance_pin_attempts(session_id, user_id, attempted_at DESC) WHERE NOT succeeded;
CREATE INDEX IF NOT EXISTS quiz_interactions_user_skill_time_idx ON quiz_interactions(user_id, skill_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_interactions_session_user_time_idx ON quiz_interactions(session_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS quiz_interactions_question_attempt_idx ON quiz_interactions(user_id, question_id, attempt_count DESC);

COMMENT ON COLUMN questions.correct_answer IS 'Private answer key. Never include this column in learner-facing API responses.';
COMMENT ON COLUMN course_sessions.attendance_code IS 'Four-digit PIN returned only to the assigned instructor while the attendance window is active.';

CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY CHECK (version > 0),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO schema_version (version) VALUES (1) ON CONFLICT (version) DO NOTHING;
