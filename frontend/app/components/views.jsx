'use client';

import Icon from './Icon';
import { Cover, CountUp, Progress } from './ui';
import { dayName, fmtDate, hm, sessionPhase, sessionWindow, splitCourseTitle } from '../lib/api';

const COVERS = [
  { tone: 'cyan', pattern: 'triangles' },
  { tone: 'teal', pattern: 'circles' },
  { tone: 'purple', pattern: 'diamonds' },
  { tone: 'cyan', pattern: 'hexagons' },
];
export const coverFor = (index) => COVERS[index % COVERS.length];

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/** Progress of one class: sessions whose end time has passed / all sessions. */
export function classProgress(schedule, classId) {
  const list = schedule.filter((s) => s.class_id === classId);
  const done = list.filter((s) => sessionPhase(s) === 'done').length;
  return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 };
}

/** Student attendance over finished sessions: (present + late) / (finished - excused). */
function myAttendanceRate(schedule) {
  const done = schedule.filter((s) => sessionPhase(s) === 'done');
  const excused = done.filter((s) => s.my_attendance === 'excused').length;
  const attended = done.filter((s) => s.my_attendance === 'present' || s.my_attendance === 'late').length;
  const base = done.length - excused;
  return base > 0 ? Math.round((attended / base) * 1000) / 10 : null;
}

function nextSessions(schedule, limit) {
  const now = new Date();
  return schedule
    .filter((s) => sessionWindow(s).end >= now)
    .sort((a, b) => sessionWindow(a).start - sessionWindow(b).start)
    .slice(0, limit);
}

