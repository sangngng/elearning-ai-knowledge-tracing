'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { Avatar, Cover, useClickAway } from './ui';
import { coverFor } from './views';
import { dayName, fmtDate, hm, sessionWindow, splitCourseTitle } from '../lib/api';

const NAV = [
  { id: 'home', label: 'Trang chủ', icon: 'home' },
  { id: 'dashboard', label: 'Bảng điều khiển', icon: 'layout' },
  { id: 'my-courses', label: 'Khóa học của tôi', icon: 'book' },
];

/** Sessions starting within the next 48 hours, shown as reminders. */
function reminders(schedule) {
  const now = Date.now();
  return schedule
    .filter((s) => { const t = sessionWindow(s).start.getTime(); return t >= now - 3 * 3600e3 && t <= now + 48 * 3600e3; })
    .sort((a, b) => sessionWindow(a).start - sessionWindow(b).start)
    .map((s) => ({
      key: s.session_id,
      icon: 'calendar', tone: 'tone-info',
      title: `Buổi ${s.session_number}: ${s.session_title}`,
      meta: `${splitCourseTitle(s.course_title).code || s.class_code} • ${dayName(s.session_date)} ${fmtDate(s.session_date)} ${hm(s.start_time)} • Phòng ${s.room || s.default_room}`,
    }));
}

