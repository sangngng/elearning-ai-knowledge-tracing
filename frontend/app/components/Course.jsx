'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import { Avatar, CountUp, Donut, Progress, RadarChart, Ring } from './ui';
import { SKILL_MASTERY_SAMPLE } from '../data/skillMasterySample';
import { api, dayName, dayOf, fmtDate, hm, sessionPhase, sessionWindow, splitCourseTitle } from '../lib/api';
import { classProgress } from './views';

const STATUS = {
  present: { label: 'Có mặt', short: 'CM', tone: 'badge-ok', color: 'var(--ok)' },
  late: { label: 'Đi trễ', short: 'ĐT', tone: 'badge-warn', color: 'var(--warn)' },
  absent: { label: 'Vắng', short: 'V', tone: 'badge-bad', color: 'var(--bad)' },
  excused: { label: 'Có phép', short: 'CP', tone: 'badge-info', color: 'var(--info)' },
};
const NONE = { label: 'Chưa điểm danh', tone: '', color: 'var(--border)' };
const PIN_MAX_ATTEMPTS = 2;
const PIN_DURATIONS = [1, 2, 3, 5, 10, 15];

const STUDENT_TABS = ['sessions', 'attendance', 'timetable', 'quiz', 'radar'];
const LECTURER_TABS = ['sessions', 'attendance', 'timetable', 'participants', 'analytics', 'quiz', 'radar'];
const TAB_INFO = {
  sessions: { label: 'Buổi học', icon: 'book' },
  attendance: { label: 'Điểm danh', icon: 'check-circle' },
  timetable: { label: 'Thời khóa biểu', icon: 'calendar' },
  participants: { label: 'Thành viên', icon: 'users' },
  analytics: { label: 'Thống kê', icon: 'chart' },
  quiz: { label: 'Bài kiểm tra', icon: 'zap' },
  radar: { label: 'Bản đồ năng lực AI', icon: 'brain' },
};

const fmtClock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const secondsLeft = (iso, now) => (iso ? Math.max(0, Math.round((new Date(iso).getTime() - now) / 1000)) : 0);
const levelTone = (m) => (m >= 80 ? 'ok' : m >= 65 ? '' : 'warn');
const levelBadge = (m) => (m >= 80 ? 'badge-ok' : m >= 65 ? 'badge-brand' : 'badge-warn');

/** Re-render every second while `active`, returning Date.now(). */
function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

/** Run `fn` now and then every `ms` while the tab is visible. */
function usePolling(fn, ms, active = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return undefined;
    const tick = () => { if (document.visibilityState === 'visible') ref.current(); };
    const id = window.setInterval(tick, ms);
    return () => window.clearInterval(id);
  }, [ms, active]);
}

/** Session to focus by default: today's, else the next one, else the last one. */
function defaultSession(sessions) {
  const now = new Date();
  return sessions.find((s) => sessionPhase(s, now) === 'today')
    || sessions.find((s) => sessionWindow(s).end >= now)
    || sessions[sessions.length - 1]
    || null;
}

function Loading({ text = 'Đang tải dữ liệu…' }) {
  return <div className="card card-pad muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="spinner" /> {text}</div>;
}
function ErrorBox({ error, onRetry }) {
  return (
    <div className="callout bad" role="alert">
      <Icon name="alert" size={18} /> <span>{error}</span>
      {onRetry && <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={onRetry}>Thử lại</button>}
    </div>
  );
}

