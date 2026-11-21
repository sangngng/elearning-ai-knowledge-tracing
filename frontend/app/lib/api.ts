// Client for the BK-LMS REST API (backend/src/routes).
// The access token lives in sessionStorage: it survives a page reload but not closing the tab,
// and it is sent as "Authorization: Bearer <token>" on every request.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const TOKEN_KEY = 'bklms-token';

/* -------------------------------------------------------------------- types */
export type Role = 'student' | 'instructor' | 'admin';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export interface User { id: string; name: string; email: string; role: Role; created_at?: string }

export interface ClassInfo {
  class_id: string; class_code: string; max_capacity: number; default_room: string | null;
  course_id: string; course_title: string; course_description: string | null;
  semester_id: string; semester_code: string; semester_name: string;
  instructor_id: string; instructor_name: string; enrolled_count: number; my_role: Role;
}

export interface ScheduleItem {
  session_id: string; session_number: number; session_title: string;
  session_date: string; start_time: string; end_time: string; room: string | null;
  period_start: number | null; period_end: number | null;
  class_id: string; class_code: string; default_room: string | null; semester_id: string;
  course_id: string; course_title: string; instructor_id: string; instructor_name: string;
  my_attendance: AttendanceStatus | null;
}

export interface Material { id: string; title: string; materialType: 'slide' | 'code' | 'video'; fileUrl: string; position: number }

export interface Session {
  id: string; class_id: string; session_number: number; title: string;
  session_date: string; start_time: string; end_time: string; room: string | null;
  is_attendance_open: boolean; attendance_code: string | null; attendance_expires_at: string | null;
  materials: Material[];
}

export interface RosterEntry {
  user_id: string; name: string; email: string; status: AttendanceStatus | null;
  method: 'pin' | 'qr' | 'manual' | null; checkin_time: string | null; note: string | null; failed_pin_attempts: number;
}

export interface SessionAttendance {
  session: Pick<Session, 'id' | 'class_id' | 'session_number' | 'title' | 'is_attendance_open' | 'attendance_code' | 'attendance_expires_at'>;
  students: RosterEntry[];
}

export interface AttendanceSummary {
  class_code: string; course_title: string; semester_code: string; max_capacity: number;
  enrolled_count: number; completed_sessions: number; attended_checkins: number;
  attendance_rate_percent: string | number | null;
  students: Array<{ userId: string; name: string; email: string; completedSessions: number; attendedSessions: number; excusedSessions: number; attendanceRatePercent: string | number | null }>;
  sessions: Array<{ sessionId: string; sessionNumber: number; title: string; sessionDate: string; enrolledCount: number; presentCount: number; lateCount: number; absentCount: number; excusedCount: number; attendanceRatePercent: string | number | null }>;
}

export interface QuizQuestion { id: string; skillId: string; skillCode: string; prompt: string; options: Array<{ id: string; text: string }>; position: number }
export interface Quiz { quizId: string; quizTitle: string; questions: QuizQuestion[] }
export interface QuizResult { quizId: string; score: number; total: number; results: Array<{ questionId: string; skillId: string; isCorrect: boolean; attempt_count: number; created_at: string }> }

/* ------------------------------------------------------------------- errors */
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown> | null;
  constructor(status: number, message: string, data: Record<string, unknown> | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let unauthorizedHandler: (() => void) | null = null;
/** Called whenever the API answers 401 to a request that carried a token (expired or invalid). */
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function getToken(): string | null {
  try { return window.sessionStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null): void {
  try {
    if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
    else window.sessionStorage.removeItem(TOKEN_KEY);
  } catch { /* storage blocked: the login then lasts until reload */ }
}

const MESSAGES: Record<number, string> = {
  0: 'Không kết nối được máy chủ. Kiểm tra backend đã chạy chưa.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu.',
  500: 'Máy chủ gặp lỗi. Vui lòng thử lại.',
};

interface RequestOptions { method?: 'GET' | 'POST' | 'PUT'; body?: unknown; auth?: boolean }

export async function request<T>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, MESSAGES[0]);
  }
  let data: Record<string, unknown> | null = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text) as Record<string, unknown>; } catch { data = null; }
  }
  if (!response.ok) {
    // A wrong attendance PIN also answers 401; that is not an expired login.
    if (response.status === 401 && token && unauthorizedHandler && !path.endsWith('/check-in')) unauthorizedHandler();
    const message = (typeof data?.error === 'string' && data.error) || MESSAGES[response.status] || `Lỗi ${response.status}`;
    throw new ApiError(response.status, message, data);
  }
  return data as T;
}

