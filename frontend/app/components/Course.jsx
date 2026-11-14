'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { Avatar, CountUp, Donut, Progress, RadarChart, Ring } from './ui';
import { COURSE_INFO, SESSIONS_LIST, SKILL_MASTERY_SAMPLE } from '../data/dsaCourseData';
import { CO2003_QUESTION_BANK } from '../data/co2003QuestionBank';

const TABS = [
  { id: 'sessions', label: 'Buổi học', icon: 'book' },
  { id: 'attendance', label: 'Điểm danh', icon: 'check-circle' },
  { id: 'timetable', label: 'Thời khóa biểu', icon: 'calendar' },
  { id: 'participants', label: 'Thành viên', icon: 'users' },
  { id: 'analytics', label: 'Thống kê', icon: 'chart' },
  { id: 'quiz', label: 'Bài kiểm tra', icon: 'zap' },
  { id: 'radar', label: 'Bản đồ năng lực AI', icon: 'brain' },
];

const STATUS = {
  present: { label: 'Có mặt', short: 'CM', tone: 'badge-ok', color: 'var(--ok)' },
  late: { label: 'Đi trễ', short: 'ĐT', tone: 'badge-warn', color: 'var(--warn)' },
  absent: { label: 'Vắng', short: 'V', tone: 'badge-bad', color: 'var(--bad)' },
  excused: { label: 'Có phép', short: 'CP', tone: 'badge-info', color: 'var(--info)' },
};

const ME_ID = '2110001';
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const levelTone = (m) => (m >= 80 ? 'ok' : m >= 65 ? '' : 'warn');
const levelBadge = (m) => (m >= 80 ? 'badge-ok' : m >= 65 ? 'badge-brand' : 'badge-warn');