export default function Shell({ app, children }) {
  const { user, view, setView, openCourse, theme, toggleTheme, logout, search, setSearch, classes, schedule, activeClass } = app;
  const NOTIFS = reminders(schedule);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(null); // 'user' | 'notif' | null
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useClickAway(menuRef, () => setMenu(null), menu !== null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (id) => {
    setView(id);
    setDrawer(false);
    setMenu(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const crumbs = [{ label: 'Trang chủ', to: 'home' }];
  if (view === 'dashboard') crumbs.push({ label: 'Bảng điều khiển' });
  if (view === 'my-courses') crumbs.push({ label: 'Khóa học của tôi' });
  if (view === 'course') {
    crumbs.push({ label: 'Khóa học của tôi', to: 'my-courses' });
    if (activeClass) crumbs.push({ label: activeClass.semester_code }, { label: `${splitCourseTitle(activeClass.course_title).code || activeClass.course_title} - ${activeClass.class_code}` });
  }

  const isInstructor = user.role !== 'student';

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''} ${drawer ? 'drawer-open' : ''}`}>
      <div className="scrim" onClick={() => setDrawer(false)} />

      <aside className="sidebar" aria-label="Điều hướng chính">
        <div className="sb-brand">
          <img src="/bkel-logo.png" alt="" />
          <div className="name">BK-LMS<small>Bách Khoa • AI Learning</small></div>
        </div>

        <div className="sb-section">Điều hướng</div>
        <nav className="sb-nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`sb-link ${view === n.id || (n.id === 'my-courses' && view === 'course') ? 'active' : ''}`}
              onClick={() => go(n.id)}
              title={n.label}
              aria-current={view === n.id ? 'page' : undefined}
            >
              <Icon name={n.icon} size={20} />
              <span>{n.label}</span>
              {n.id === 'my-courses' && classes.length ? <em className="count" style={{ fontStyle: 'normal' }}>{classes.length}</em> : null}
            </button>
          ))}
        </nav>

        <div className="sb-section">{isInstructor ? 'Lớp giảng dạy' : 'Lớp đang học'}</div>
        {classes.map((c, i) => {
          const { code, name } = splitCourseTitle(c.course_title);
          const cover = coverFor(i);
          return (
            <button key={c.class_id} className={`sb-course ${view === 'course' && activeClass?.class_id === c.class_id ? 'active' : ''}`} onClick={() => { openCourse(c.class_id, 'sessions'); setDrawer(false); }} title={c.course_title}>
              <div className="thumb"><Cover tone={cover.tone} pattern={cover.pattern} /></div>
              <div>
                <b>{code || 'Lớp'} • {c.class_code}</b>
                <span>{name}</span>
              </div>
            </button>
          );
        })}

        <div className="sb-spacer" />

        <div className="sb-user">
          <Avatar name={user.name} size="sm" />
          <div style={{ minWidth: 0 }}>
            <b>{user.name}</b>
            <span>{user.title} • {user.code}</span>
          </div>
        </div>
      </aside>

      <div className="main-col">
        <header className={`topbar ${scrolled ? 'scrolled' : ''}`}>
          <button className="icon-btn mobile-only" onClick={() => setDrawer(true)} aria-label="Mở menu"><Icon name="menu" size={22} /></button>
          <button className="icon-btn desktop-only" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}>
            <Icon name="sidebar" size={20} />
          </button>

          <nav className="crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {i > 0 && <Icon name="chevron-right" size={14} className="sep" />}
                {c.to && i < crumbs.length - 1 ? (
                  <button onClick={() => go(c.to)}>{c.label}</button>
                ) : (
                  <span className={i === crumbs.length - 1 ? 'cur' : ''}>{c.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="top-spacer" />

          <div className="search">
            <span className="input-wrap">
              <span className="lead"><Icon name="search" size={17} /></span>
              <input
                ref={searchRef}
                className="input has-lead"
                placeholder="Tìm khóa học…"
                aria-label="Tìm khóa học"
                value={search}
                onChange={(e) => { setSearch(e.target.value); if (view !== 'my-courses') setView('my-courses'); }}
              />
            </span>
            <kbd>Ctrl K</kbd>
          </div>

          <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'} title="Đổi giao diện">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
          </button>

          <div ref={menuRef} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="pop-anchor">
              <button className="icon-btn" onClick={() => setMenu(menu === 'notif' ? null : 'notif')} aria-label="Thông báo" aria-expanded={menu === 'notif'}>
                <Icon name="bell" size={20} />
                {NOTIFS.length > 0 && <span className="dot">{NOTIFS.length}</span>}
              </button>
              {menu === 'notif' && (
                <div className="popover" role="menu">
                  <div className="pop-head"><b>Thông báo</b><span>{NOTIFS.length ? `${NOTIFS.length} buổi học trong 48 giờ tới` : 'Không có buổi học nào trong 48 giờ tới'}</span></div>
                  {NOTIFS.map((n) => (
                    <div className="notif" key={n.key}>
                      <i className={n.tone}><Icon name={n.icon} size={18} /></i>
                      <div><b>{n.title}</b><span>{n.meta}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pop-anchor">
              <button className="user-chip" onClick={() => setMenu(menu === 'user' ? null : 'user')} aria-expanded={menu === 'user'}>
                <Avatar name={user.name} size="sm" />
                <div style={{ textAlign: 'left' }}>
                  <b>{user.name}</b>
                  <small>{user.title}</small>
                </div>
                <Icon name="chevron-down" size={14} className="chev" />
              </button>
              {menu === 'user' && (
                <div className="popover" role="menu" style={{ width: 290 }}>
                  <div className="pop-head" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Avatar name={user.name} size="lg" />
                    <div style={{ minWidth: 0 }}>
                      <b>{user.name}</b>
                      <span>{user.title} • {user.code}</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="pop-sep" />
                  <button className="pop-item" onClick={() => { setMenu(null); app.toast('Hồ sơ cá nhân sẽ có ở phiên bản tiếp theo', 'info'); }}><Icon name="user" size={18} /> Hồ sơ cá nhân</button>
                  <button className="pop-item" onClick={() => { setMenu(null); app.toast('Bảng điểm sẽ có ở phiên bản tiếp theo', 'info'); }}><Icon name="grades" size={18} /> Bảng điểm học tập</button>
                  <button className="pop-item" onClick={() => { setMenu(null); app.toast('Tùy chọn tài khoản sẽ có ở phiên bản tiếp theo', 'info'); }}><Icon name="settings" size={18} /> Tùy chọn tài khoản</button>
                  <div className="pop-sep" />
                  <button className="pop-item danger" onClick={logout}><Icon name="logout" size={18} /> Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content" id="main">{children}</main>

        <footer className="footer">
          <div className="footer-inner">
            <span>© 2007-2026 BKEL • Trường Đại học Bách Khoa - ĐHQG-HCM</span>
            <span>
              Hỗ trợ kỹ thuật: <a href="mailto:ddtnu@hcmut.edu.vn">ddtnu@hcmut.edu.vn</a> • Nhà A5, phòng 107
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
