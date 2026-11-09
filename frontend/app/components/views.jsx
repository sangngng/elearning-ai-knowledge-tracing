'use client';

import Icon from './Icon';
import { Cover, CountUp, Progress } from './ui';
import { COURSE_INFO, SESSIONS_LIST } from '../data/dsaCourseData';

export const COURSES = [
  { code: '79738_CO3029_004352_CLC', short: 'CO3029', title: 'Data Mining', teacher: 'Trần Văn C', group: 'CC01', tone: 'teal', pattern: 'circles', progress: 40, featured: false },
  { code: '79738_CO3061_004318_CLC', short: 'CO3061', title: 'Introduction to Artificial Intelligence', teacher: 'Lê Văn D', group: 'CC01', tone: 'cyan', pattern: 'hexagons', progress: 33, featured: false },
  { code: '79738_CO2003_004318_CLC', short: 'CO2003', title: 'Cấu trúc Dữ liệu và Giải thuật', teacher: 'Nguyễn Văn A', group: 'CC01', tone: 'cyan', pattern: 'triangles', progress: 20, featured: true },
  { code: '79738_CO4029_004318_CLC', short: 'CO4029', title: 'Specialized Project', teacher: 'Nguyễn Văn A', group: 'CC28', tone: 'purple', pattern: 'diamonds', progress: 13, featured: false },
];

const DEPT = 'Khoa Khoa học và Kỹ thuật Máy tính';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}


