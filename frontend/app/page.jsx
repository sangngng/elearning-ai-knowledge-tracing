'use client';

import { useState, useEffect } from 'react';
import {
  COURSE_INFO,
  ENROLLED_STUDENTS,
  SESSIONS_LIST,
  SESSION_QUIZ_QUESTIONS,
  SKILL_MASTERY_SAMPLE,
} from './data/dsaCourseData';

export default function BK_LMS_Portal() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // { role: 'instructor'|'student', name, code, email, title }
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Navigation View: 'home' (Trang chủ), 'my-courses' (Các khoá học của tôi), 'course' (CO2003 Inside)
  const [currentView, setCurrentView] = useState('home');

  // Course secondary navigation tab: 'sessions', 'attendance', 'timetable', 'participants', 'analytics', 'radar'
  const [courseTab, setCourseTab] = useState('sessions');

  // Attendance PIN State
  const [pinCode, setPinCode] = useState('8392');
  const [pinSecondsLeft, setPinSecondsLeft] = useState(285); // 4m 45s
  const [isPinActive, setIsPinActive] = useState(true);
  const [studentPinInput, setStudentPinInput] = useState('');
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinFeedback, setPinFeedback] = useState(null);

  // Student Roster with live attendance status
  const [roster, setRoster] = useState(
    ENROLLED_STUDENTS.map((s, idx) => ({
      ...s,
      session3Status: idx === 0 ? 'absent' : idx === 4 ? 'late' : idx === 6 ? 'excused' : 'present',
    }))
  );

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // Filter & Search in My Courses
  const [courseSearch, setCourseSearch] = useState('');
  const [semesterExpanded, setSemesterExpanded] = useState(true);

  // Handle Login
  const handleLoginAs = (roleType) => {
    if (roleType === 'instructor') {
      setCurrentUser({
        role: 'instructor',
        name: 'TS. Nguyễn Văn A',
        code: 'CB001001',
        title: 'Giảng viên',
        email: 'a.nguyen@hcmut.edu.vn',
        dept: 'Bộ môn Khoa học Máy tính',
      });
    } else {
      setCurrentUser({
        role: 'student',
        name: 'Nguyễn Văn B',
        code: '2110001',
        title: 'Sinh viên',
        email: 'b.nguyen@hcmut.edu.vn',
        dept: 'Lớp CC01 - Khóa 2021',
      });
    }
    setIsAuthenticated(true);
    setCurrentView('home');
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (loginUsername.toLowerCase().includes('gv') || loginUsername.toLowerCase().includes('admin')) {
      handleLoginAs('instructor');
    } else {
      handleLoginAs('student');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserMenuOpen(false);
    setCurrentView('home');
  };

  // Countdown timer for PIN code
  useEffect(() => {
    if (!isPinActive || pinSecondsLeft <= 0) return;
    const interval = setInterval(() => {
      setPinSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPinActive, pinSecondsLeft]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerateNewPin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPinCode(randomPin);
    setPinSecondsLeft(300); // 5 minutes
    setIsPinActive(true);
    setPinFeedback(null);
  };

  const handleStudentCheckin = (e) => {
    e.preventDefault();
    if (studentPinInput.trim() === pinCode) {
      setRoster((prev) =>
        prev.map((s) => (s.studentId === '2110001' ? { ...s, session3Status: 'present' } : s))
      );
      setPinFeedback({ success: true, message: 'Điểm danh Buổi 3 thành công! Trạng thái: Có mặt (Present).' });
      setTimeout(() => {
        setPinModalOpen(false);
        setPinFeedback(null);
        setStudentPinInput('');
      }, 1500);
    } else {
      setPinFeedback({ success: false, message: 'Mã PIN không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại!' });
    }
  };

  const handleToggleStudentStatus = (studentId, status) => {
    setRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, session3Status: status } : s))
    );
  };

  const handleSelectQuizAnswer = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    SESSION_QUIZ_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });
    setQuizScore({
      correct: correctCount,
      total: SESSION_QUIZ_QUESTIONS.length,
      percentage: Math.round((correctCount / SESSION_QUIZ_QUESTIONS.length) * 100),
    });
    setQuizSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Normal course directory for HK261
  const coursesData = [
    {
      code: '79738_CO3029_004352_CLC',
      title: 'Data Mining (CO3029)_Trần Văn C [CLC_HK261] [CC01]',
      dept: 'Khoa Khoa học và Kỹ thuật Máy tính (Faculty of Computer Science and Engineering)',
      thumbClass: 'teal',
      icon: '📊',
      isTarget: false,
    },
    {
      code: '79738_CO3061_004318_CLC',
      title: 'Introduction to Artificial Intelligence (CO3061)_Lê Văn D [CLC_HK261] [CC01]',
      dept: 'Khoa Khoa học và Kỹ thuật Máy tính (Faculty of Computer Science and Engineering)',
      thumbClass: 'cyan',
      icon: '🤖',
      isTarget: false,
    },
    {
      code: '79738_CO2003_004318_CLC',
      title: 'Cấu trúc Dữ liệu và Giải thuật (CO2003)_Nguyễn Văn A [CLC_HK261] [CC01]',
      dept: 'Khoa Khoa học và Kỹ thuật Máy tính (Faculty of Computer Science and Engineering)',
      thumbClass: 'cyan',
      icon: '🌲',
      isTarget: true,
    },
    {
      code: '79738_CO4029_004318_CLC',
      title: 'Specialized Project (CO4029)_Nguyễn Văn A [CLC_HK261] [CC28]',
      dept: 'Khoa Khoa học và Kỹ thuật Máy tính (Faculty of Computer Science and Engineering)',
      thumbClass: 'purple',
      icon: '🎓',
      isTarget: false,
    },
  ];

  const filteredCourses = coursesData.filter(
    (c) =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // If user is not authenticated, show official HCMUT CAS Login Page
  if (!isAuthenticated) {
    return (
      <div className="bkel-login-wrapper">
        <header className="bkel-login-topbar">
          <div className="bkel-login-brand">
            <img src="/bkel-logo.png" alt="BK Logo" style={{ height: '36px' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.2px' }}>
                TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐHQG-HCM
              </div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.85)' }}>
                Dịch vụ Xác thực Tập trung (Central Authentication Service - CAS)
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>
            Hệ thống Quản lý Học tập BK-LMS
          </div>
        </header>

        <div className="bkel-login-container">
          <div className="bkel-login-card">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img src="/bkel-logo.png" alt="BK Logo" style={{ height: '64px', margin: '0 auto' }} />
            </div>
            <h1 className="bkel-login-title">ĐĂNG NHẬP BK-LMS</h1>
            <p className="bkel-login-subtitle">
              Sử dụng tài khoản Bách Khoa (HCMUT Account) để truy cập hệ thống
            </p>

            <form onSubmit={handleCustomLogin}>
              <div className="bkel-form-group">
                <label className="bkel-form-label">Tên đăng nhập (Username / MSSV)</label>
                <input
                  type="text"
                  className="bkel-form-input"
                  placeholder="Ví dụ: 2110001 hoặc gv_nguyenvana"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>

              <div className="bkel-form-group">
                <label className="bkel-form-label">Mật khẩu (Password)</label>
                <input
                  type="password"
                  className="bkel-form-input"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ color: '#008299' }}>
                  Quên mật khẩu?
                </a>
              </div>

              <button type="submit" className="bkel-login-btn-primary">
                Đăng nhập (Log in)
              </button>
            </form>

            {/* Quick Demo Authentication Selectors */}
            <div className="bkel-quick-login-box">
              <div className="bkel-quick-login-label">Hoặc đăng nhập nhanh bằng tài khoản mẫu:</div>
              <button
                type="button"
                className="bkel-quick-role-btn"
                onClick={() => handleLoginAs('instructor')}
              >
                <span>👨‍🏫 Giảng viên: <strong>TS. Nguyễn Văn A</strong></span>
                <span style={{ fontSize: '11px', color: '#008299' }}>Vào quyền GV →</span>
              </button>
              <button
                type="button"
                className="bkel-quick-role-btn"
                onClick={() => handleLoginAs('student')}
              >
                <span>👨‍🎓 Sinh viên: <strong>Nguyễn Văn B (2110001)</strong></span>
                <span style={{ fontSize: '11px', color: '#008299' }}>Vào quyền SV →</span>
              </button>
            </div>
          </div>
        </div>

        <footer style={{ background: '#343a40', color: '#adb5bd', fontSize: '12px', textAlign: 'center', padding: '16px' }}>
          Copyright 2007-2026 BKEL - Phát triển dựa trên Moodle • Trường Đại học Bách Khoa - ĐHQG-HCM
        </footer>
      </div>
    );
  }

  // Authenticated Portal
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* =====================================================================
          1. TOP NAVBAR (#008299 HCMUT CYAN) - CLEAN, NO INLINE ROLE SWITCHER
          ===================================================================== */}
      <header className="bkel-navbar">
        <div className="bkel-navbar-left">
          <a
            href="#home"
            className="bkel-logo-link"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('home');
            }}
          >
            <img src="/bkel-logo.png" alt="BK Logo" className="bkel-logo-img" />
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px' }}>BK-LMS</span>
          </a>

          <nav className="bkel-nav-menu">
            <div
              className={`bkel-nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
            >
              Trang chủ
            </div>
            <div
              className={`bkel-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Bảng Điều khiển
            </div>
            <div
              className={`bkel-nav-item ${currentView === 'my-courses' || currentView === 'course' ? 'active' : ''}`}
              onClick={() => setCurrentView('my-courses')}
            >
              Các khoá học của tôi
            </div>
            <div
              className={`bkel-nav-item ${currentView === 'courses' ? 'active' : ''}`}
              onClick={() => setCurrentView('my-courses')}
            >
              Khóa học
            </div>
          </nav>
        </div>

        <div className="bkel-navbar-right" style={{ position: 'relative' }}>
          {/* Notification Bell */}
          <button className="bkel-icon-btn" title="Thông báo hệ thống">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="bkel-badge">2</span>
          </button>

          {/* Chat Bubble */}
          <button className="bkel-icon-btn" title="Tin nhắn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="bkel-badge">1</span>
          </button>

          {/* User Profile and Dropdown */}
          <div
            className="bkel-user-menu"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title="Tài khoản cá nhân"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fff',
                color: '#008299',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
              }}
            >
              {currentUser.role === 'instructor' ? 'GV' : 'SV'}
            </div>
            <span className="bkel-user-name">{currentUser.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="bkel-dropdown-menu">
              <div className="bkel-dropdown-header">
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{currentUser.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {currentUser.title} • {currentUser.code}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{currentUser.email}</div>
              </div>
              <div className="bkel-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <span>👤</span> Hồ sơ cá nhân
              </div>
              <div className="bkel-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <span>📊</span> Bảng điểm học tập
              </div>
              <div className="bkel-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                <span>⚙️</span> Tùy chọn tài khoản
              </div>
              <div className="bkel-dropdown-item danger" onClick={handleLogout}>
                <span>🚪</span> Đăng xuất (Log out)
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =====================================================================
          2. BREADCRUMBS BAR (Authentic Moodle Navigation)
          ===================================================================== */}
      <div className="bkel-breadcrumb-bar">
        <ul className="bkel-breadcrumb-list">
          <li className="bkel-breadcrumb-item">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('home');
              }}
            >
              Trang chủ
            </a>
          </li>

          {currentView === 'dashboard' && (
            <>
              <li className="bkel-breadcrumb-separator">/</li>
              <li className="bkel-breadcrumb-item bkel-breadcrumb-current">Bảng Điều khiển</li>
            </>
          )}

          {currentView === 'my-courses' && (
            <>
              <li className="bkel-breadcrumb-separator">/</li>
              <li className="bkel-breadcrumb-item bkel-breadcrumb-current">Các khoá học của tôi</li>
            </>
          )}

          {currentView === 'course' && (
            <>
              <li className="bkel-breadcrumb-separator">/</li>
              <li className="bkel-breadcrumb-item">
                <a
                  href="#my-courses"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('my-courses');
                  }}
                >
                  Các khoá học của tôi
                </a>
              </li>
              <li className="bkel-breadcrumb-separator">/</li>
              <li className="bkel-breadcrumb-item">Học kỳ 1/2026-2027 (HK261)</li>
              <li className="bkel-breadcrumb-separator">/</li>
              <li className="bkel-breadcrumb-item bkel-breadcrumb-current">
                79738_CO2003_CC01 - Cấu trúc Dữ liệu và Giải thuật
              </li>
            </>
          )}
        </ul>
      </div>

      {/* =====================================================================
          3. MAIN CONTENT ROUTER
          ===================================================================== */}
      <main className="bkel-container">
        {/* -------------------------------------------------------------------
            VIEW: BẢNG ĐIỀU KHIỂN (DASHBOARD)
            ------------------------------------------------------------------- */}
        {currentView === 'dashboard' && (
          <div>
            <h1 className="bkel-page-title">Bảng Điều khiển (Dashboard)</h1>

            {/* Recently accessed courses */}
            <div className="bkel-course-overview-card" style={{ marginBottom: '20px' }}>
              <h3 className="bkel-overview-title">Khóa học đã truy cập gần đây</h3>
              <div
                className="bkel-course-card"
                onClick={() => setCurrentView('course')}
                style={{ border: '1px solid #008299' }}
              >
                <div className="bkel-course-thumb cyan">
                  <span>🌲</span>
                </div>
                <div className="bkel-course-info">
                  <div className="bkel-course-code">| 79738_CO2003_004318_CLC</div>
                  <div className="bkel-course-name">
                    Cấu trúc Dữ liệu và Giải thuật (CO2003)_Nguyễn Văn A [CLC_HK261] [CC01]
                  </div>
                  <div className="bkel-course-dept">
                    Khoa Khoa học và Kỹ thuật Máy tính • Phòng B4-302 (Cơ sở 1 Lý Thường Kiệt, Q.10)
                  </div>
                </div>
                <div style={{ paddingRight: '20px' }}>
                  <button className="bkel-btn-sm" onClick={() => setCurrentView('course')}>
                    Tiếp tục học →
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline & Upcoming activities */}
            <div className="bkel-course-overview-card">
              <h3 className="bkel-overview-title">Dòng thời gian (Timeline)</h3>
              <div className="bkel-activity-list">
                <div className="bkel-activity-item" style={{ background: '#f0fdf4', borderColor: '#86efac' }}>
                  <div className="bkel-activity-left">
                    <span className="bkel-activity-icon">🎯</span>
                    <div>
                      <span className="bkel-activity-name" style={{ color: '#166534' }}>
                        Điểm danh Buổi 3: Danh sách liên kết đơn (Phòng B4-302, Cơ sở 1)
                      </span>
                      <div style={{ fontSize: '12px', color: '#15803d' }}>
                        Hôm nay: 07:30 - 11:15 • Học phần CO2003 (CC01)
                      </div>
                    </div>
                  </div>
                  <button
                    className="bkel-btn-sm"
                    onClick={() => {
                      setCurrentView('course');
                      setCourseTab('attendance');
                    }}
                  >
                    Vào điểm danh
                  </button>
                </div>

                <div className="bkel-activity-item" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div className="bkel-activity-left">
                    <span className="bkel-activity-icon">📝</span>
                    <div>
                      <span className="bkel-activity-name" style={{ color: '#1e40af' }}>
                        Bài kiểm tra tương tác Buổi 3 (Quiz 3 câu)
                      </span>
                      <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                        Hạn chót: 23:59 hôm nay • Học phần CO2003 (CC01)
                      </div>
                    </div>
                  </div>
                  <button
                    className="bkel-btn-sm"
                    onClick={() => {
                      setCurrentView('course');
                      setQuizModalOpen(true);
                    }}
                  >
                    Làm bài kiểm tra
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            VIEW 1: TRANG CHỦ (HOME PAGE)
            ------------------------------------------------------------------- */}
        {currentView === 'home' && (
          <div>
            {/* Real Building A4 Hero Banner */}
            <div className="bkel-hero-wrapper">
              <img src="/banner-a4.jpg" alt="HCMUT Campus Building A4" className="bkel-hero-img" />
              <div className="bkel-hero-overlay-card">
                <h2 className="bkel-hero-overlay-title">
                  Thông tin Hoạt động Sinh viên (Info. Student Affairs)
                </h2>
                <button
                  className="bkel-hero-btn"
                  onClick={() => setCurrentView('my-courses')}
                >
                  Xem (View)
                </button>
              </div>

              {/* Carousel Arrows */}
              <div className="bkel-carousel-arrow left" title="Trước">‹</div>
              <div className="bkel-carousel-arrow right" title="Tiếp">›</div>
            </div>

            {/* Quick Access Course Card */}
            <div
              style={{
                background: '#e6f6f8',
                border: '1px solid #008299',
                borderRadius: '6px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      background: '#008299',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    LỚP HỌC PHẦN HỌC KỲ 1/2026-2027
                  </span>
                  <strong style={{ color: '#004d5a', fontSize: '15px' }}>
                    Cấu trúc Dữ liệu và Giải thuật (CO2003 - Lớp CC01)
                  </strong>
                </div>
                <div style={{ fontSize: '13px', color: '#495057' }}>
                  Giảng viên: TS. Nguyễn Văn A • Thời gian: Thứ Tư, Tiết 1 - 4 (07:30 - 11:15) • Phòng: B4-302, Cơ sở 1 Lý Thường Kiệt (Q.10)
                </div>
              </div>
              <button
                className="bkel-hero-btn"
                onClick={() => setCurrentView('course')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Vào lớp học ngay →
              </button>
            </div>

            {/* Site Announcements Section */}
            <div className="bkel-announcements-header">
              <h2 className="bkel-announcements-title">Thông báo chung / Site announcements</h2>
              <a href="#subscribe" className="bkel-announcements-subscribe" onClick={(e) => e.preventDefault()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 11a9 9 0 0 1 9 9" />
                  <path d="M4 4a16 16 0 0 1 16 16" />
                  <circle cx="5" cy="19" r="1" />
                </svg>
                Đăng ký tới diễn đàn này
              </a>
            </div>

            {/* Announcement 1 */}
            <div className="bkel-post-card">
              <div className="bkel-post-header">
                <div className="bkel-post-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="bkel-post-meta">
                  <h4>Triển khai Hệ thống BKeL Mới & Đào tạo Trực tuyến Học kỳ 1/2026-2027 :</h4>
                  <span>Bởi User Admin - Thứ Sáu, 8 tháng 11 2026, 8:00 AM</span>
                </div>
              </div>
              <div className="bkel-post-content">
                <p>
                  Khoa Khoa học và Kỹ thuật Máy tính phối hợp cùng Trung tâm Dữ liệu và Công nghệ Thông tin triển khai
                  hệ thống BKeL thế hệ mới phục vụ giảng dạy và học tập học kỳ 1 năm học 2026-2027.
                </p>
                <p style={{ marginTop: '6px' }}>
                  Học phần <strong>Cấu trúc Dữ liệu và Giải thuật (CO2003 - Lớp CC01)</strong> do <strong>TS. Nguyễn Văn A</strong> phụ trách
                  tại Cơ sở 1 (268 Lý Thường Kiệt, Q.10) được tích hợp các tiện ích đào tạo hiện đại:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li>Điểm danh từng buổi học bằng mã PIN động an toàn, chống gian lận.</li>
                  <li>Lộ trình 15 buổi học, thời khóa biểu trực quan, bài kiểm tra tương tác từng câu gắn với kỹ năng.</li>
                  <li>Bản đồ năng lực tri thức (Knowledge Tracing Radar) hỗ trợ người học theo dõi tiến độ.</li>
                </ul>
              </div>
              <div className="bkel-post-footer">
                <a href="#permalink" onClick={(e) => e.preventDefault()}>Permalink</a>
                <a href="#discuss" onClick={(e) => e.preventDefault()}>Thảo luận về chủ đề này (0 phản hồi)</a>
              </div>
            </div>

            {/* Announcement 2: Moodle Mobile */}
            <div className="bkel-post-card">
              <div className="bkel-post-header">
                <div className="bkel-post-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="bkel-post-meta">
                  <h4>Thông báo về việc cài đặt Moodle Mobile :</h4>
                  <span>Bởi User Admin - Thứ Sáu, 8 tháng 12 2023, 3:22 PM</span>
                </div>
              </div>
              <div className="bkel-post-content">
                <p>
                  Để thuận tiện trong việc theo dõi thông báo, tin nhắn trên BKeL cán bộ và sinh viên hãy cài đặt ứng dụng
                  Moodle trên điện thoại di động theo hướng dẫn sau:
                </p>
                <p style={{ marginTop: '4px' }}>
                  - Bước 1: Trên điện thoại mở ứng dụng CH Play (Android) hoặc App Store (iPhone), tìm từ khóa Moodle.
                </p>
                <p style={{ marginTop: '2px' }}>
                  - Bước 2: Sau khi cài đặt thành công, mở ứng dụng Moodle và nhập{' '}
                  <a href="https://lms.hcmut.edu.vn" target="_blank" rel="noreferrer">
                    https://lms.hcmut.edu.vn
                  </a>{' '}
                  vào phần Địa chỉ trang web và nhấn kết nối.
                </p>
                <p style={{ marginTop: '2px' }}>
                  - Bước 3: Đăng nhập tài khoản trường để kết nối vào hệ thống BKeL trên ứng dụng Moodle của điện thoại.
                </p>
              </div>
              <div className="bkel-post-footer">
                <a href="#permalink" onClick={(e) => e.preventDefault()}>Permalink</a>
                <a href="#discuss" onClick={(e) => e.preventDefault()}>Thảo luận về chủ đề này (0 phản hồi)</a>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            VIEW 2: CÁC KHOÁ HỌC CỦA TÔI (MY COURSES)
            ------------------------------------------------------------------- */}
        {currentView === 'my-courses' && (
          <div>
            <h1 className="bkel-page-title">Các khoá học của tôi</h1>

            <div className="bkel-course-overview-card">
              <h3 className="bkel-overview-title">Tổng quan về khóa học</h3>

              {/* Filter & Search Toolbar */}
              <div className="bkel-filter-toolbar">
                <select className="bkel-select">
                  <option>Tất cả (All)</option>
                  <option>Đang diễn ra (In progress)</option>
                  <option>Tương lai (Future)</option>
                  <option>Đã qua (Past)</option>
                </select>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="bkel-search-input"
                    placeholder="Tìm kiếm khóa học..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                </div>

                <select className="bkel-select">
                  <option>Sắp xếp theo tên viết tắt (Sort by short name)</option>
                  <option>Sắp xếp theo tên đầy đủ (Sort by course name)</option>
                </select>

                <select className="bkel-select">
                  <option>Danh sách (List)</option>
                  <option>Thẻ (Card)</option>
                </select>
              </div>

              {/* Semester Accordion */}
              <div className="bkel-semester-accordion">
                <div
                  className="bkel-semester-header"
                  onClick={() => setSemesterExpanded(!semesterExpanded)}
                >
                  <span style={{ fontSize: '12px' }}>{semesterExpanded ? '▼' : '►'}</span>
                  <span>Học kỳ (Semester) 1/2026-2027</span>
                </div>

                {semesterExpanded && (
                  <div className="bkel-course-list">
                    {filteredCourses.map((c, idx) => (
                      <div
                        key={idx}
                        className="bkel-course-card"
                        onClick={() => {
                          if (c.isTarget) {
                            setCurrentView('course');
                          } else {
                            alert(`Đang mở học phần: ${c.title}`);
                          }
                        }}
                      >
                        <div className={`bkel-course-thumb ${c.thumbClass}`}>
                          <span>{c.icon}</span>
                        </div>

                        <div className="bkel-course-info">
                          <div className="bkel-course-code">| {c.code}</div>
                          <div className="bkel-course-name">{c.title}</div>
                          <div className="bkel-course-dept">{c.dept}</div>
                        </div>

                        <div className="bkel-card-menu-btn" title="Tùy chọn">
                          ⋮
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            VIEW 3: CHI TIẾT MÔN HỌC CO2003 (DSA - LỚP CC01)
            ------------------------------------------------------------------- */}
        {currentView === 'course' && (
          <div>
            {/* Course Header Banner */}
            <div className="bkel-course-header-banner">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: '#008299',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      CO2003 • LỚP CC01
                    </span>
                    <span
                      style={{
                        background: '#e0f2f1',
                        color: '#00695c',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      4 TÍN CHỈ • CHÍNH QUY BÁCH KHOA
                    </span>
                  </div>
                  <h1 className="bkel-course-title-main">Cấu trúc Dữ liệu và Giải thuật (Data Structures and Algorithms)</h1>
                  <p style={{ fontSize: '13.5px', color: '#495057', maxWidth: '850px' }}>
                    Môn học trang bị kiến thức nền tảng về cấu trúc dữ liệu tuyến tính, phi tuyến tính, giải thuật tìm kiếm,
                    sắp xếp và đánh giá độ phức tạp thuật toán theo chuẩn quốc tế ACM/IEEE.
                  </p>
                </div>

                <div
                  style={{
                    background: '#e6f6f8',
                    border: '1px solid #b2dfdb',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    color: '#004d5a',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#008299', marginBottom: '2px' }}>
                    HÔM NAY: BUỔI 3 (ĐANG DIỄN RA)
                  </div>
                  <div>Phòng B4-302 (Cơ sở 1 Lý Thường Kiệt, Q.10)</div>
                  <div style={{ color: '#2e7d32', fontWeight: 600, marginTop: '2px' }}>
                    ● Phiên điểm danh PIN đang mở
                  </div>
                </div>
              </div>

              {/* Course Meta Tags */}
              <div className="bkel-course-meta-tags">
                <div className="bkel-course-meta-item">
                  <strong>Giảng viên:</strong> TS. Nguyễn Văn A
                </div>
                <div>•</div>
                <div className="bkel-course-meta-item">
                  <strong>Thời gian:</strong> Thứ Tư, Tiết 1 - 4 (07:30 - 11:15)
                </div>
                <div>•</div>
                <div className="bkel-course-meta-item">
                  <strong>Địa điểm:</strong> Phòng B4-302, Cơ sở 1 (268 Lý Thường Kiệt, Q.10)
                </div>
                <div>•</div>
                <div className="bkel-course-meta-item">
                  <strong>Sĩ số lớp:</strong> {roster.length}/60 sinh viên
                </div>
              </div>
            </div>

            {/* Moodle Secondary Navigation Tabs */}
            <div className="bkel-course-tabs">
              <button
                className={`bkel-tab-btn ${courseTab === 'sessions' ? 'active' : ''}`}
                onClick={() => setCourseTab('sessions')}
              >
                <span>📚</span> Nội dung khoá học (15 Buổi học)
              </button>
              <button
                className={`bkel-tab-btn ${courseTab === 'attendance' ? 'active' : ''}`}
                onClick={() => setCourseTab('attendance')}
              >
                <span>🎯</span> Điểm danh BKeL (Attendance PIN)
              </button>
              <button
                className={`bkel-tab-btn ${courseTab === 'timetable' ? 'active' : ''}`}
                onClick={() => setCourseTab('timetable')}
              >
                <span>📅</span> Thời khóa biểu (Timetable)
              </button>
              <button
                className={`bkel-tab-btn ${courseTab === 'participants' ? 'active' : ''}`}
                onClick={() => setCourseTab('participants')}
              >
                <span>👥</span> Người tham gia (8 Sinh viên)
              </button>
              <button
                className={`bkel-tab-btn ${courseTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setCourseTab('analytics')}
              >
                <span>📊</span> Báo cáo & Thống kê
              </button>
              <button
                className={`bkel-tab-btn ${courseTab === 'radar' ? 'active' : ''}`}
                onClick={() => setCourseTab('radar')}
              >
                <span>🧠</span> Phân tích Năng lực AI (Knowledge Tracing)
              </button>
            </div>

            {/* ---------------------------------------------------------------
                SUB-TAB 1: 15 BUỔI HỌC (CO2003 CURRICULUM)
                --------------------------------------------------------------- */}
            {courseTab === 'sessions' && (
              <div>
                {/* Topic 0: General Course Information */}
                <div className="bkel-topic-card">
                  <div className="bkel-topic-header">
                    <div className="bkel-topic-title">
                      <span>📌</span> Thông tin chung & Tài nguyên học phần
                    </div>
                  </div>
                  <div className="bkel-topic-body">
                    <div className="bkel-activity-list">
                      <div className="bkel-activity-item">
                        <div className="bkel-activity-left">
                          <span className="bkel-activity-icon">📄</span>
                          <span className="bkel-activity-name">Đề cương chi tiết môn học CO2003_DSA_HK261.pdf</span>
                        </div>
                        <button className="bkel-btn-outline" onClick={() => alert('Đang tải tài liệu Đề cương chi tiết...')}>
                          Tải về
                        </button>
                      </div>

                      <div className="bkel-activity-item">
                        <div className="bkel-activity-left">
                          <span className="bkel-activity-icon">📢</span>
                          <span className="bkel-activity-name">Diễn đàn thông báo & Thảo luận lớp học CC01</span>
                        </div>
                        <button className="bkel-btn-outline" onClick={() => alert('Mở diễn đàn trao đổi lớp học...')}>
                          Truy cập
                        </button>
                      </div>

                      <div className="bkel-activity-item" style={{ background: '#e6f6f8', borderColor: '#008299' }}>
                        <div className="bkel-activity-left">
                          <span className="bkel-activity-icon">🎯</span>
                          <div>
                            <span className="bkel-activity-name" style={{ color: '#008299' }}>
                              Điểm danh chuyên cần các buổi học (BKeL Attendance)
                            </span>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                              Sinh viên check-in bằng mã PIN 4 chữ số do Giảng viên phát hành tại phòng B4-302
                            </div>
                          </div>
                        </div>
                        <button className="bkel-btn-sm" onClick={() => setCourseTab('attendance')}>
                          Vào điểm danh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exactly 15 Sessions Covering Full Curriculum */}
                {SESSIONS_LIST.map((session) => {
                  const isCurrent = session.sessionNumber === 3;
                  const isPast = session.sessionNumber < 3;
                  return (
                    <div
                      key={session.sessionNumber}
                      className="bkel-topic-card"
                      style={isCurrent ? { border: '2px solid #008299' } : {}}
                    >
                      <div className="bkel-topic-header">
                        <div className="bkel-topic-title">
                          <span>{isPast ? '✅' : isCurrent ? '🔴' : '📖'}</span>
                          <span>
                            Buổi {session.sessionNumber}: {session.title}
                          </span>
                        </div>

                        <span
                          className={`bkel-session-badge ${
                            isPast ? 'done' : isCurrent ? 'current' : 'upcoming'
                          }`}
                        >
                          {isPast
                            ? `ĐÃ HỌC (${session.attendanceRate}% CHUYÊN CẦN)`
                            : isCurrent
                            ? 'ĐANG HỌC HÔM NAY'
                            : 'SẮP TỚI'}
                        </span>
                      </div>

                      <div className="bkel-topic-body">
                        <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>
                          📅 {session.date} • ⏰ {session.time} • 📍 Phòng {session.room} (Cơ sở 1 Lý Thường Kiệt, Q.10)
                        </div>
                        <div className="bkel-topic-desc">{session.description}</div>

                        {/* Activities within session */}
                        <div className="bkel-activity-list">
                          {/* Slide presentation PDF */}
                          <div className="bkel-activity-item">
                            <div className="bkel-activity-left">
                              <span className="bkel-activity-icon">📊</span>
                              <span className="bkel-activity-name">
                                Slide bài giảng Buổi {session.sessionNumber}: {session.title} (PDF)
                              </span>
                            </div>
                            <button
                              className="bkel-btn-outline"
                              onClick={() => alert(`Đang tải Slide bài giảng Buổi ${session.sessionNumber}...`)}
                            >
                              Tải Slide
                            </button>
                          </div>

                          {/* Source code / Lab */}
                          <div className="bkel-activity-item">
                            <div className="bkel-activity-left">
                              <span className="bkel-activity-icon">💻</span>
                              <span className="bkel-activity-name">
                                Mã nguồn thực hành & Bài tập mẫu (C++ / Python / GitHub)
                              </span>
                            </div>
                            <button
                              className="bkel-btn-outline"
                              onClick={() => alert(`Mở kho tài liệu mã nguồn Buổi ${session.sessionNumber}...`)}
                            >
                              Xem Code
                            </button>
                          </div>

                          {/* Session 3 Specific Interactive Features: PIN Checkin & Quiz */}
                          {isCurrent && (
                            <>
                              <div
                                className="bkel-activity-item"
                                style={{ background: '#f0fdf4', borderColor: '#86efac' }}
                              >
                                <div className="bkel-activity-left">
                                  <span className="bkel-activity-icon">🎯</span>
                                  <div>
                                    <span className="bkel-activity-name" style={{ color: '#166534' }}>
                                      Điểm danh Buổi 3 bằng mã PIN (Mở lúc 07:30 - 08:00)
                                    </span>
                                    <div style={{ fontSize: '12px', color: '#15803d' }}>
                                      {currentUser.role === 'instructor'
                                        ? `Mã PIN đang phát hành: ${pinCode} (Còn lại ${formatTimer(pinSecondsLeft)})`
                                        : roster[0].session3Status === 'present'
                                        ? 'Bạn đã điểm danh thành công: CÓ MẶT (Present)'
                                        : 'Chưa điểm danh! Nhập mã PIN do Giảng viên cung cấp'}
                                    </div>
                                  </div>
                                </div>
                                {currentUser.role === 'instructor' ? (
                                  <button className="bkel-btn-sm" onClick={() => setCourseTab('attendance')}>
                                    Quản lý phiên điểm danh
                                  </button>
                                ) : (
                                  <button
                                    className="bkel-btn-sm"
                                    onClick={() => setPinModalOpen(true)}
                                    style={
                                      roster[0].session3Status === 'present'
                                        ? { background: '#16a34a' }
                                        : {}
                                    }
                                  >
                                    {roster[0].session3Status === 'present' ? '✓ Đã điểm danh' : 'Nhập mã PIN ngay'}
                                  </button>
                                )}
                              </div>

                              <div
                                className="bkel-activity-item"
                                style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}
                              >
                                <div className="bkel-activity-left">
                                  <span className="bkel-activity-icon">📝</span>
                                  <div>
                                    <span className="bkel-activity-name" style={{ color: '#1e40af' }}>
                                      Bài kiểm tra tương tác Buổi 3 (Interactive Quiz - 3 câu hỏi)
                                    </span>
                                    <div style={{ fontSize: '12px', color: '#3b82f6' }}>
                                      Đánh giá mức độ nắm vững Singly Linked List, Insert/Delete, và Phân tích độ phức tạp O(1)/O(n)
                                    </div>
                                  </div>
                                </div>
                                <button className="bkel-btn-sm" onClick={() => setQuizModalOpen(true)}>
                                  Làm Quiz ngay ({SESSION_QUIZ_QUESTIONS.length} câu)
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ---------------------------------------------------------------
                SUB-TAB 2: ĐIỂM DANH (BKeL ATTENDANCE PIN PLUGIN)
                --------------------------------------------------------------- */}
            {courseTab === 'attendance' && (
              <div className="bkel-attendance-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a365d' }}>
                      Điểm danh học phần: CO2003 - Cấu trúc Dữ liệu và Giải thuật
                    </h2>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                      Địa điểm: Phòng B4-302 (Cơ sở 1, 268 Lý Thường Kiệt, Q.10) • Phương thức: Mã PIN động 4 chữ số
                    </div>
                  </div>

                  {currentUser.role === 'instructor' ? (
                    <button className="bkel-btn-sm" onClick={handleGenerateNewPin}>
                      🔄 Tạo mã PIN mới (Generate PIN)
                    </button>
                  ) : (
                    <button
                      className="bkel-btn-sm"
                      onClick={() => setPinModalOpen(true)}
                      style={roster[0].session3Status === 'present' ? { background: '#16a34a' } : {}}
                    >
                      {roster[0].session3Status === 'present' ? '✓ Bạn đã điểm danh (Có mặt)' : '🎯 Nhập mã PIN điểm danh'}
                    </button>
                  )}
                </div>

                {/* Live PIN Code Banner for Instructor View */}
                {currentUser.role === 'instructor' && (
                  <div className="bkel-pin-panel">
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#004d5a', textTransform: 'uppercase', marginBottom: '4px' }}>
                        MÃ PIN ĐIỂM DANH BUỔI 3 ĐANG PHÁT HÀNH TẠI PHÒNG B4-302 (CƠ SỞ 1 Q.10)
                      </div>
                      <div className="bkel-pin-display">
                        <div className="bkel-pin-digits">{pinCode}</div>
                        <div className="bkel-pin-timer">
                          <span>⏱ Hết hạn sau:</span>
                          <strong>{formatTimer(pinSecondsLeft)}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', color: '#495057', marginBottom: '6px' }}>
                        Tỷ lệ điểm danh hiện tại: <strong>{roster.filter((s) => s.session3Status === 'present').length}/{roster.length}</strong> sinh viên
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="bkel-btn-outline"
                          onClick={() => {
                            setRoster((prev) => prev.map((s) => ({ ...s, session3Status: 'present' })));
                          }}
                        >
                          Điểm danh tất cả Có mặt
                        </button>
                        <button
                          className="bkel-btn-outline"
                          onClick={() => setIsPinActive(!isPinActive)}
                          style={!isPinActive ? { borderColor: '#dc2626', color: '#dc2626' } : {}}
                        >
                          {isPinActive ? 'Khóa phiên PIN' : 'Mở lại phiên PIN'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Personal Check-in Status Card */}
                {currentUser.role === 'student' && (
                  <div
                    style={{
                      background: roster[0].session3Status === 'present' ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${roster[0].session3Status === 'present' ? '#86efac' : '#fde68a'}`,
                      borderRadius: '8px',
                      padding: '16px 20px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: roster[0].session3Status === 'present' ? '#166534' : '#92400e' }}>
                        Trạng thái của bạn ({currentUser.name} - {currentUser.code}):{' '}
                        {roster[0].session3Status === 'present' ? 'ĐÃ ĐIỂM DANH (Có mặt)' : 'CHƯA ĐIỂM DANH'}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '2px' }}>
                        Buổi 3: Danh sách liên kết đơn • Giảng viên đang phát hành mã PIN tại phòng B4-302.
                      </div>
                    </div>
                    {roster[0].session3Status !== 'present' && (
                      <button className="bkel-btn-sm" onClick={() => setPinModalOpen(true)}>
                        Nhập mã PIN ngay
                      </button>
                    )}
                  </div>
                )}

                {/* 15 Sessions Attendance History Table */}
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a365d', marginBottom: '12px' }}>
                  Danh sách 15 Buổi học & Tiến độ điểm danh
                </h3>
                <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
                  <table className="bkel-table">
                    <thead>
                      <tr>
                        <th>Buổi</th>
                        <th>Chủ đề bài giảng</th>
                        <th>Ngày học</th>
                        <th>Thời gian</th>
                        <th>Phòng học</th>
                        <th>Hình thức</th>
                        <th>Tỷ lệ chuyên cần</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SESSIONS_LIST.map((s) => (
                        <tr key={s.sessionNumber} style={s.sessionNumber === 3 ? { background: '#e6f6f8' } : {}}>
                          <td>
                            <strong>Buổi {s.sessionNumber}</strong>
                          </td>
                          <td>{s.title}</td>
                          <td>{s.date}</td>
                          <td>{s.time}</td>
                          <td>Phòng B4-302 (Cơ sở 1 Q.10)</td>
                          <td>
                            <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                              Mã PIN 4 số
                            </span>
                          </td>
                          <td>
                            {s.sessionNumber === 3 ? (
                              <strong>
                                {Math.round(
                                  (roster.filter((st) => st.session3Status === 'present').length / roster.length) * 100
                                )}
                                % ({roster.filter((st) => st.session3Status === 'present').length}/{roster.length})
                              </strong>
                            ) : s.sessionNumber < 3 ? (
                              <span>{s.attendanceRate}%</span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>--</span>
                            )}
                          </td>
                          <td>
                            {s.sessionNumber === 3 ? (
                              <span className="bkel-status-pill p">Đang mở PIN</span>
                            ) : s.sessionNumber < 3 ? (
                              <span className="bkel-status-pill p">Hoàn tất</span>
                            ) : (
                              <span className="bkel-status-pill e">Chưa diễn ra</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Detailed Student Attendance Roster for Session 3 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a365d' }}>
                    Sổ điểm danh Buổi 3: Danh sách 8 sinh viên lớp CC01
                  </h3>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    Chú thích: <span className="bkel-status-pill p">P: Có mặt</span>{' '}
                    <span className="bkel-status-pill l">L: Đi trễ</span>{' '}
                    <span className="bkel-status-pill e">E: Có phép</span>{' '}
                    <span className="bkel-status-pill a">A: Vắng</span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="bkel-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>MSSV</th>
                        <th>Họ và tên</th>
                        <th>Email Bách Khoa</th>
                        <th>Lịch sử chuyên cần</th>
                        <th>Trạng thái Buổi 3</th>
                        {currentUser.role === 'instructor' && <th>Thao tác điều chỉnh (Giảng viên)</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((student, idx) => (
                        <tr key={student.studentId}>
                          <td>{idx + 1}</td>
                          <td>
                            <strong>{student.studentId}</strong>
                          </td>
                          <td>{student.fullName}</td>
                          <td style={{ color: '#6c757d', fontSize: '12.5px' }}>{student.email}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div
                                style={{
                                  width: '60px',
                                  height: '6px',
                                  background: '#e2e8f0',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${student.overallAttendanceRate}%`,
                                    height: '100%',
                                    background: '#008299',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>{student.overallAttendanceRate}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`bkel-status-pill ${student.session3Status[0]}`}>
                              {student.session3Status === 'present'
                                ? 'P (Có mặt)'
                                : student.session3Status === 'late'
                                ? 'L (Đi trễ)'
                                : student.session3Status === 'excused'
                                ? 'E (Có phép)'
                                : 'A (Vắng)'}
                            </span>
                          </td>
                          {currentUser.role === 'instructor' && (
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  className="bkel-btn-outline"
                                  style={{ padding: '2px 8px', fontSize: '11px' }}
                                  onClick={() => handleToggleStudentStatus(student.studentId, 'present')}
                                >
                                  P
                                </button>
                                <button
                                  className="bkel-btn-outline"
                                  style={{ padding: '2px 8px', fontSize: '11px' }}
                                  onClick={() => handleToggleStudentStatus(student.studentId, 'late')}
                                >
                                  L
                                </button>
                                <button
                                  className="bkel-btn-outline"
                                  style={{ padding: '2px 8px', fontSize: '11px' }}
                                  onClick={() => handleToggleStudentStatus(student.studentId, 'excused')}
                                >
                                  E
                                </button>
                                <button
                                  className="bkel-btn-outline"
                                  style={{ padding: '2px 8px', fontSize: '11px' }}
                                  onClick={() => handleToggleStudentStatus(student.studentId, 'absent')}
                                >
                                  A
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------
                SUB-TAB 3: THỜI KHÓA BIỂU (TIMETABLE GRID - CƠ SỞ 1 Q.10)
                --------------------------------------------------------------- */}
            {courseTab === 'timetable' && (
              <div className="bkel-course-overview-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a365d' }}>
                      Thời khóa biểu Học kỳ 1/2026-2027 (Tuần 1 - 15)
                    </h2>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                      Địa điểm: Cơ sở 1 (268 Lý Thường Kiệt, P.14, Q.10, TP.HCM)
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#008299', fontWeight: 600 }}>
                    Tiết 1: 07:30 • Tiết 2: 08:25 • Tiết 3: 09:30 • Tiết 4: 10:25
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="bkel-timetable-grid">
                    <thead>
                      <tr>
                        <th style={{ width: '12%' }}>Tiết học</th>
                        <th>Thứ Hai</th>
                        <th>Thứ Ba</th>
                        <th style={{ background: '#e6f6f8', color: '#008299' }}>Thứ Tư (Hôm nay)</th>
                        <th>Thứ Năm</th>
                        <th>Thứ Sáu</th>
                        <th>Thứ Bảy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Tiết 1 - 4 (Sáng: 07:30 - 11:15) */}
                      <tr>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', fontWeight: 700 }}>
                          <div>Tiết 1 - 4</div>
                          <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: 400 }}>07:30 - 11:15</div>
                        </td>
                        <td>--</td>
                        <td>--</td>
                        <td style={{ background: '#f0fdf4' }}>
                          <div className="bkel-class-slot">
                            <div>
                              <strong style={{ fontSize: '13px', color: '#004d5a' }}>
                                CO2003 - Cấu trúc Dữ liệu & Giải thuật
                              </strong>
                              <div style={{ fontSize: '11px', color: '#00695c' }}>Lớp CC01 (4 Tín chỉ)</div>
                            </div>
                            <div style={{ fontSize: '11px', marginTop: '4px' }}>
                              📍 <strong>Phòng B4-302</strong> (Cơ sở 1 Lý Thường Kiệt, Q.10)
                              <br />
                              👨‍🏫 TS. Nguyễn Văn A
                            </div>
                          </div>
                        </td>
                        <td>--</td>
                        <td>
                          <div
                            style={{
                              background: '#eff6ff',
                              borderLeft: '4px solid #3b82f6',
                              padding: '8px',
                              borderRadius: '4px',
                              height: '100%',
                              fontSize: '11.5px',
                            }}
                          >
                            <strong>CO3061 - Nhập môn Trí tuệ Nhân tạo</strong>
                            <div style={{ color: '#6b7280' }}>Phòng B6-102 (Cơ sở 1 Q.10) • TS. Lê Văn D</div>
                          </div>
                        </td>
                        <td>--</td>
                      </tr>

                      {/* Tiết 5 - 6 (Nghỉ trưa / Đầu giờ chiều) */}
                      <tr>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', fontWeight: 700 }}>
                          <div>Tiết 5 - 6</div>
                          <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: 400 }}>12:30 - 14:15</div>
                        </td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>

                      {/* Tiết 7 - 10 (Chiều: 14:30 - 18:00) */}
                      <tr>
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', background: '#f8f9fa', fontWeight: 700 }}>
                          <div>Tiết 7 - 10</div>
                          <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: 400 }}>14:30 - 18:00</div>
                        </td>
                        <td>
                          <div
                            style={{
                              background: '#f5f3ff',
                              borderLeft: '4px solid #8b5cf6',
                              padding: '8px',
                              borderRadius: '4px',
                              height: '100%',
                              fontSize: '11.5px',
                            }}
                          >
                            <strong>CO3029 - Khai phá Dữ liệu (Data Mining)</strong>
                            <div style={{ color: '#6b7280' }}>Phòng B4-201 (Cơ sở 1 Q.10) • TS. Trần Văn C</div>
                          </div>
                        </td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------
                SUB-TAB 4: NGƯỜI THAM GIA (PARTICIPANTS - 8 STUDENTS)
                --------------------------------------------------------------- */}
            {courseTab === 'participants' && (
              <div className="bkel-course-overview-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a365d' }}>
                      Danh sách Người tham gia học phần (8 Sinh viên)
                    </h2>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                      Lớp CC01 • Khoa Khoa học và Kỹ thuật Máy tính • Cơ sở 1 Lý Thường Kiệt
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="bkel-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>MSSV</th>
                        <th>Họ và tên</th>
                        <th>Email Trường</th>
                        <th>Vai trò</th>
                        <th>Chuyên cần</th>
                        <th>Điểm TB Quiz</th>
                        <th>Trạng thái học vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((s, idx) => (
                        <tr key={s.studentId}>
                          <td>{idx + 1}</td>
                          <td>
                            <strong>{s.studentId}</strong>
                          </td>
                          <td>{s.fullName}</td>
                          <td style={{ color: '#6c757d', fontSize: '12.5px' }}>{s.email}</td>
                          <td>Sinh viên</td>
                          <td>
                            <strong style={{ color: '#008299' }}>{s.overallAttendanceRate}%</strong>
                          </td>
                          <td>
                            <strong>{s.averageQuizScore} / 10</strong>
                          </td>
                          <td>
                            <span className="bkel-status-pill p">Đang theo học (Enrolled)</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------
                SUB-TAB 5: BÁO CÁO & THỐNG KÊ (REPORTS & ANALYTICS)
                --------------------------------------------------------------- */}
            {courseTab === 'analytics' && (
              <div>
                {/* Metric Summary Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div className="bkel-post-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', fontWeight: 700 }}>
                      Sĩ số đăng ký lớp CC01
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#008299', margin: '4px 0' }}>
                      8 / 60
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a' }}>Sĩ số danh sách chính thức</div>
                  </div>

                  <div className="bkel-post-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', fontWeight: 700 }}>
                      Tỷ lệ chuyên cần trung bình
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>
                      93.8%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>Buổi 1: 100% • Buổi 2: 87.5% • Buổi 3: 87.5%</div>
                  </div>

                  <div className="bkel-post-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', fontWeight: 700 }}>
                      Điểm trung bình Quiz tương tác
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>
                      8.4 / 10
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a' }}>Đã hoàn thành 2 đợt kiểm tra ngắn</div>
                  </div>

                  <div className="bkel-post-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', textTransform: 'uppercase', fontWeight: 700 }}>
                      Tiến độ hoàn thành học phần
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7', margin: '4px 0' }}>
                      3 / 15 Buổi
                    </div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>20.0% chương trình học kỳ</div>
                  </div>
                </div>

                {/* Session Attendance Rate Chart */}
                <div className="bkel-course-overview-card">
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a365d', marginBottom: '16px' }}>
                    Biểu đồ Tỷ lệ chuyên cần qua 15 Buổi học
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '14px', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                    {SESSIONS_LIST.map((s) => {
                      const rate = s.sessionNumber === 3
                        ? Math.round((roster.filter((st) => st.session3Status === 'present').length / roster.length) * 100)
                        : s.attendanceRate;
                      const isUpcoming = s.sessionNumber > 3;
                      const heightPercent = isUpcoming ? 10 : rate;
                      return (
                        <div
                          key={s.sessionNumber}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 700, color: isUpcoming ? '#9ca3af' : '#008299', marginBottom: '4px' }}>
                            {isUpcoming ? '-' : `${rate}%`}
                          </span>
                          <div
                            style={{
                              width: '100%',
                              height: `${heightPercent}%`,
                              background: isUpcoming
                                ? '#e2e8f0'
                                : s.sessionNumber === 3
                                ? 'linear-gradient(180deg, #008299 0%, #48cae4 100%)'
                                : '#10b981',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s ease',
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>B{s.sessionNumber}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------------------
                SUB-TAB 6: PHÂN TÍCH NĂNG LỰC AI (KNOWLEDGE TRACING RADAR)
                --------------------------------------------------------------- */}
            {courseTab === 'radar' && (
              <div className="bkel-course-overview-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a365d' }}>
                      Bản đồ Năng lực AI (Knowledge Tracing Radar) • Người học: {currentUser.name} ({currentUser.code})
                    </h2>
                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                      Được tính toán tự động dựa trên kết quả tương tác từng câu hỏi (Per-Question Item Response Theory)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
                  {/* Skill Progress Bars */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1a365d', marginBottom: '12px' }}>
                      Mức độ thành thạo theo 11 Kỹ năng Trọng tâm (DSA Skill Mastery)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {SKILL_MASTERY_SAMPLE.map((skill, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '2px' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{skill.name}</span>
                            <span style={{ fontWeight: 700, color: skill.score >= 80 ? '#16a34a' : skill.score >= 60 ? '#d97706' : '#dc2626' }}>
                              {skill.score}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${skill.score}%`,
                                height: '100%',
                                background: skill.score >= 80 ? '#10b981' : skill.score >= 60 ? '#008299' : '#f59e0b',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Diagnostic Recommendation Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '20px' }}>🤖</span>
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>Nhận xét & Khuyến nghị của AI Tutor</strong>
                    </div>
                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                      - <strong>Điểm mạnh:</strong> Khả năng phân tích độ phức tạp thời gian/không gian đạt <strong>92%</strong>;
                      Thao tác với mảng động và con trỏ đạt <strong>88%</strong>.
                    </p>
                    <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, marginTop: '8px' }}>
                      - <strong>Điểm cần cải thiện:</strong> Thao tác đảo ngược danh sách liên kết đơn và xử lý con trỏ biên
                      (Edge Cases: nullptr) đạt <strong>64%</strong>. Khuyến nghị làm lại 2 bài tập rèn luyện trong Buổi 3.
                    </p>
                    <button
                      className="bkel-btn-sm"
                      style={{ marginTop: '14px', width: '100%' }}
                      onClick={() => setQuizModalOpen(true)}
                    >
                      Làm bài tập rèn luyện tăng cường (Remedial Quiz)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =====================================================================
          4. STUDENT PIN ENTRY MODAL (Điểm danh Buổi 3)
          ===================================================================== */}
      {pinModalOpen && (
        <div className="bkel-modal-backdrop" onClick={() => setPinModalOpen(false)}>
          <div className="bkel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="bkel-modal-header">
              <span>🎯 Điểm danh Buổi 3: Singly Linked List</span>
              <button
                onClick={() => setPinModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div className="bkel-modal-body">
              <p style={{ fontSize: '13.5px', color: '#495057', marginBottom: '16px' }}>
                Vui lòng nhập <strong>mã PIN 4 chữ số</strong> hiển thị trên màn hình máy chiếu tại phòng B4-302 (Cơ sở 1 Lý Thường Kiệt) để xác nhận có mặt:
              </p>

              <form onSubmit={handleStudentCheckin}>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <input
                    type="text"
                    maxLength={4}
                    value={studentPinInput}
                    onChange={(e) => setStudentPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    style={{
                      fontSize: '36px',
                      letterSpacing: '12px',
                      textAlign: 'center',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '2px solid #008299',
                      width: '200px',
                      fontFamily: 'monospace',
                      outline: 'none',
                    }}
                    autoFocus
                  />
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
                    (Gợi ý mã PIN đang phát hành: <strong>{pinCode}</strong> • Hết hạn sau {formatTimer(pinSecondsLeft)})
                  </div>
                </div>

                {pinFeedback && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      marginBottom: '14px',
                      background: pinFeedback.success ? '#dcfce7' : '#fee2e2',
                      color: pinFeedback.success ? '#15803d' : '#b91c1c',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {pinFeedback.message}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="bkel-btn-outline" onClick={() => setPinModalOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="bkel-btn-sm" style={{ padding: '8px 20px', fontSize: '13px' }}>
                    Xác nhận điểm danh
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. INTERACTIVE QUIZ MODAL
          ===================================================================== */}
      {quizModalOpen && (
        <div className="bkel-modal-backdrop" onClick={() => setQuizModalOpen(false)}>
          <div
            className="bkel-modal-card"
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bkel-modal-header">
              <span>📝 Trắc nghiệm Tương tác Buổi 3: Danh sách liên kết đơn</span>
              <button
                onClick={() => setQuizModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div className="bkel-modal-body">
              {SESSION_QUIZ_QUESTIONS.map((q, qIndex) => {
                const userChoice = selectedAnswers[qIndex];
                return (
                  <div
                    key={q.id}
                    style={{
                      marginBottom: '20px',
                      padding: '16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                        Câu {qIndex + 1}: {q.questionText}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          height: 'fit-content',
                        }}
                      >
                        {q.skillTag}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {q.options.map((opt, optIndex) => {
                        const isSelected = userChoice === optIndex;
                        const isCorrect = q.correctIndex === optIndex;
                        let btnStyle = {
                          textAlign: 'left',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#fff',
                          fontSize: '13px',
                          cursor: quizSubmitted ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        };

                        if (isSelected && !quizSubmitted) {
                          btnStyle.border = '2px solid #008299';
                          btnStyle.background = '#e6f6f8';
                        }
                        if (quizSubmitted) {
                          if (isCorrect) {
                            btnStyle.border = '2px solid #16a34a';
                            btnStyle.background = '#dcfce7';
                            btnStyle.color = '#15803d';
                          } else if (isSelected && !isCorrect) {
                            btnStyle.border = '2px solid #dc2626';
                            btnStyle.background = '#fee2e2';
                            btnStyle.color = '#b91c1c';
                          }
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            style={btnStyle}
                            onClick={() => handleSelectQuizAnswer(qIndex, optIndex)}
                          >
                            <span style={{ fontWeight: 700, width: '20px' }}>
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '10px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          background: '#f1f5f9',
                          borderLeft: '4px solid #0284c7',
                        }}
                      >
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {quizScore && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534' }}>
                    Kết quả của bạn: {quizScore.correct}/{quizScore.total} câu đúng ({quizScore.percentage}%)
                  </div>
                  <div style={{ fontSize: '13px', color: '#15803d', marginTop: '4px' }}>
                    Hệ thống AI đã cập nhật độ thành thạo kỹ năng Singly Linked List vào Bản đồ Năng lực.
                  </div>
                </div>
              )}
            </div>

            <div className="bkel-modal-footer">
              {!quizSubmitted ? (
                <button
                  type="button"
                  className="bkel-btn-sm"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < SESSION_QUIZ_QUESTIONS.length}
                  style={
                    Object.keys(selectedAnswers).length < SESSION_QUIZ_QUESTIONS.length
                      ? { opacity: 0.6, cursor: 'not-allowed' }
                      : {}
                  }
                >
                  Nộp bài kiểm tra ({Object.keys(selectedAnswers).length}/{SESSION_QUIZ_QUESTIONS.length})
                </button>
              ) : (
                <button type="button" className="bkel-btn-outline" onClick={resetQuiz}>
                  Làm lại bài kiểm tra
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. REAL BKEL TECHNICIAN FOOTER
          ===================================================================== */}
      <footer className="bkel-footer">
        <div className="bkel-footer-inner">
          <div className="bkel-footer-title">Tổ kỹ thuật / Technician</div>
          <p>
            Email: <a href="mailto:ddtnu@hcmut.edu.vn">ddtnu@hcmut.edu.vn</a>
          </p>
          <p>
            Quý Thầy/Cô chưa có tài khoản (hoặc quên mật khẩu) nhà trường vui lòng liên hệ Trung tâm Dữ liệu & Công nghệ
            Thông tin, nhà A5 - phòng 107 để được hỗ trợ.
          </p>
          <p style={{ color: '#868e96', fontSize: '12px' }}>
            (For HCMUT account, please contact to : Data and Information Technology Center)
            <br />
            Email: <a href="mailto:cti-cnit@hcmut.edu.vn">cti-cnit@hcmut.edu.vn</a> | ĐT (Tel.) : (84-8) 38647256 - 7200
          </p>

          <div className="bkel-footer-bottom">
            Copyright 2007-2026 BKEL - Phát triển dựa trên Moodle • Trường Đại học Bách Khoa - ĐHQG-HCM
          </div>
        </div>
      </footer>

      {/* Floating Moodle Help Button '?' */}
      <div
        className="bkel-floating-help"
        title="Trợ giúp & Hỗ trợ kỹ thuật"
        onClick={() => alert('Trung tâm Trợ giúp BKeL: Liên hệ phòng A5-107 hoặc email ddtnu@hcmut.edu.vn')}
      >
        ?
      </div>
    </div>
  );
}