/* ====================================================================== HOME */
export function HomeView({ app }) {
  const { user, openCourse, classes, schedule } = app;
  const isInstructor = user.role !== 'student';
  const [next] = nextSessions(schedule, 1);
  const nextClass = next && classes.find((c) => c.class_id === next.class_id);
  const done = schedule.filter((s) => sessionPhase(s) === 'done').length;
  const rate = myAttendanceRate(schedule);
  const students = classes.reduce((a, c) => a + c.enrolled_count, 0);

  const stats = [
    { icon: 'book', tone: 'tone-brand', label: isInstructor ? 'Lớp đang giảng dạy' : 'Lớp đang học', value: classes.length, suffix: '' },
    isInstructor
      ? { icon: 'users', tone: 'tone-ok', label: 'Sinh viên trong các lớp', value: students, suffix: '' }
      : { icon: 'check-circle', tone: 'tone-ok', label: 'Chuyên cần của bạn', value: rate ?? 0, suffix: rate === null ? '' : '%', decimals: rate === null ? 0 : 1, note: rate === null ? 'Chưa có buổi nào kết thúc' : null },
    { icon: 'calendar', tone: 'tone-warn', label: 'Buổi đã diễn ra', value: done, suffix: `/${schedule.length}` },
    { icon: 'clock', tone: 'tone-info', label: 'Buổi sắp tới trong 7 ngày', value: schedule.filter((s) => { const d = sessionWindow(s).start - Date.now(); return d >= 0 && d < 7 * 864e5; }).length, suffix: '' },
  ];

  return (
    <div className="view">
      <section className="hero" style={{ '--hero-img': 'url(/banner-a4.jpg)' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', marginBottom: 14 }}>
            <Icon name="calendar" size={14} /> {classes[0]?.semester_name || 'Học kỳ hiện tại'}
          </span>
          <h1>{greeting()}, {user.name}</h1>
          <p>
            {next
              ? `Buổi gần nhất: Buổi ${next.session_number} lớp ${splitCourseTitle(next.course_title).code || next.course_title}, ${dayName(next.session_date)} ${fmtDate(next.session_date)}.`
              : 'Không có buổi học nào sắp tới trong học kỳ này.'}
          </p>
          {nextClass && (
            <div className="hero-actions">
              <button className="btn btn-light btn-lg" onClick={() => openCourse(nextClass.class_id, 'sessions')}>
                Vào lớp {splitCourseTitle(nextClass.course_title).code || nextClass.class_code} <Icon name="arrow-right" size={18} />
              </button>
              <button className="btn btn-glass btn-lg" onClick={() => openCourse(nextClass.class_id, 'attendance')}>
                <Icon name="key" size={18} /> {isInstructor ? 'Mở điểm danh' : 'Điểm danh'}
              </button>
            </div>
          )}
        </div>

        {next && (
          <div className="today-card">
            <span className="badge">{sessionPhase(next) === 'today' ? <><span className="live" /> Hôm nay</> : 'Sắp tới'}</span>
            <h3>Buổi {next.session_number}: {next.session_title}</h3>
            <div className="today-meta">
              <span><Icon name="clock" size={16} /> {dayName(next.session_date)}, {fmtDate(next.session_date)} • {hm(next.start_time)} - {hm(next.end_time)}{next.period_start ? ` (Tiết ${next.period_start}-${next.period_end})` : ''}</span>
              <span><Icon name="pin" size={16} /> Phòng {next.room || next.default_room || 'chưa xếp'}</span>
              <span><Icon name="user" size={16} /> {next.instructor_name}</span>
            </div>
          </div>
        )}
      </section>

      <div className="stat-grid stagger">
        {stats.map((s) => (
          <div className="card stat" key={s.label}>
            <div className="stat-top"><div className={`stat-ico ${s.tone}`}><Icon name={s.icon} size={20} /></div></div>
            <div className="stat-val">{s.note ? '—' : <CountUp value={s.value} decimals={s.decimals ?? 0} />}<small>{s.suffix}</small></div>
            <div className="stat-lab">{s.label}{s.note ? ` • ${s.note}` : ''}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <section>
          <div className="page-head" style={{ margin: '4px 0 16px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Thông báo chung</h2>
          </div>
          <article className="card post">
            <div className="post-head">
              <div className="avatar" style={{ background: 'linear-gradient(135deg,#0a8fa5,#00566a)' }}><Icon name="users" size={18} /></div>
              <div>
                <h3>Điểm danh bằng mã PIN trên BK-LMS</h3>
                <small>Khoa Khoa học và Kỹ thuật Máy tính</small>
              </div>
            </div>
            <div className="post-body">
              <p>Từ học kỳ này, giảng viên mở mã PIN 4 chữ số tại lớp. Mã có hiệu lực 1 phút.</p>
              <ul>
                <li><Icon name="check-circle" size={17} /> Mỗi sinh viên được nhập 2 lần cho một buổi.</li>
                <li><Icon name="check-circle" size={17} /> Nhập sai cả 2 lần: báo giảng viên để được điểm danh thủ công.</li>
                <li><Icon name="check-circle" size={17} /> Danh sách lớp lấy từ hệ thống đăng ký môn học của trường.</li>
              </ul>
            </div>
          </article>
        </section>

        <aside className="card card-pad" style={{ position: 'sticky', top: 'calc(var(--topbar-h) + 12px)' }}>
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div>
              <h3 className="card-title">Lịch sắp tới</h3>
              <p className="card-sub">Các buổi học tiếp theo</p>
            </div>
          </div>
          <TimelineList app={app} />
        </aside>
      </div>
    </div>
  );
}

function TimelineList({ app }) {
  const items = nextSessions(app.schedule, 4);
  if (!items.length) return <p className="muted">Không có buổi học nào sắp tới.</p>;
  return (
    <div className="timeline">
      {items.map((s) => (
        <div className="tl-item" key={s.session_id}>
          <div className="tl-time">{hm(s.start_time)}</div>
          <span className="tl-dot" />
          <div className="tl-body">
            <b>Buổi {s.session_number}: {s.session_title}</b>
            <span>{splitCourseTitle(s.course_title).code || s.course_title} • {dayName(s.session_date)} {fmtDate(s.session_date)} • Phòng {s.room || s.default_room}</span>
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-soft btn-sm" onClick={() => app.openCourse(s.class_id, 'sessions')}>Vào lớp <Icon name="arrow-right" size={14} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================= DASHBOARD */
export function DashboardView({ app }) {
  const { openCourse, classes, schedule } = app;
  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Bảng điều khiển</h1>
          <p>Tổng quan các lớp của bạn trong học kỳ.</p>
        </div>
      </div>

      <div className="two-col">
        <section className="card card-pad" style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div className="card-head">
            <div>
              <h3 className="card-title">Lớp của tôi</h3>
              <p className="card-sub">Tiến độ tính theo số buổi đã diễn ra</p>
            </div>
          </div>
          {classes.length === 0 && <p className="muted">Bạn chưa có lớp nào trong học kỳ này.</p>}
          {classes.map((c, i) => {
            const p = classProgress(schedule, c.class_id);
            const { code, name } = splitCourseTitle(c.course_title);
            const cover = coverFor(i);
            return (
              <button key={c.class_id} className="card card-hover" onClick={() => openCourse(c.class_id, 'sessions')} style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr) auto', width: '100%', textAlign: 'left', overflow: 'hidden', alignItems: 'stretch' }}>
                <div style={{ minHeight: 112 }}><Cover tone={cover.tone} pattern={cover.pattern} /></div>
                <div style={{ padding: '16px 18px', display: 'grid', gap: 6, alignContent: 'center' }}>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--faint)' }}>{c.semester_code} • {c.class_code}</span>
                  <b style={{ fontSize: 15.5 }}>{name} ({code || c.class_code}) [{c.class_code}]</b>
                  <span className="muted" style={{ fontSize: 12.5 }}>GV: {c.instructor_name} • Phòng {c.default_room || 'chưa xếp'}</span>
                  <div style={{ marginTop: 6 }}>
                    <div className="prog-row"><span>Tiến độ học phần</span><b>{p.done}/{p.total} buổi</b></div>
                    <Progress value={p.pct} />
                  </div>
                </div>
                <div style={{ padding: 18, display: 'grid', placeItems: 'center' }}>
                  <span className="btn btn-primary btn-sm">Vào lớp <Icon name="arrow-right" size={14} /></span>
                </div>
              </button>
            );
          })}
        </section>

        <aside className="card card-pad">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div>
              <h3 className="card-title">Dòng thời gian</h3>
              <p className="card-sub">Các buổi học tiếp theo</p>
            </div>
          </div>
          <TimelineList app={app} />
        </aside>
      </div>
    </div>
  );
}

/* ================================================================= MY COURSES */
export function MyCoursesView({ app }) {
  const { search, setSearch, openCourse, classes, schedule, user } = app;
  const q = search.trim().toLowerCase();
  const list = classes
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => `${c.course_title} ${c.class_code} ${c.instructor_name} ${c.semester_code}`.toLowerCase().includes(q));

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Khóa học của tôi</h1>
          <p>{classes[0]?.semester_name || 'Học kỳ hiện tại'} • {classes.length} lớp {user.role === 'student' ? 'đang học' : 'đang giảng dạy'}</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="input-wrap">
          <span className="lead"><Icon name="search" size={17} /></span>
          <input className="input has-lead" placeholder="Tìm theo tên môn, mã lớp hoặc giảng viên…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm khóa học" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card empty">
          <i><Icon name="search" size={28} /></i>
          <b style={{ color: 'var(--text)', fontSize: 16 }}>{classes.length ? 'Không tìm thấy khóa học' : 'Bạn chưa có lớp nào'}</b>
          <span>{classes.length ? 'Thử từ khóa khác.' : 'Danh sách lớp do giảng viên nhập từ hệ thống đăng ký môn học. Hãy liên hệ giảng viên nếu thiếu lớp.'}</span>
          {classes.length > 0 && <button className="btn btn-soft" onClick={() => setSearch('')}>Xóa tìm kiếm</button>}
        </div>
      ) : (
        <div className="course-grid stagger">
          {list.map(({ c, i }) => {
            const { code, name } = splitCourseTitle(c.course_title);
            const p = classProgress(schedule, c.class_id);
            const cover = coverFor(i);
            return (
              <button key={c.class_id} className="card card-hover course-card" onClick={() => openCourse(c.class_id, 'sessions')}>
                <div className="cover-h">
                  <Cover tone={cover.tone} pattern={cover.pattern} />
                  <span className="tag badge" style={{ background: 'rgba(255,255,255,.92)', color: 'var(--brand-800)' }}>{code || 'Lớp'} • {c.class_code}</span>
                </div>
                <div className="body">
                  <span className="code">{c.semester_code} • {c.enrolled_count}/{c.max_capacity} sinh viên</span>
                  <h3>{name}</h3>
                  <span className="dept">GV: {c.instructor_name}</span>
                  <div>
                    <div className="prog-row"><span>Tiến độ</span><b>{p.done}/{p.total} buổi</b></div>
                    <Progress value={p.pct} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
