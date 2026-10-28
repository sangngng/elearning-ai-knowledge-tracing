

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_method AS ENUM ('pin', 'qr', 'manual');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('enrolled', 'dropped', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE material_type AS ENUM ('slide', 'document', 'code', 'video');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- -----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(20),                -- MSSV (e.g. '2353046')
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. ACADEMIC SEMESTERS (HỌC KỲ)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,      -- e.g. 'HK261', 'HK262'
  name VARCHAR(100) NOT NULL,            -- 'Học kỳ 1 năm học 2026-2027'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. COURSES & COURSE CLASSES (MÔN HỌC & LỚP MÔN HỌC)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,      -- e.g. 'CO2003' (DSA)
  title VARCHAR(200) NOT NULL,           -- 'Cấu trúc Dữ liệu và Giải thuật'
  credits INTEGER NOT NULL DEFAULT 4,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE RESTRICT,
  class_code VARCHAR(50) NOT NULL,       -- e.g. 'CC01', 'L01'
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  max_capacity INTEGER NOT NULL DEFAULT 60,
  default_room VARCHAR(100) DEFAULT 'H6-302',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, semester_id, class_code)
);

-- -----------------------------------------------------------------------------
-- 4. ENROLLMENTS (DANH SÁCH SINH VIÊN ĐĂNG KÝ HỌC & THỐNG KÊ SĨ SỐ)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES course_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status enrollment_status NOT NULL DEFAULT 'enrolled',
  final_grade NUMERIC(4, 2),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 5. COURSE SESSIONS & TIMETABLE (15 BUỔI HỌC THEO THỜI KHÓA BIỂU)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES course_classes(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL CHECK (session_number BETWEEN 1 AND 20),
  title VARCHAR(255) NOT NULL,           -- e.g. 'Buổi 3: Danh sách liên kết đơn & đôi'
  description TEXT,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '07:30:00',
  end_time TIME NOT NULL DEFAULT '11:15:00',
  room VARCHAR(100) DEFAULT 'H6-302',
  
  -- Live Attendance Verification Controls:
  attendance_code VARCHAR(6),            -- 4-6 digit dynamic PIN (e.g. '4829')
  is_attendance_open BOOLEAN NOT NULL DEFAULT false,
  attendance_expires_at TIMESTAMPTZ,     -- Auto-locks after 10-15 mins
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, session_number)
);

-- -----------------------------------------------------------------------------
-- 6. SESSION MATERIALS (TÀI LIỆU BÀI GIẢNG TỪNG BUỔI: SLIDE, CODE, VIDEO)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  material_type material_type NOT NULL DEFAULT 'slide',
  file_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 7. ATTENDANCE RECORDS (KẾT QUẢ ĐIỂM DANH TỪNG BUỔI)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'absent',
  checkin_time TIMESTAMPTZ,
  method attendance_method NOT NULL DEFAULT 'manual',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 8. KNOWLEDGE COMPONENTS (SKILLS TAXONOMY)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,      -- e.g. 'DSA-LINKEDLIST', 'DSA-TREE'
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 9. QUIZZES & QUESTIONS (BÀI KIỂM TRA TƯƠNG TÁC GẮN VỚI BUỔI HỌC)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,           -- e.g. 'Quiz củng cố Buổi 3: Linked List'
  time_limit_minutes INTEGER NOT NULL DEFAULT 15,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- ['A. ...', 'B. ...', 'C. ...', 'D. ...']
  correct_answer TEXT NOT NULL,          -- Secured on server side
  explanation TEXT,
  position INTEGER NOT NULL CHECK (position > 0),
  UNIQUE (quiz_id, position),
  UNIQUE (id, skill_id)
);

-- -----------------------------------------------------------------------------
-- 10. QUIZ INTERACTIONS TELEMETRY (AI KNOWLEDGE TRACING STREAM)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  is_correct BOOLEAN NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1 CHECK (attempt_count > 0),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (question_id, skill_id) REFERENCES questions(id, skill_id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- PERFORMANCE OPTIMIZATION INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_classes_course_semester ON course_classes(course_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_user ON enrollments(class_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_class_date ON course_sessions(class_id, session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON attendance_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id, position);
CREATE INDEX IF NOT EXISTS idx_quiz_interactions_user_skill_time ON quiz_interactions(user_id, skill_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_interactions_question_attempt ON quiz_interactions(user_id, question_id, attempt_count DESC);