/* ================================================================== SHELL */
export default function Course({ app, cls }) {
  const { courseTab, setCourseTab, user, schedule } = app;
  const isLecturer = user.role !== 'student';
  const tabs = (isLecturer ? LECTURER_TABS : STUDENT_TABS).map((id) => ({ id, ...TAB_INFO[id] }));
  const tab = tabs.some((t) => t.id === courseTab) ? courseTab : 'sessions';

  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [focusId, setFocusId] = useState(null); // session selected for attendance / opened in the list

  const loadSessions = useCallback(async () => {
    try {
      const { sessions: rows } = await api.sessions(cls.class_id);
      setSessions(rows);
      setError('');
      setFocusId((cur) => cur ?? defaultSession(rows)?.id ?? null);
    } catch (err) {
      setError(err.message);
    }
  }, [cls.class_id]);
  useEffect(() => { loadSessions(); }, [loadSessions]);
  // Students see a PIN session open within a few seconds.
  usePolling(loadSessions, 5000, !isLecturer && (tab === 'sessions' || tab === 'attendance'));

  const mine = useMemo(() => {
    const map = {};
    schedule.filter((s) => s.class_id === cls.class_id).forEach((s) => { map[s.session_id] = s; });
    return map;
  }, [schedule, cls.class_id]);

  const { code, name } = splitCourseTitle(cls.course_title);
  const progress = classProgress(schedule, cls.class_id);
  const openSession = sessions?.find((s) => s.is_attendance_open);
  const focus = sessions && defaultSession(sessions);
  const now = useNow(Boolean(openSession));

  const ctx = {
    app, cls, isLecturer, sessions, mine, reload: loadSessions, focusId,
    goAttendance: (sessionId) => { setFocusId(sessionId); setCourseTab('attendance'); },
  };

  return (
    <div className="view">
      <section className="course-hero">
        <svg className="pat" width="100%" height="100%" aria-hidden="true">
          <defs>
            <pattern id="hero-tri" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M22 6 38 36H6z" fill="none" stroke="#fff" strokeOpacity=".13" strokeWidth="1.4" />
            </pattern>
            <radialGradient id="hero-glow" cx="90%" cy="0%" r="65%">
              <stop offset="0%" stopColor="#aef0fb" stopOpacity=".5" />
              <stop offset="100%" stopColor="#aef0fb" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-tri)" />
          <rect width="100%" height="100%" fill="url(#hero-glow)" />
        </svg>

        <div className="inner">
          <div>
            <div className="tags">
              <span className="badge">{code ? `${code} • ` : ''}{cls.class_code}</span>
              <span className="badge">{cls.semester_name || cls.semester_code}</span>
            </div>
            <h1>{name}</h1>
            {cls.course_description && <p className="en">{cls.course_description}</p>}
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Ring value={progress.pct} size={84} stroke={8}>
              <span>{progress.pct}%<small>tiến độ</small></span>
            </Ring>
            {focus && (
              <div className="live-card">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                  {sessionPhase(focus) === 'today' && <span className="badge" style={{ height: 22, background: 'rgba(255,255,255,.22)' }}><span className="live" /> Hôm nay</span>}
                  Buổi {focus.session_number}: {focus.title}
                </span>
                <span>{dayName(focus.session_date)} {fmtDate(focus.session_date)} • {hm(focus.start_time)} - {hm(focus.end_time)} • Phòng {focus.room || cls.default_room}</span>
                <span style={{ color: openSession ? '#9af2cf' : '#ffd0cb', fontWeight: 600 }}>
                  {openSession ? `Điểm danh Buổi ${openSession.session_number} đang mở • còn ${fmtClock(secondsLeft(openSession.attendance_expires_at, now))}` : 'Không có phiên điểm danh đang mở'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="meta-strip">
          <span><Icon name="user" size={16} /> {cls.instructor_name}</span>
          <span><Icon name="calendar" size={16} /> {progress.done}/{progress.total} buổi đã diễn ra</span>
          <span><Icon name="pin" size={16} /> {cls.default_room || 'Chưa xếp phòng'}</span>
          <span><Icon name="users" size={16} /> Sĩ số {cls.enrolled_count}/{cls.max_capacity}</span>
        </div>
      </section>

      <TabBar tabs={tabs} value={tab} onChange={setCourseTab} />

      <div key={tab} className="view" style={{ animationDuration: '.4s' }}>
        {error && <ErrorBox error={error} onRetry={loadSessions} />}
        {!error && !sessions && <Loading />}
        {sessions && (
          <>
            {tab === 'sessions' && <SessionsTab ctx={ctx} />}
            {tab === 'attendance' && (isLecturer ? <LecturerAttendance ctx={ctx} setFocusId={setFocusId} /> : <StudentAttendance ctx={ctx} />)}
            {tab === 'timetable' && <TimetableTab schedule={schedule} classId={cls.class_id} />}
            {tab === 'participants' && <ParticipantsTab cls={cls} />}
            {tab === 'analytics' && <AnalyticsTab cls={cls} sessions={sessions} />}
            {tab === 'quiz' && <QuizTab ctx={ctx} />}
            {tab === 'radar' && <RadarTab user={user} />}
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================================ TAB BAR */
function TabBar({ tabs, value, onChange }) {
  const refs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  const measure = () => {
    const el = refs.current[value];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  };
  useLayoutEffect(measure, [value]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  });
  useEffect(() => {
    refs.current[value]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [value]);

  return (
    <div className="tabs-bar">
      <div className="tabs" role="tablist" aria-label="Mục của lớp học">
        {pill.ready && <span className="tab-pill" style={{ left: pill.left, width: pill.width }} />}
        {tabs.map((t) => (
          <button
            key={t.id} ref={(el) => (refs.current[t.id] = el)} role="tab" aria-selected={value === t.id}
            className={`tab ${value === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}
          >
            <Icon name={t.icon} size={17} /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================== SESSIONS */
const MATERIAL_ICON = { slide: ['file', 'var(--bad)', 'var(--bad-soft)'], code: ['code', 'var(--ai, #6d5efc)', 'var(--surface-3)'], video: ['layers', 'var(--info)', 'var(--info-soft)'] };

function SessionsTab({ ctx }) {
  const { app, isLecturer, sessions, mine, focusId, goAttendance } = ctx;
  const [open, setOpen] = useState(focusId);
  const now = useNow(sessions.some((s) => s.is_attendance_open));

  return (
    <div className="session-list stagger">
      {sessions.map((s) => {
        const phase = sessionPhase(s);
        const isOpen = open === s.id;
        const my = mine[s.id]?.my_attendance || null;
        const periods = mine[s.id]?.period_start ? ` • Tiết ${mine[s.id].period_start}-${mine[s.id].period_end}` : '';
        return (
          <article key={s.id} className={`card session ${phase === 'done' ? 'done' : ''} ${phase === 'today' ? 'current' : ''} ${isOpen ? 'open' : ''}`}>
            <button className="session-head" onClick={() => setOpen(isOpen ? null : s.id)} aria-expanded={isOpen}>
              <div className="s-num">{phase === 'done' ? <Icon name="check" size={22} stroke={2.4} /> : s.session_number}</div>
              <div style={{ minWidth: 0 }}>
                <h3>Buổi {s.session_number}: {s.title}</h3>
                <div className="meta">
                  <span><Icon name="calendar" size={14} /> {dayName(s.session_date)}, {fmtDate(s.session_date)}</span>
                  <span><Icon name="clock" size={14} /> {hm(s.start_time)} - {hm(s.end_time)}{periods}</span>
                  <span><Icon name="pin" size={14} /> {s.room || 'Chưa xếp phòng'}</span>
                </div>
              </div>
              {s.is_attendance_open ? (
                <span className="badge badge-brand"><span className="live" /> Đang điểm danh</span>
              ) : phase === 'done' ? (
                !isLecturer && my ? <span className={`badge ${STATUS[my].tone}`}>{STATUS[my].label}</span>
                  : <span className="badge badge-ok">Đã học</span>
              ) : phase === 'today' ? (
                <span className="badge badge-brand"><span className="live" /> Hôm nay</span>
              ) : (
                <span className="badge">Sắp tới</span>
              )}
              <Icon name="chevron-down" size={20} className="chev" />
            </button>

            <div className="session-body">
              <div>
                <div className="session-inner">
                  <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                    <span className="eyebrow">Tài liệu buổi học</span>
                    {s.materials.length === 0 ? (
                      <p className="muted" style={{ fontSize: 13 }}>Chưa có tài liệu cho buổi này.</p>
                    ) : (
                      <ul className="topics">
                        {s.materials.map((m) => (
                          <li key={m.id}><a href={m.fileUrl} target="_blank" rel="noreferrer">{m.title}</a> <span className="muted">({m.materialType})</span></li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="activities">
                    {s.materials.slice(0, 2).map((m) => {
                      const [icon, color, bg] = MATERIAL_ICON[m.materialType] || MATERIAL_ICON.slide;
                      return (
                        <div className="activity" key={m.id}>
                          <div className="a-ico" style={{ background: bg, color }}><Icon name={icon} size={20} /></div>
                          <div className="a-txt"><b>{m.title}</b><span>{m.materialType}</span></div>
                          <a className="btn btn-sm" href={m.fileUrl} target="_blank" rel="noreferrer"><Icon name="link" size={15} /> Mở</a>
                        </div>
                      );
                    })}

                    <div className={`activity ${s.is_attendance_open ? 'hl-ok' : ''}`}>
                      <div className="a-ico tone-ok"><Icon name="key" size={20} /></div>
                      <div className="a-txt">
                        <b>Điểm danh bằng mã PIN</b>
                        <span>
                          {isLecturer
                            ? (s.is_attendance_open ? `Đang mở • còn ${fmtClock(secondsLeft(s.attendance_expires_at, now))}` : 'Mở mã PIN tại lớp hoặc điểm danh thủ công')
                            : my ? `Trạng thái của bạn: ${STATUS[my].label}`
                              : s.is_attendance_open ? `Đang mở • còn ${fmtClock(secondsLeft(s.attendance_expires_at, now))}`
                                : phase === 'done' ? 'Không có bản ghi điểm danh' : 'Giảng viên chưa mở điểm danh'}
                        </span>
                      </div>
                      {isLecturer ? (
                        <button className="btn btn-sm btn-primary" onClick={() => goAttendance(s.id)}>Quản lý điểm danh</button>
                      ) : my ? (
                        <span className={`badge ${STATUS[my].tone}`}><Icon name="check" size={13} stroke={2.6} /> {STATUS[my].label}</span>
                      ) : (
                        <button className="btn btn-sm btn-primary" disabled={!s.is_attendance_open} onClick={() => app.openPin(s)}>Nhập mã PIN</button>
                      )}
                    </div>

                    <div className="activity hl-info">
                      <div className="a-ico tone-info"><Icon name="quiz" size={20} /></div>
                      <div className="a-txt"><b>Quiz Buổi {s.session_number}</b><span>Chấm trên máy chủ, mỗi câu được ghi lại cho mô hình năng lực</span></div>
                      <button className="btn btn-sm btn-primary" onClick={() => app.openQuiz(s)}>{isLecturer ? 'Xem quiz' : 'Làm bài'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ============================================================ ATTENDANCE */
function LecturerAttendance({ ctx, setFocusId }) {
  const { app, sessions, focusId, reload } = ctx;
  const sessionId = focusId || defaultSession(sessions)?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState(1);
  const [saving, setSaving] = useState(null); // userId being saved

  const load = useCallback(async () => {
    if (!sessionId) return;
    try {
      setData(await api.sessionAttendance(sessionId));
      setError('');
    } catch (err) { setError(err.message); }
  }, [sessionId]);
  useEffect(() => { setData(null); load(); }, [load]);

  const open = Boolean(data?.session.is_attendance_open);
  const now = useNow(open);
  const left = open ? secondsLeft(data.session.attendance_expires_at, now) : 0;
  // While the PIN is open, refresh the roster to show check-ins as they arrive.
  usePolling(load, 3000, open);
  useEffect(() => { if (open && left === 0) { load(); reload(); } }, [open, left, load, reload]);

  const openPin = async () => {
    setBusy(true);
    try {
      await api.openAttendance(sessionId, duration);
      app.toast(`Đã mở mã PIN, hiệu lực ${duration} phút`, 'ok');
      await Promise.all([load(), reload()]);
    } catch (err) { app.toast(err.message, 'bad'); } finally { setBusy(false); }
  };
  const closePin = async () => {
    setBusy(true);
    try {
      await api.closeAttendance(sessionId);
      app.toast('Đã đóng điểm danh', 'ok');
      await Promise.all([load(), reload()]);
    } catch (err) { app.toast(err.message, 'bad'); } finally { setBusy(false); }
  };
  const setStatus = async (student, status) => {
    if (student.status === status) return;
    setSaving(student.user_id);
    try {
      await api.setAttendance(sessionId, student.user_id, status);
      await load();
      app.toast(`${student.name}: ${STATUS[status].label}`, 'ok');
    } catch (err) { app.toast(err.message, 'bad'); } finally { setSaving(null); }
  };

  const students = data?.students || [];
  const count = (k) => students.filter((r) => (r.status || null) === k).length;
  const segments = [...Object.entries(STATUS).map(([k, v]) => ({ label: v.label, value: count(k), color: v.color })),
    { label: NONE.label, value: count(null), color: NONE.color }];
  const attended = count('present') + count('late');
  const base = students.length - count('excused');
  const code = data?.session.attendance_code || '';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="card card-pad" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="att-session" style={{ fontWeight: 700 }}>Buổi học</label>
        <select id="att-session" className="input" style={{ maxWidth: 460 }} value={sessionId || ''} onChange={(e) => setFocusId(e.target.value)}>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>Buổi {s.session_number} • {fmtDate(s.session_date)} • {s.title}</option>
          ))}
        </select>
      </div>

      {error && <ErrorBox error={error} onRetry={load} />}
      {!error && !data && <Loading />}
      {data && (
        <div className="att-grid">
          <div style={{ display: 'grid', gap: 20 }}>
            <div className={`pin-card ${open ? '' : 'expired'}`}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>Mã PIN điểm danh • Buổi {data.session.session_number}</span>
              <div className="pin-digits" aria-label={open ? `Mã PIN ${code.split('').join(' ')}` : 'Chưa mở mã PIN'}>
                {(open ? code : '••••').split('').map((d, i) => <div className="pin-digit" key={`${code}-${i}`}>{d}</div>)}
              </div>
              <div className="pin-timer"><Icon name="clock" size={16} /> {open ? <>Hết hạn sau <b>{fmtClock(left)}</b></> : 'Chưa mở hoặc đã hết hạn'}</div>
              {open && <div className="pin-bar"><i style={{ width: `${Math.min(100, (left / 60) * 100)}%` }} /></div>}
              {open ? (
                <button className="btn btn-light btn-block" style={{ marginTop: 22 }} disabled={busy} onClick={closePin}>
                  <Icon name="x" size={17} /> Đóng điểm danh
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
                  <select className="input" aria-label="Thời hạn mã PIN" style={{ width: 120, background: 'rgba(255,255,255,.95)', color: '#123' }} value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                    {PIN_DURATIONS.map((m) => <option key={m} value={m}>{m} phút</option>)}
                  </select>
                  <button className="btn btn-light" style={{ flex: 1 }} disabled={busy} onClick={openPin}>
                    <Icon name="refresh" size={17} /> Mở mã PIN
                  </button>
                </div>
              )}
              <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>Mã gồm 4 chữ số, mặc định hiệu lực 1 phút. Mỗi sinh viên được nhập {PIN_MAX_ATTEMPTS} lần; sai cả {PIN_MAX_ATTEMPTS} lần thì giảng viên điểm danh thủ công.</p>
            </div>

            <div className="card card-pad">
              <div className="card-head"><h3 className="card-title">Tổng hợp Buổi {data.session.session_number}</h3><span className="badge badge-brand">{base > 0 ? Math.round((attended / base) * 100) : 0}% hiện diện</span></div>
              <div className="donut-row">
                <Donut segments={segments} center={<div><div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{students.length}</div><small className="muted">sinh viên</small></div>} />
                <ul className="legend" style={{ flex: 1, minWidth: 150 }}>
                  {segments.map((s) => <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="card card-pad">
            <div className="card-head">
              <div>
                <h3 className="card-title">Sổ điểm danh</h3>
                <p className="card-sub">Bấm vào trạng thái để điểm danh thủ công{open ? ' • tự cập nhật mỗi 3 giây' : ''}</p>
              </div>
            </div>
            {students.length === 0 ? (
              <p className="muted">Lớp chưa có sinh viên. Nhập danh sách lớp từ hệ thống đăng ký môn học.</p>
            ) : (
              <div className="table-wrap">
                <table className="tbl">
                  <thead><tr><th>Sinh viên</th><th>Trạng thái</th><th>Chỉnh sửa</th></tr></thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.user_id}>
                        <td>
                          <div className="person"><Avatar name={s.name} size="sm" /><div><b>{s.name}</b><span>{s.email}</span></div></div>
                        </td>
                        <td>
                          <span className={`badge ${s.status ? STATUS[s.status].tone : ''}`}>{s.status ? STATUS[s.status].label : NONE.label}</span>
                          <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                            {s.method === 'pin' ? `PIN ${s.checkin_time ? new Date(s.checkin_time).toLocaleTimeString('vi-VN') : ''}` : s.method === 'manual' ? 'Thủ công' : ''}
                            {!s.status && s.failed_pin_attempts >= PIN_MAX_ATTEMPTS ? 'Đã khóa: sai PIN 2 lần' : ''}
                            {!s.status && s.failed_pin_attempts > 0 && s.failed_pin_attempts < PIN_MAX_ATTEMPTS ? `Sai PIN ${s.failed_pin_attempts} lần` : ''}
                          </div>
                        </td>
                        <td>
                          <div className="status-seg" role="group" aria-label={`Trạng thái ${s.name}`}>
                            {Object.entries(STATUS).map(([k, v]) => (
                              <button key={k} title={v.label} aria-pressed={s.status === k} disabled={saving === s.user_id} className={s.status === k ? `on-${k}` : ''} onClick={() => setStatus(s, k)}>{v.short}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentAttendance({ ctx }) {
  const { app, sessions, mine } = ctx;
  const open = sessions.find((s) => s.is_attendance_open);
  const now = useNow(Boolean(open));
  const statusOf = (s) => mine[s.id]?.my_attendance || (sessionPhase(s) === 'done' ? 'absent' : null);
  const past = sessions.filter((s) => sessionPhase(s) !== 'upcoming' || mine[s.id]?.my_attendance);
  const count = (k) => past.filter((s) => statusOf(s) === k).length;
  const segments = Object.entries(STATUS).map(([k, v]) => ({ label: v.label, value: count(k), color: v.color }));
  const base = past.length - count('excused');
  const rate = base > 0 ? Math.round(((count('present') + count('late')) / base) * 100) : 0;
  const openMine = open && mine[open.id]?.my_attendance;

  return (
    <div className="att-grid">
      <div style={{ display: 'grid', gap: 20 }}>
        <div className="card card-pad" style={{ textAlign: 'center', display: 'grid', gap: 14, justifyItems: 'center' }}>
          <div className={`stat-ico ${openMine ? 'tone-ok' : 'tone-brand'}`} style={{ width: 64, height: 64, borderRadius: 20 }}>
            <Icon name={openMine ? 'check-circle' : 'key'} size={30} />
          </div>
          {open ? (
            <>
              <div>
                <h3 style={{ fontSize: 18 }}>{openMine ? 'Bạn đã điểm danh' : `Điểm danh Buổi ${open.session_number}`}</h3>
                <p className="muted" style={{ marginTop: 6 }}>
                  {openMine ? `Trạng thái của bạn: ${STATUS[openMine].label}.` : `Còn ${fmtClock(secondsLeft(open.attendance_expires_at, now))}. Nhập mã PIN 4 chữ số giảng viên hiển thị tại lớp.`}
                </p>
              </div>
              {!openMine && <button className="btn btn-primary btn-lg btn-block" onClick={() => app.openPin(open)}><Icon name="key" size={18} /> Nhập mã PIN</button>}
            </>
          ) : (
            <div>
              <h3 style={{ fontSize: 18 }}>Chưa có phiên điểm danh</h3>
              <p className="muted" style={{ marginTop: 6 }}>Khi giảng viên mở mã PIN, nút nhập mã sẽ hiện ở đây trong vài giây.</p>
            </div>
          )}
        </div>

        <div className="card card-pad">
          <div className="card-head"><h3 className="card-title">Chuyên cần của bạn</h3><span className="badge badge-brand">{rate}% hiện diện</span></div>
          <div className="donut-row">
            <Donut segments={segments} center={<div><div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{past.length}</div><small className="muted">buổi</small></div>} />
            <ul className="legend" style={{ flex: 1, minWidth: 150 }}>
              {segments.map((s) => <li key={s.label}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="card-head"><div><h3 className="card-title">Lịch sử điểm danh</h3><p className="card-sub">Buổi đã kết thúc mà không có bản ghi được tính là vắng</p></div></div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Buổi</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {sessions.map((s) => {
                const st = statusOf(s);
                return (
                  <tr key={s.id}>
                    <td><b>Buổi {s.session_number}</b><div className="muted" style={{ fontSize: 12.5 }}>{s.title}</div></td>
                    <td>{fmtDate(s.session_date)}</td>
                    <td>{st ? <span className={`badge ${STATUS[st].tone}`}>{STATUS[st].label}</span> : <span className="muted">Chưa diễn ra</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= TIMETABLE */
const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
// HCMUT periods (docs/data/periods.json): period n starts at 06:00 + (n - 1) hours and lasts 50 minutes.
const PERIODS = Array.from({ length: 12 }, (_, i) => ({ n: i + 1, start: `${String(6 + i).padStart(2, '0')}:00`, end: `${String(6 + i).padStart(2, '0')}:50` }));
const COLORS = ['#008299', '#2f6fed', '#6d5efc', '#c47f00', '#2f855a'];

const mondayOf = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

function TimetableTab({ schedule, classId }) {
  const classIds = [...new Set(schedule.map((s) => s.class_id))];
  const thisWeek = mondayOf(new Date());
  const [week, setWeek] = useState(thisWeek);
  const days = WEEKDAYS.map((_, i) => addDays(week, i));
  const inWeek = schedule.filter((s) => { const d = dayOf(s.session_date); return d >= week && d < addDays(week, 7); });
  const placed = inWeek.filter((s) => s.period_start);
  const unplaced = inWeek.filter((s) => !s.period_start);
  const today = new Date().toDateString();
  const firstDay = schedule.length ? mondayOf(dayOf(schedule[0].session_date)) : thisWeek;
  const weekNo = Math.round((week - firstDay) / (7 * 864e5)) + 1;

  return (
    <div className="card card-pad">
      <div className="card-head" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 className="card-title">Thời khóa biểu • {weekNo >= 1 ? `Tuần ${weekNo} ` : ''}({week.toLocaleDateString('vi-VN')} - {addDays(week, 6).toLocaleDateString('vi-VN')})</h3>
          <p className="card-sub">Tất cả các lớp của bạn • Tiết n bắt đầu lúc 06:00 + (n - 1) giờ, mỗi tiết 50 phút</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" onClick={() => setWeek(addDays(week, -7))} aria-label="Tuần trước"><Icon name="chevron-left" size={15} /></button>
          <button className="btn btn-sm" onClick={() => setWeek(thisWeek)}>Tuần này</button>
          <button className="btn btn-sm" onClick={() => setWeek(addDays(week, 7))} aria-label="Tuần sau"><Icon name="chevron-right" size={15} /></button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div className="tt2" role="table" aria-label="Thời khóa biểu theo tiết">
          <div className="th" style={{ gridRow: 1, gridColumn: 1 }}>Tiết</div>
          {days.map((d, i) => (
            <div key={i} className={`th ${d.toDateString() === today ? 'today' : ''}`} style={{ gridRow: 1, gridColumn: i + 2 }}>
              {WEEKDAYS[i]}<small>{d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</small>
            </div>
          ))}
          {PERIODS.map((p) => (
            <div key={p.n} className="period" style={{ gridRow: p.n + 1, gridColumn: 1 }}>Tiết {p.n}<small>{p.start} - {p.end}</small></div>
          ))}
          {PERIODS.map((p) => days.map((d, i) => (
            <div key={`${p.n}-${i}`} className={`cell ${d.toDateString() === today ? 'today-col' : ''}`} style={{ gridRow: p.n + 1, gridColumn: i + 2 }} />
          )))}
          {placed.map((s) => {
            const col = ((dayOf(s.session_date).getDay() + 6) % 7) + 2;
            const color = COLORS[classIds.indexOf(s.class_id) % COLORS.length];
            return (
              <div key={s.session_id} className={`slot ${s.class_id === classId ? '' : 'other'}`} style={{ '--c': color, gridColumn: col, gridRow: `${s.period_start + 1} / ${s.period_end + 2}` }}>
                <b>{splitCourseTitle(s.course_title).code || s.course_title} • {s.class_code}</b>
                <span>Buổi {s.session_number}: {s.session_title}</span>
                <span><Icon name="clock" size={13} /> Tiết {s.period_start}-{s.period_end} ({hm(s.start_time)} - {hm(s.end_time)})</span>
                <span><Icon name="pin" size={13} /> Phòng {s.room || s.default_room}</span>
                <span><Icon name="user" size={13} /> {s.instructor_name}</span>
              </div>
            );
          })}
        </div>
      </div>
      {inWeek.length === 0 && <p className="muted" style={{ marginTop: 12 }}>Tuần này không có buổi học nào.</p>}
      {unplaced.length > 0 && (
        <div className="callout info" style={{ marginTop: 12 }}>
          <Icon name="info" size={18} />
          <span>Buổi không khớp khung tiết: {unplaced.map((s) => `Buổi ${s.session_number} (${dayName(s.session_date)} ${hm(s.start_time)} - ${hm(s.end_time)})`).join(', ')}</span>
        </div>
      )}
    </div>
  );
}

/* ============================================================ PARTICIPANTS */
function useSummary(classId) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { setSummary((await api.attendanceSummary(classId)).summary); setError(''); } catch (err) { setError(err.message); }
  }, [classId]);
  useEffect(() => { load(); }, [load]);
  return { summary, error, load };
}

function ParticipantsTab({ cls }) {
  const { summary, error, load } = useSummary(cls.class_id);
  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!summary) return <Loading />;
  return (
    <div className="card card-pad">
      <div className="card-head">
        <div>
          <h3 className="card-title">Thành viên lớp {summary.class_code}</h3>
          <p className="card-sub">{summary.enrolled_count}/{summary.max_capacity} sinh viên • danh sách lấy từ hệ thống đăng ký môn học</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Họ và tên</th><th>Vai trò</th><th>Buổi có mặt</th><th>Chuyên cần</th></tr></thead>
          <tbody>
            <tr>
              <td><div className="person"><Avatar name={cls.instructor_name} size="sm" /><div><b>{cls.instructor_name}</b></div></div></td>
              <td><span className="badge badge-ai">Giảng viên</span></td>
              <td className="muted">—</td><td className="muted">—</td>
            </tr>
            {summary.students.map((s) => {
              const rate = s.attendanceRatePercent === null ? null : Number(s.attendanceRatePercent);
              const tone = rate === null ? '' : rate >= 90 ? 'ok' : rate >= 80 ? '' : 'warn';
              return (
                <tr key={s.userId}>
                  <td><div className="person"><Avatar name={s.name} size="sm" /><div><b>{s.name}</b><span>{s.email}</span></div></div></td>
                  <td><span className="badge">Sinh viên</span></td>
                  <td>{s.attendedSessions}/{s.completedSessions - s.excusedSessions}{s.excusedSessions ? <span className="muted"> (+{s.excusedSessions} có phép)</span> : null}</td>
                  <td>{rate === null ? <span className="muted">Chưa có buổi</span> : <div className="rate"><Progress value={rate} tone={tone} /><b>{rate}%</b></div>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================== ANALYTICS */
function AnalyticsTab({ cls, sessions }) {
  const { summary, error, load } = useSummary(cls.class_id);
  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!summary) return <Loading />;
  const rate = summary.attendance_rate_percent === null ? null : Number(summary.attendance_rate_percent);
  const cards = [
    { icon: 'users', tone: 'tone-brand', label: `Sĩ số lớp ${summary.class_code}`, value: summary.enrolled_count, suffix: `/${summary.max_capacity}`, note: `${Math.round((summary.enrolled_count / summary.max_capacity) * 100)}% sức chứa` },
    { icon: 'check-circle', tone: 'tone-ok', label: 'Chuyên cần trung bình', value: rate ?? 0, decimals: 1, suffix: rate === null ? '' : '%', note: 'Có mặt + đi trễ, không tính buổi có phép' },
    { icon: 'target', tone: 'tone-info', label: 'Buổi đã diễn ra', value: summary.completed_sessions, suffix: `/${sessions.length}`, note: `${Math.round((summary.completed_sessions / Math.max(1, sessions.length)) * 100)}% chương trình` },
    { icon: 'sparkles', tone: 'tone-ai', label: 'Lượt có mặt đã ghi', value: summary.attended_checkins, note: 'Qua PIN và điểm danh thủ công' },
  ];
  const finished = new Set(sessions.filter((s) => sessionPhase(s) === 'done').map((s) => s.id));
  const bars = summary.sessions.map((s) => ({
    n: s.sessionNumber,
    v: finished.has(s.sessionId) || s.presentCount + s.lateCount > 0 ? Number(s.attendanceRatePercent ?? 0) : null,
    s,
  }));

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="stat-grid stagger" style={{ margin: 0 }}>
        {cards.map((c) => (
          <div className="card stat" key={c.label}>
            <div className="stat-top"><div className={`stat-ico ${c.tone}`}><Icon name={c.icon} size={20} /></div></div>
            <div className="stat-val"><CountUp value={c.value} decimals={c.decimals ?? 0} /><small>{c.suffix}</small></div>
            <div><div className="stat-lab" style={{ color: 'var(--text-2)', fontWeight: 600 }}>{c.label}</div><div className="stat-lab">{c.note}</div></div>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <div className="card-head">
          <div><h3 className="card-title">Tỷ lệ chuyên cần qua {bars.length} buổi học</h3><p className="card-sub">Rê chuột lên cột để xem số có mặt, đi trễ, vắng, có phép</p></div>
          <button className="btn btn-sm" onClick={load}><Icon name="refresh" size={14} /> Làm mới</button>
        </div>
        <div className="bars" role="img" aria-label="Biểu đồ cột tỷ lệ chuyên cần theo buổi">
          {bars.map((b, i) => (
            <div className="bar-col" key={b.n}>
              {b.v !== null ? (
                <div className={`bar ${b.v < 80 ? 'warn' : ''}`} style={{ height: `${Math.max(b.v, 2)}%`, animationDelay: `${i * 0.05}s` }}>
                  <span className="bar-tip">Buổi {b.n}: {b.v}% • CM {b.s.presentCount}, ĐT {b.s.lateCount}, V {b.s.absentCount}, CP {b.s.excusedCount}</span>
                </div>
              ) : (
                <div className="bar future" title={`Buổi ${b.n}: chưa diễn ra`} />
              )}
            </div>
          ))}
        </div>
        <div className="bar-labels">{bars.map((b) => <span key={b.n}>B{b.n}</span>)}</div>
      </div>
    </div>
  );
}

/* ================================================================== QUIZ */
function QuizTab({ ctx }) {
  const { app, sessions, isLecturer } = ctx;
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const all = await Promise.all(sessions.map((s) => api.quizzes(s.id).then((r) => ({ s, quizzes: r.quizzes }))));
      setRows(all);
      setError('');
    } catch (err) { setError(err.message); }
  }, [sessions]);
  useEffect(() => { load(); }, [load]);
  if (error) return <ErrorBox error={error} onRetry={load} />;
  if (!rows) return <Loading text="Đang tải danh sách quiz…" />;

  const total = rows.reduce((a, r) => a + r.quizzes.reduce((b, q) => b + q.questions.length, 0), 0);
  const skills = new Set(rows.flatMap((r) => r.quizzes.flatMap((q) => q.questions.map((x) => x.skillCode))));
  return (
    <div className="card card-pad">
      <div style={{ marginBottom: 18 }}>
        <h3>Quiz theo buổi học</h3>
        <p className="card-sub">{total} câu trắc nghiệm • {skills.size} kỹ năng • đáp án chỉ nằm trên máy chủ</p>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map(({ s, quizzes }) => {
          const n = quizzes.reduce((a, q) => a + q.questions.length, 0);
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1px solid var(--line, var(--border))', borderRadius: 14 }}>
              <span className="badge badge-brand">Buổi {s.session_number}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 14.5 }}>{s.title}</b>
                <div className="muted" style={{ fontSize: 12.5 }}>{n ? `${n} câu • ${[...new Set(quizzes.flatMap((q) => q.questions.map((x) => x.skillCode)))].join(', ')}` : 'Chưa có quiz'}</div>
              </div>
              <button className="btn" disabled={!n} onClick={() => app.openQuiz(s)}>{isLecturer ? 'Xem' : 'Làm bài'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== RADAR */
function RadarTab({ user }) {
  const data = SKILL_MASTERY_SAMPLE;
  const sorted = [...data].sort((a, b) => b.mastery - a.mastery);
  const strong = sorted.slice(0, 2);
  const weak = sorted.filter((s) => s.mastery < 70).reverse();
  const avg = Math.round(data.reduce((a, s) => a + s.mastery, 0) / data.length);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="callout info"><Icon name="info" size={18} /><span>Dữ liệu minh họa. Bản đồ năng lực sẽ lấy từ mô hình Knowledge Tracing (BKT, DKT) dựa trên bảng quiz_interactions ở giai đoạn tích hợp AI.</span></div>
      <div className="ai-grid">
        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h3 className="card-title">Bản đồ năng lực • {user.role === 'student' ? user.name : 'Trung bình cả lớp'}</h3>
              <p className="card-sub">Ước lượng từ kết quả từng câu hỏi bằng Knowledge Tracing</p>
            </div>
            <span className="badge badge-ai"><Icon name="sparkles" size={13} /> Mức thành thạo TB {avg}%</span>
          </div>
          <div className="radar-box"><RadarChart data={data} /></div>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div className="tutor">
            <div className="tutor-head">
              <i><Icon name="sparkles" size={20} /></i>
              <div><h3 style={{ fontSize: 16 }}>Nhận xét của AI Tutor</h3><p className="muted" style={{ fontSize: 12.5 }}>Minh họa cách hiển thị khuyến nghị</p></div>
            </div>
            <div className="insight">
              <div className="ic tone-ok"><Icon name="trend" size={16} /></div>
              <p><b>Điểm mạnh:</b> {strong.map((s) => `${s.skill} (${s.mastery}%)`).join(' và ')}.</p>
            </div>
            <div className="insight">
              <div className="ic tone-warn"><Icon name="target" size={16} /></div>
              <p><b>Cần ôn tập:</b> {weak.length ? weak.map((s) => `${s.skill} (${s.mastery}%)`).join(', ') : 'Chưa phát hiện lỗ hổng đáng kể'}.</p>
            </div>
          </div>

          <div className="card card-pad">
            <div className="card-head" style={{ marginBottom: 4 }}><h3 className="card-title">Chi tiết kỹ năng</h3></div>
            {data.map((s) => (
              <div className="skill-row" key={s.code}>
                <div className="top">
                  <div><b>{s.skill}</b><small>{s.code}</small></div>
                  <span className={`badge ${levelBadge(s.mastery)}`}>{s.level} • {s.mastery}%</span>
                </div>
                <Progress value={s.mastery} tone={levelTone(s.mastery)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