/* ================================================================== SHELL */
export default function Course({ app }) {
  const { courseTab, setCourseTab, roster, pin } = app;
  const doneSessions = SESSIONS_LIST.filter((s) => s.status === 'completed').length + 1;
  const pct = Math.round((doneSessions / 15) * 100);

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
              <span className="badge">{COURSE_INFO.code} • {COURSE_INFO.classCode}</span>
              <span className="badge">{COURSE_INFO.credits} tín chỉ</span>
              <span className="badge">{COURSE_INFO.semester}</span>
            </div>
            <h1>{COURSE_INFO.title}</h1>
            <p className="en">{COURSE_INFO.titleEn}</p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <Ring value={pct} size={84} stroke={8}>
              <span>{pct}%<small>tiến độ</small></span>
            </Ring>
            <div className="live-card">
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <span className="badge" style={{ height: 22, background: 'rgba(255,255,255,.22)' }}><span className="live" /> Hôm nay</span>
                Buổi 3 đang diễn ra
              </span>
              <span>Phòng B4-302 • 07:30 - 11:15</span>
              <span style={{ color: pin.active && pin.seconds > 0 ? '#9af2cf' : '#ffd0cb', fontWeight: 600 }}>
                {pin.active && pin.seconds > 0 ? `Phiên PIN đang mở • còn ${fmt(pin.seconds)}` : 'Phiên PIN đã đóng'}
              </span>
            </div>
          </div>
        </div>

        <div className="meta-strip">
          <span><Icon name="user" size={16} /> {COURSE_INFO.instructor}</span>
          <span><Icon name="clock" size={16} /> {COURSE_INFO.schedule}</span>
          <span><Icon name="pin" size={16} /> {COURSE_INFO.defaultRoom}</span>
          <span><Icon name="users" size={16} /> Sĩ số {roster.length}/{COURSE_INFO.maxCapacity}</span>
        </div>
      </section>

      <TabBar tabs={TABS} value={courseTab} onChange={setCourseTab} />

      <div key={courseTab} className="view" style={{ animationDuration: '.4s' }}>
        {courseTab === 'sessions' && <SessionsTab app={app} />}
        {courseTab === 'attendance' && <AttendanceTab app={app} />}
        {courseTab === 'timetable' && <TimetableTab />}
        {courseTab === 'participants' && <ParticipantsTab app={app} />}
        {courseTab === 'analytics' && <AnalyticsTab app={app} />}
        {courseTab === 'quiz' && <QuizTab app={app} />}
        {courseTab === 'radar' && <RadarTab app={app} />}
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
function SessionsTab({ app }) {
  const { user, toast, setPinOpen, setQuizOpen, pin, roster, setCourseTab } = app;
  const [open, setOpen] = useState(3);
  const me = roster.find((s) => s.studentId === ME_ID);
  const isInstructor = user.role === 'instructor';

  return (
    <div className="session-list stagger">
      {SESSIONS_LIST.map((s) => {
        const done = s.status === 'completed';
        const current = s.status === 'active';
        const isOpen = open === s.sessionNumber;
        return (
          <article key={s.sessionNumber} className={`card session ${done ? 'done' : ''} ${current ? 'current' : ''} ${isOpen ? 'open' : ''}`}>
            <button className="session-head" onClick={() => setOpen(isOpen ? null : s.sessionNumber)} aria-expanded={isOpen}>
              <div className="s-num">{done ? <Icon name="check" size={22} stroke={2.4} /> : s.sessionNumber}</div>
              <div style={{ minWidth: 0 }}>
                <h3>{s.title.replace(/^Buổi \d+:\s*/, '')}</h3>
                <div className="meta">
                  <span><Icon name="calendar" size={14} /> {s.dayOfWeek}, {s.date.split('-').reverse().join('/')}</span>
                  <span><Icon name="clock" size={14} /> {s.time}</span>
                  <span><Icon name="pin" size={14} /> {s.room}</span>
                </div>
              </div>
              {done ? (
                <span className="badge badge-ok">Đã học • {s.attendanceRate}% chuyên cần</span>
              ) : current ? (
                <span className="badge badge-brand"><span className="live" /> Đang học hôm nay</span>
              ) : (
                <span className="badge">Sắp tới</span>
              )}
              <Icon name="chevron-down" size={20} className="chev" />
            </button>

            <div className="session-body">
              <div>
                <div className="session-inner">
                  <div style={{ display: 'grid', gap: 10 }}>
                    <span className="eyebrow">Nội dung buổi học</span>
                    <ul className="topics">{s.topics.map((t) => <li key={t}>{t}</li>)}</ul>
                    <div className="skill-chips">
                      {s.skills.map((k) => <span key={k} className="skill-chip">{k}</span>)}
                    </div>
                  </div>

                  <div className="activities">
                    <div className="activity">
                      <div className="a-ico tone-bad" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}><Icon name="file" size={20} /></div>
                      <div className="a-txt"><b>Slide bài giảng Buổi {s.sessionNumber}</b><span>PDF • tài liệu bắt buộc</span></div>
                      <button className="btn btn-sm" onClick={() => toast(`Đang tải slide Buổi ${s.sessionNumber}…`, 'ok')}><Icon name="download" size={15} /> Tải slide</button>
                    </div>
                    <div className="activity">
                      <div className="a-ico tone-ai"><Icon name="code" size={20} /></div>
                      <div className="a-txt"><b>Mã nguồn thực hành và bài tập mẫu</b><span>C++ / Python • GitHub</span></div>
                      <button className="btn btn-sm" onClick={() => toast(`Mở kho mã nguồn Buổi ${s.sessionNumber}`, 'info')}><Icon name="link" size={15} /> Xem code</button>
                    </div>

                    {current && (
                      <>
                        <div className="activity hl-ok">
                          <div className="a-ico tone-ok"><Icon name="key" size={20} /></div>
                          <div className="a-txt">
                            <b>Điểm danh bằng mã PIN</b>
                            <span>
                              {isInstructor
                                ? `${roster.filter((r) => r.session3Status === 'present').length}/${roster.length} sinh viên đã có mặt`
                                : me.session3Status === 'present' ? 'Bạn đã điểm danh thành công' : 'Nhập mã PIN do giảng viên cung cấp'}
                            </span>
                          </div>
                          {isInstructor ? (
                            <button className="btn btn-sm btn-primary" onClick={() => setCourseTab('attendance')}>Quản lý điểm danh</button>
                          ) : me.session3Status === 'present' ? (
                            <span className="badge badge-ok"><Icon name="check" size={13} stroke={2.6} /> Có mặt</span>
                          ) : (
                            <button className="btn btn-sm btn-primary" disabled={!pin.active || pin.seconds <= 0} onClick={() => setPinOpen(true)}>Nhập mã PIN</button>
                          )}
                        </div>
                        <div className="activity hl-info">
                          <div className="a-ico tone-info"><Icon name="quiz" size={20} /></div>
                          <div className="a-txt"><b>Quiz tương tác Buổi 3</b><span>3 câu • hạn 23:59 hôm nay</span></div>
                          <button className="btn btn-sm btn-primary" onClick={() => setQuizOpen(true)}>Làm bài</button>
                        </div>
                      </>
                    )}
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
function AttendanceTab({ app }) {
  const { user, roster, pin, generatePin, setStatus, setPinOpen } = app;
  const isInstructor = user.role === 'instructor';
  const me = roster.find((s) => s.studentId === ME_ID);
  const count = (k) => roster.filter((r) => r.session3Status === k).length;
  const segments = Object.entries(STATUS).map(([k, v]) => ({ label: v.label, value: count(k), color: v.color }));
  const expired = !pin.active || pin.seconds <= 0;
  const presentRate = Math.round(((count('present') + count('late')) / roster.length) * 100);

  return (
    <div className="att-grid">
      <div style={{ display: 'grid', gap: 20 }}>
        {isInstructor ? (
          <div className={`pin-card ${expired ? 'expired' : ''}`}>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,.75)' }}>Mã PIN điểm danh • Buổi 3</span>
            <div className="pin-digits" aria-label={`Mã PIN ${pin.code.split('').join(' ')}`}>
              {pin.code.split('').map((d, i) => <div className="pin-digit" key={`${pin.code}-${i}`}>{expired ? '•' : d}</div>)}
            </div>
            <div className="pin-timer"><Icon name="clock" size={16} /> {expired ? 'Phiên đã hết hạn' : <>Hết hạn sau <b>{fmt(pin.seconds)}</b></>}</div>
            <div className="pin-bar"><i style={{ width: `${(pin.seconds / 300) * 100}%` }} /></div>
            <button className="btn btn-light btn-block" style={{ marginTop: 22 }} onClick={generatePin}>
              <Icon name="refresh" size={17} /> {expired ? 'Mở phiên mới' : 'Tạo mã PIN mới'}
            </button>
            <p style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>Mã gồm 4 chữ số, hiệu lực 5 phút. Tối đa 5 lần nhập sai.</p>
          </div>
        ) : (
          <div className="card card-pad" style={{ textAlign: 'center', display: 'grid', gap: 14, justifyItems: 'center' }}>
            <div className={`stat-ico ${me.session3Status === 'present' ? 'tone-ok' : 'tone-brand'}`} style={{ width: 64, height: 64, borderRadius: 20 }}>
              <Icon name={me.session3Status === 'present' ? 'check-circle' : 'key'} size={30} />
            </div>
            <div>
              <h3 style={{ fontSize: 18 }}>{me.session3Status === 'present' ? 'Bạn đã điểm danh' : 'Điểm danh Buổi 3'}</h3>
              <p className="muted" style={{ marginTop: 6 }}>
                {me.session3Status === 'present' ? 'Trạng thái của bạn: Có mặt.' : expired ? 'Phiên điểm danh đã đóng. Liên hệ giảng viên nếu cần.' : 'Nhập mã PIN 4 chữ số do giảng viên hiển thị tại lớp.'}
              </p>
            </div>
            {me.session3Status !== 'present' && (
              <button className="btn btn-primary btn-lg btn-block" disabled={expired} onClick={() => setPinOpen(true)}><Icon name="key" size={18} /> Nhập mã PIN</button>
            )}
          </div>
        )}

        <div className="card card-pad">
          <div className="card-head"><h3 className="card-title">Tổng hợp Buổi 3</h3><span className="badge badge-brand">{presentRate}% hiện diện</span></div>
          <div className="donut-row">
            <Donut segments={segments} center={<div><div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{roster.length}</div><small className="muted">sinh viên</small></div>} />
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
            <p className="card-sub">{isInstructor ? 'Nhấn vào trạng thái để chỉnh sửa thủ công' : 'Lịch sử điểm danh của bạn'}</p>
          </div>
        </div>

        {isInstructor ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Sinh viên</th><th>MSSV</th><th>Trạng thái</th><th>Chỉnh sửa</th></tr></thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id}>
                    <td><div className="person"><Avatar name={s.fullName} size="sm" /><div><b>{s.fullName}</b></div></div></td>
                    <td className="mono muted">{s.studentId}</td>
                    <td><span className={`badge ${STATUS[s.session3Status].tone}`}>{STATUS[s.session3Status].label}</span></td>
                    <td>
                      <div className="status-seg" role="group" aria-label={`Trạng thái ${s.fullName}`}>
                        {Object.entries(STATUS).map(([k, v]) => (
                          <button key={k} title={v.label} aria-pressed={s.session3Status === k} className={s.session3Status === k ? `on-${k}` : ''} onClick={() => setStatus(s.studentId, k)}>{v.short}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Buổi</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {SESSIONS_LIST.slice(0, 3).map((s) => {
                  const st = s.sessionNumber === 3 ? me.session3Status : 'present';
                  return (
                    <tr key={s.sessionNumber}>
                      <td><b>Buổi {s.sessionNumber}</b><div className="muted" style={{ fontSize: 12.5 }}>{s.title.replace(/^Buổi \d+:\s*/, '')}</div></td>
                      <td>{s.date.split('-').reverse().join('/')}</td>
                      <td><span className={`badge ${STATUS[st].tone}`}>{STATUS[st].label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================= TIMETABLE */
const DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const PERIODS = [
  { id: 'a', label: 'Tiết 1 - 4', time: '07:30 - 11:15' },
  { id: 'b', label: 'Tiết 5 - 6', time: '12:30 - 14:15' },
  { id: 'c', label: 'Tiết 7 - 10', time: '14:30 - 18:00' },
];
const SLOTS = {
  'a-2': { code: 'CO2003', name: 'Cấu trúc Dữ liệu & Giải thuật', room: 'B4-302', teacher: 'TS. Nguyễn Văn A', color: '#008299', extra: 'CC01 • 4 tín chỉ' },
  'a-4': { code: 'CO3061', name: 'Nhập môn Trí tuệ Nhân tạo', room: 'B6-102', teacher: 'TS. Lê Văn D', color: '#2f6fed' },
  'c-0': { code: 'CO3029', name: 'Khai phá Dữ liệu', room: 'B4-201', teacher: 'TS. Trần Văn C', color: '#6d5efc' },
};

function TimetableTab() {
  const todayIdx = 2;
  return (
    <div className="card card-pad">
      <div className="card-head">
        <div>
          <h3 className="card-title">Thời khóa biểu HK261 • Tuần 1 - 15</h3>
          <p className="card-sub">Cơ sở 1 • 268 Lý Thường Kiệt, P.14, Q.10, TP.HCM</p>
        </div>
        <span className="badge badge-brand"><Icon name="clock" size={13} /> Tiết 1: 07:30 • Tiết 2: 08:25 • Tiết 3: 09:30 • Tiết 4: 10:25</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div className="tt" role="table" aria-label="Thời khóa biểu">
          <div className="th" role="columnheader">Tiết học</div>
          {DAYS.map((d, i) => <div key={d} className={`th ${i === todayIdx ? 'today' : ''}`} role="columnheader">{d}{i === todayIdx ? ' • Hôm nay' : ''}</div>)}
          {PERIODS.map((p) => (
            <TimetableRow key={p.id} p={p} todayIdx={todayIdx} />
          ))}
        </div>
      </div>
    </div>
  );
}
function TimetableRow({ p, todayIdx }) {
  return (
    <>
      <div className="period" role="rowheader">{p.label}<small>{p.time}</small></div>
      {DAYS.map((d, i) => {
        const slot = SLOTS[`${p.id}-${i}`];
        return (
          <div key={d} className={`${slot ? '' : 'empty-cell'} ${i === todayIdx ? 'today-col' : ''}`} role="cell">
            {slot && (
              <div className="slot" style={{ '--c': slot.color }}>
                <b>{slot.code} - {slot.name}</b>
                {slot.extra && <span style={{ fontSize: 11.5 }}>{slot.extra}</span>}
                <span><Icon name="pin" size={13} /> Phòng {slot.room}</span>
                <span><Icon name="user" size={13} /> {slot.teacher}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ============================================================ PARTICIPANTS */
function ParticipantsTab({ app }) {
  const { roster, user } = app;
  return (
    <div className="card card-pad">
      <div className="card-head">
        <div>
          <h3 className="card-title">Thành viên lớp CC01</h3>
          <p className="card-sub">{roster.length}/{COURSE_INFO.maxCapacity} sinh viên đã đăng ký • 1 giảng viên</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Họ và tên</th><th>MSSV</th><th>Vai trò</th><th>Chuyên cần</th><th>Điểm quiz TB</th></tr></thead>
          <tbody>
            <tr>
              <td><div className="person"><Avatar name={COURSE_INFO.instructor} size="sm" /><div><b>{COURSE_INFO.instructor}</b><span>{COURSE_INFO.instructorEmail}</span></div></div></td>
              <td className="muted">—</td>
              <td><span className="badge badge-ai">Giảng viên</span></td>
              <td className="muted">—</td>
              <td className="muted">—</td>
            </tr>
            {roster.map((s) => {
              const tone = s.overallAttendanceRate >= 90 ? 'ok' : s.overallAttendanceRate >= 80 ? '' : 'warn';
              return (
                <tr key={s.id} className={user.role === 'student' && s.studentId === ME_ID ? 'me' : ''}>
                  <td><div className="person"><Avatar name={s.fullName} size="sm" /><div><b>{s.fullName}{user.role === 'student' && s.studentId === ME_ID ? ' (Bạn)' : ''}</b><span>{s.email}</span></div></div></td>
                  <td className="mono muted">{s.studentId}</td>
                  <td><span className="badge">Sinh viên</span></td>
                  <td><div className="rate"><Progress value={s.overallAttendanceRate} tone={tone} /><b>{s.overallAttendanceRate}%</b></div></td>
                  <td><b>{s.averageQuizScore.toFixed(1)}</b><span className="muted">/10</span></td>
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
function AnalyticsTab({ app }) {
  const { roster } = app;
  const avgAtt = roster.reduce((a, s) => a + s.overallAttendanceRate, 0) / roster.length;
  const avgQuiz = roster.reduce((a, s) => a + s.averageQuizScore, 0) / roster.length;
  const presentNow = Math.round((roster.filter((r) => r.session3Status === 'present' || r.session3Status === 'late').length / roster.length) * 100);

  const cards = [
    { icon: 'users', tone: 'tone-brand', label: 'Sĩ số đăng ký lớp CC01', value: roster.length, suffix: `/${COURSE_INFO.maxCapacity}`, note: `${Math.round((roster.length / COURSE_INFO.maxCapacity) * 100)}% sức chứa` },
    { icon: 'check-circle', tone: 'tone-ok', label: 'Chuyên cần trung bình', value: avgAtt, decimals: 1, suffix: '%', note: 'Tính trên toàn bộ buổi đã học' },
    { icon: 'sparkles', tone: 'tone-ai', label: 'Điểm quiz trung bình', value: avgQuiz, decimals: 1, suffix: '/10', note: 'Các đợt kiểm tra tương tác' },
    { icon: 'target', tone: 'tone-info', label: 'Tiến độ học phần', value: 3, suffix: '/15 buổi', note: '20% chương trình học kỳ' },
  ];

  const bars = SESSIONS_LIST.map((s) => {
    if (s.sessionNumber === 3) return { n: 3, v: presentNow, live: true };
    if (s.status === 'completed') return { n: s.sessionNumber, v: s.attendanceRate };
    return { n: s.sessionNumber, v: null };
  });

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
          <div><h3 className="card-title">Tỷ lệ chuyên cần qua 15 buổi học</h3><p className="card-sub">Buổi 3 cập nhật theo thời gian thực từ sổ điểm danh</p></div>
          <span className="badge"><i style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--brand-500)' }} /> Chuyên cần</span>
        </div>
        <div className="bars" role="img" aria-label="Biểu đồ cột tỷ lệ chuyên cần theo buổi">
          {bars.map((b, i) => (
            <div className="bar-col" key={b.n}>
              {b.v !== null ? (
                <>
                  <div className={`bar ${b.v < 90 ? 'warn' : ''}`} style={{ height: `${b.v}%`, animationDelay: `${i * 0.05}s` }}>
                    <span className="bar-tip">Buổi {b.n}: {b.v}%{b.live ? ' (trực tiếp)' : ''}</span>
                  </div>
                </>
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

/* ================================================================== RADAR */
function RadarTab({ app }) {
  const { user, setQuizOpen } = app;
  const data = SKILL_MASTERY_SAMPLE;
  const sorted = [...data].sort((a, b) => b.mastery - a.mastery);
  const strong = sorted.slice(0, 2);
  const weak = sorted.filter((s) => s.mastery < 70).reverse();
  const avg = Math.round(data.reduce((a, s) => a + s.mastery, 0) / data.length);

  return (
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
            <div><h3 style={{ fontSize: 16 }}>Nhận xét của AI Tutor</h3><p className="muted" style={{ fontSize: 12.5 }}>Cập nhật sau mỗi lượt làm bài</p></div>
          </div>
          <div className="insight">
            <div className="ic tone-ok"><Icon name="trend" size={16} /></div>
            <p><b>Điểm mạnh:</b> {strong.map((s) => `${s.skill} (${s.mastery}%)`).join(' và ')}.</p>
          </div>
          <div className="insight">
            <div className="ic tone-warn"><Icon name="target" size={16} /></div>
            <p><b>Cần ôn tập:</b> {weak.length ? weak.map((s) => `${s.skill} (${s.mastery}%)`).join(', ') : 'Chưa phát hiện lỗ hổng đáng kể.'}. Nên làm lại bài rèn luyện trước Buổi 7.</p>
          </div>
          <button className="btn btn-ai btn-block" style={{ marginTop: 14 }} onClick={() => app.openQuiz()}>
            <Icon name="zap" size={17} /> Làm bài rèn luyện tăng cường
          </button>
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
  );
}


/* ================================================================== QUIZ BANK */
function QuizTab({ app }) {
  const bank = CO2003_QUESTION_BANK;
  const skills = new Set(bank.map((q) => q.skillCode)).size;
  const groups = Array.from(new Set(bank.map((q) => q.sessionNumber))).sort((a, b) => a - b).map((n) => ({
    n,
    questions: bank.filter((q) => q.sessionNumber === n),
    title: (SESSIONS_LIST.find((s) => (s.number ?? s.sessionNumber ?? s.id) === n) || {}).title?.replace(/^Buổi \d+:\s*/, '') || `Buổi ${n}`,
  }));
  return (
    <div className="card card-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h3>Ngân hàng câu hỏi {COURSE_INFO.code}</h3>
          <p className="card-sub">{bank.length} câu trắc nghiệm • {skills} kỹ năng • mỗi câu có đáp án và giải thích</p>
        </div>
        <button className="btn btn-primary" onClick={() => app.openQuiz({ title: `Bài kiểm tra tổng hợp • ${bank.length} câu`, questions: bank })}>
          <Icon name="zap" size={17} /> Làm toàn bộ {bank.length} câu
        </button>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {groups.map((g) => (
          <div key={g.n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 14 }}>
            <span className="badge badge-brand">Buổi {g.n}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 14.5 }}>{g.title}</b>
              <div className="muted" style={{ fontSize: 12.5 }}>{g.questions.length} câu</div>
            </div>
            <button className="btn" onClick={() => app.openQuiz({ title: `Quiz Buổi ${g.n}`, questions: g.questions })}>Làm bài</button>
          </div>
        ))}
      </div>
    </div>
  );
}