/* ====================================================================== HOME */
export function HomeView({ app }) {
  const { user, openCourse } = app;
  const isInstructor = user.role === 'instructor';
  const stats = [
    { icon: 'book', tone: 'tone-brand', label: 'Khóa học học kỳ này', value: 4, suffix: '' },
    { icon: 'check-circle', tone: 'tone-ok', label: isInstructor ? 'Chuyên cần trung bình lớp' : 'Chuyên cần của bạn', value: isInstructor ? 93.8 : 100, suffix: '%', decimals: 1, trend: '+2.1%' },
    { icon: 'sparkles', tone: 'tone-ai', label: 'Điểm quiz trung bình', value: 8.4, suffix: '/10', decimals: 1, trend: '+0.3' },
    { icon: 'calendar', tone: 'tone-warn', label: 'Buổi đã hoàn thành', value: 3, suffix: '/15' },
  ];

  return (
    <div className="view">
      <section className="hero" style={{ '--hero-img': 'url(/banner-a4.jpg)' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', marginBottom: 14 }}>
            <Icon name="calendar" size={14} /> Học kỳ 1 • 2026-2027
          </span>
          <h1>{greeting()}, {user.name}</h1>
          <p>
            {isInstructor
              ? 'Hôm nay bạn có 1 buổi giảng và phiên điểm danh PIN đang mở. Theo dõi chuyên cần và năng lực lớp ngay trong một màn hình.'
              : 'Hôm nay bạn có 1 buổi học và 1 bài quiz sắp hết hạn. Mở lớp để điểm danh và xem bản đồ năng lực của mình.'}
          </p>
          <div className="hero-actions">
            <button className="btn btn-light btn-lg" onClick={() => openCourse('sessions')}>
              Vào lớp CO2003 <Icon name="arrow-right" size={18} />
            </button>
            <button className="btn btn-glass btn-lg" onClick={() => openCourse('attendance')}>
              <Icon name="key" size={18} /> {isInstructor ? 'Mở điểm danh' : 'Điểm danh'}
            </button>
          </div>
        </div>

        <div className="today-card">
          <span className="badge"><span className="live" /> Đang diễn ra</span>
          <h3>Buổi 3: Danh sách liên kết đơn</h3>
          <div className="today-meta">
            <span><Icon name="clock" size={16} /> Thứ Tư • 07:30 - 11:15 (Tiết 1-4)</span>
            <span><Icon name="pin" size={16} /> Phòng B4-302 • Cơ sở 1, Lý Thường Kiệt</span>
            <span><Icon name="user" size={16} /> {COURSE_INFO.instructor}</span>
          </div>
        </div>
      </section>

      <div className="stat-grid stagger">
        {stats.map((s) => (
          <div className="card stat" key={s.label}>
            <div className="stat-top">
              <div className={`stat-ico ${s.tone}`}><Icon name={s.icon} size={20} /></div>
              {s.trend && <span className="trend up"><Icon name="trend" size={14} /> {s.trend}</span>}
            </div>
            <div className="stat-val"><CountUp value={s.value} decimals={s.decimals ?? 0} /><small>{s.suffix}</small></div>
            <div className="stat-lab">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <section>
          <div className="page-head" style={{ margin: '4px 0 16px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Thông báo chung</h2>
            <a href="#subscribe" className="btn btn-ghost btn-sm" onClick={(e) => { e.preventDefault(); app.toast('Đã đăng ký nhận thông báo từ diễn đàn', 'ok'); }}>
              <Icon name="rss" size={15} /> Đăng ký diễn đàn
            </a>
          </div>

          <article className="card post">
            <div className="post-head">
              <div className="avatar" style={{ background: 'linear-gradient(135deg,#0a8fa5,#00566a)' }}><Icon name="users" size={18} /></div>
              <div>
                <h3>Triển khai hệ thống BKeL mới và đào tạo trực tuyến học kỳ 1/2026-2027</h3>
                <small>Bởi User Admin • Thứ Sáu, 8 tháng 11 2026, 8:00 AM</small>
              </div>
            </div>
            <div className="post-body">
              <p>Khoa Khoa học và Kỹ thuật Máy tính phối hợp cùng Trung tâm Dữ liệu và Công nghệ Thông tin triển khai hệ thống BKeL thế hệ mới phục vụ giảng dạy và học tập học kỳ 1 năm học 2026-2027.</p>
              <p>Học phần <b>Cấu trúc Dữ liệu và Giải thuật (CO2003 - CC01)</b> do <b>TS. Nguyễn Văn A</b> phụ trách được tích hợp các tiện ích hiện đại:</p>
              <ul>
                <li><Icon name="check-circle" size={17} /> Điểm danh từng buổi học bằng mã PIN động an toàn, chống gian lận.</li>
                <li><Icon name="check-circle" size={17} /> Lộ trình 15 buổi, thời khóa biểu trực quan, quiz tương tác gắn với kỹ năng.</li>
                <li><Icon name="check-circle" size={17} /> Bản đồ năng lực (Knowledge Tracing Radar) giúp người học theo dõi tiến độ.</li>
              </ul>
            </div>
            <div className="post-foot">
              <a href="#permalink" onClick={(e) => e.preventDefault()}>Liên kết cố định</a>
              <a href="#discuss" onClick={(e) => e.preventDefault()}>Thảo luận (0 phản hồi)</a>
            </div>
          </article>

          <article className="card post">
            <div className="post-head">
              <div className="avatar t1"><Icon name="bell" size={18} /></div>
              <div>
                <h3>Cài đặt ứng dụng Moodle trên điện thoại</h3>
                <small>Bởi User Admin • Thứ Sáu, 8 tháng 12 2023, 3:22 PM</small>
              </div>
            </div>
            <div className="post-body">
              <p>Để thuận tiện theo dõi thông báo và tin nhắn trên BKeL, cán bộ và sinh viên hãy cài đặt ứng dụng Moodle trên điện thoại theo các bước sau:</p>
              <ul>
                <li><Icon name="check-circle" size={17} /> Mở CH Play hoặc App Store và tìm từ khóa “Moodle”.</li>
                <li><Icon name="check-circle" size={17} /> Mở ứng dụng, nhập <a href="https://lms.hcmut.edu.vn" target="_blank" rel="noreferrer">lms.hcmut.edu.vn</a> vào phần địa chỉ trang web và kết nối.</li>
                <li><Icon name="check-circle" size={17} /> Đăng nhập bằng tài khoản của trường.</li>
              </ul>
            </div>
            <div className="post-foot">
              <a href="#permalink" onClick={(e) => e.preventDefault()}>Liên kết cố định</a>
              <a href="#discuss" onClick={(e) => e.preventDefault()}>Thảo luận (0 phản hồi)</a>
            </div>
          </article>
        </section>

        <aside className="card card-pad" style={{ position: 'sticky', top: 'calc(var(--topbar-h) + 12px)' }}>
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div>
              <h3 className="card-title">Lịch hôm nay</h3>
              <p className="card-sub">Thứ Tư, 9 tháng 11</p>
            </div>
            <span className="badge badge-brand">2 mục</span>
          </div>
          <TimelineList app={app} />
        </aside>
      </div>
    </div>
  );
}

function TimelineList({ app }) {
  return (
    <div className="timeline">
      <div className="tl-item">
        <div className="tl-time">07:30</div>
        <span className="tl-dot" />
        <div className="tl-body">
          <b>Điểm danh Buổi 3</b>
          <span>CO2003 • Phòng B4-302</span>
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-soft btn-sm" onClick={() => app.openCourse('attendance')}>Vào điểm danh <Icon name="arrow-right" size={14} /></button>
          </div>
        </div>
      </div>
      <div className="tl-item">
        <div className="tl-time">23:59</div>
        <span className="tl-dot" style={{ borderColor: 'var(--info)' }} />
        <div className="tl-body">
          <b>Hạn nộp Quiz Buổi 3</b>
          <span>3 câu hỏi • gắn kỹ năng DSA-LINKEDLIST</span>
          <div style={{ marginTop: 10 }}>
            <button className="btn btn-soft btn-sm" onClick={() => { app.openCourse('sessions'); app.setQuizOpen(true); }}>Làm bài kiểm tra <Icon name="arrow-right" size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================= DASHBOARD */
export function DashboardView({ app }) {
  const { openCourse } = app;
  const done = SESSIONS_LIST.filter((s) => s.status === 'completed').length + 1;
  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Bảng điều khiển</h1>
          <p>Tổng quan hoạt động học tập của bạn trong học kỳ.</p>
        </div>
      </div>

      <div className="two-col">
        <section className="card card-pad">
          <div className="card-head">
            <div>
              <h3 className="card-title">Khóa học truy cập gần đây</h3>
              <p className="card-sub">Tiếp tục từ nơi bạn đã dừng lại</p>
            </div>
          </div>
          <button className="card card-hover" onClick={() => openCourse('sessions')} style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr) auto', width: '100%', textAlign: 'left', overflow: 'hidden', alignItems: 'stretch' }}>
            <div style={{ minHeight: 112 }}><Cover tone="cyan" pattern="triangles" /></div>
            <div style={{ padding: '16px 18px', display: 'grid', gap: 6, alignContent: 'center' }}>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--faint)' }}>79738_CO2003_004318_CLC</span>
              <b style={{ fontSize: 15.5 }}>Cấu trúc Dữ liệu và Giải thuật (CO2003) [CC01]</b>
              <span className="muted" style={{ fontSize: 12.5 }}>{DEPT} • Phòng B4-302</span>
              <div style={{ marginTop: 6 }}>
                <div className="prog-row"><span>Tiến độ học phần</span><b>{done}/15 buổi</b></div>
                <Progress value={(done / 15) * 100} />
              </div>
            </div>
            <div style={{ padding: 18, display: 'grid', placeItems: 'center' }}>
              <span className="btn btn-primary btn-sm">Tiếp tục <Icon name="arrow-right" size={14} /></span>
            </div>
          </button>
        </section>

        <aside className="card card-pad">
          <div className="card-head" style={{ marginBottom: 8 }}>
            <div>
              <h3 className="card-title">Dòng thời gian</h3>
              <p className="card-sub">Việc cần làm hôm nay</p>
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
  const { search, setSearch, openCourse, courseFilter, setCourseFilter } = app;
  const q = search.trim().toLowerCase();
  const list = COURSES.filter((c) => {
    const text = `${c.title} ${c.code} ${c.short} ${c.teacher}`.toLowerCase();
    const okFilter = courseFilter === 'all' || (courseFilter === 'featured' && c.featured);
    return okFilter && text.includes(q);
  });

  return (
    <div className="view">
      <div className="page-head">
        <div>
          <h1>Khóa học của tôi</h1>
          <p>Học kỳ 1 năm học 2026-2027 (HK261) • {COURSES.length} khóa học</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="input-wrap">
          <span className="lead"><Icon name="search" size={17} /></span>
          <input className="input has-lead" placeholder="Tìm theo tên, mã môn hoặc giảng viên…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm khóa học" />
        </div>
        <div className="seg" role="tablist" aria-label="Lọc khóa học">
          <button role="tab" aria-selected={courseFilter === 'all'} className={courseFilter === 'all' ? 'on' : ''} onClick={() => setCourseFilter('all')}>Tất cả</button>
          <button role="tab" aria-selected={courseFilter === 'featured'} className={courseFilter === 'featured' ? 'on' : ''} onClick={() => setCourseFilter('featured')}>Lớp triển khai AI</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card empty">
          <i><Icon name="search" size={28} /></i>
          <b style={{ color: 'var(--text)', fontSize: 16 }}>Không tìm thấy khóa học</b>
          <span>Thử từ khóa khác hoặc xóa bộ lọc.</span>
          <button className="btn btn-soft" onClick={() => { setSearch(''); setCourseFilter('all'); }}>Xóa bộ lọc</button>
        </div>
      ) : (
        <div className="course-grid stagger">
          {list.map((c) => (
            <button
              key={c.code}
              className={`card card-hover course-card ${c.featured ? 'featured' : ''}`}
              onClick={() => (c.featured ? openCourse('sessions') : app.toast(`Lớp ${c.short} chưa được triển khai trong bản demo`, 'info'))}
            >
              <div className="cover-h">
                <Cover tone={c.tone} pattern={c.pattern} />
                <span className="tag badge" style={{ background: 'rgba(255,255,255,.92)', color: 'var(--brand-800)' }}>{c.short} • {c.group}</span>
                <span className="menu" aria-hidden="true"><Icon name="dots" size={16} /></span>
              </div>
              <div className="body">
                <span className="code">{c.code}</span>
                <h3>{c.title}</h3>
                <span className="dept">GV: {c.teacher} • HK261</span>
                <div>
                  <div className="prog-row"><span>Tiến độ</span><b>{c.progress}%</b></div>
                  <Progress value={c.progress} />
                </div>
                {c.featured && <span className="badge badge-ai" style={{ width: 'fit-content' }}><Icon name="sparkles" size={13} /> Tích hợp AI Knowledge Tracing</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