/* ---------------------------------------------------------------- endpoints */
export const api = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request<{ user: User }>('/api/me'),
  classes: () => request<{ classes: ClassInfo[] }>('/api/classes'),
  schedule: () => request<{ sessions: ScheduleItem[] }>('/api/schedule'),
  sessions: (classId: string) => request<{ sessions: Session[] }>(`/api/classes/${classId}/sessions`),
  attendanceSummary: (classId: string) => request<{ summary: AttendanceSummary }>(`/api/classes/${classId}/attendance/summary`),
  sessionAttendance: (sessionId: string) => request<SessionAttendance>(`/api/sessions/${sessionId}/attendance`),
  openAttendance: (sessionId: string, durationMinutes = 1) =>
    request<{ sessionId: string; attendanceCode: string; expiresAt: string }>(`/api/sessions/${sessionId}/attendance/open`, { method: 'POST', body: { durationMinutes } }),
  closeAttendance: (sessionId: string) =>
    request<{ sessionId: string; attendanceOpen: false }>(`/api/sessions/${sessionId}/attendance/close`, { method: 'POST', body: {} }),
  checkIn: (sessionId: string, attendanceCode: string) =>
    request<{ sessionId: string; status: AttendanceStatus; alreadyCheckedIn?: boolean }>(`/api/sessions/${sessionId}/attendance/check-in`, { method: 'POST', body: { attendanceCode } }),
  setAttendance: (sessionId: string, userId: string, status: AttendanceStatus, note?: string) =>
    request<{ attendance: unknown }>(`/api/sessions/${sessionId}/attendance/${userId}`, { method: 'PUT', body: note ? { status, note } : { status } }),
  quizzes: (sessionId: string) => request<{ quizzes: Quiz[] }>(`/api/sessions/${sessionId}/quizzes`),
  submitQuiz: (quizId: string, answers: Array<{ questionId: string; answer: string }>) =>
    request<QuizResult>(`/api/quizzes/${quizId}/submit`, { method: 'POST', body: { answers } }),
};

/* ------------------------------------------------------------------ helpers */
const DAY_NAMES = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** "2026-09-08" or an ISO timestamp -> local Date at midnight of that calendar day. */
export function dayOf(value: string): Date {
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}
export const fmtDate = (value: string) => dayOf(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const dayName = (value: string) => DAY_NAMES[dayOf(value).getDay()];
export const hm = (time: string | null | undefined) => String(time || '').slice(0, 5);

type Timed = { session_date: string; start_time: string; end_time: string };

/** Start and end of a session as Date objects in the browser's time zone. */
export function sessionWindow(s: Timed): { start: Date; end: Date } {
  const day = dayOf(s.session_date);
  const at = (t: string) => {
    const [h, m] = hm(t).split(':').map(Number);
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
  };
  return { start: at(s.start_time), end: at(s.end_time) };
}
export type SessionPhase = 'done' | 'today' | 'upcoming';
export function sessionPhase(s: Timed, now: Date = new Date()): SessionPhase {
  if (sessionWindow(s).end < now) return 'done';
  return dayOf(s.session_date).toDateString() === now.toDateString() ? 'today' : 'upcoming';
}

/** "CO2003 Data Structures and Algorithms" -> { code: 'CO2003', name: 'Data Structures and Algorithms' } */
export function splitCourseTitle(title = ''): { code: string; name: string } {
  const m = /^([A-Z]{2}\d{4})\s*[-:]?\s*(.*)$/.exec(title.trim());
  return m ? { code: m[1], name: m[2] || title } : { code: '', name: title };
}

export const roleLabel = (role: Role | string) =>
  ({ instructor: 'Giảng viên', admin: 'Quản trị viên', student: 'Sinh viên' } as Record<string, string>)[role] || role;
