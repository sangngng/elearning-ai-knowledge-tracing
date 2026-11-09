'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { Avatar, Cover, useClickAway } from './ui';

const NAV = [
  { id: 'home', label: 'Trang chủ', icon: 'home' },
  { id: 'dashboard', label: 'Bảng điều khiển', icon: 'layout' },
  { id: 'my-courses', label: 'Khóa học của tôi', icon: 'book', count: 4 },
];

const NOTIFS = [
  { icon: 'key', tone: 'tone-ok', title: 'Phiên điểm danh Buổi 3 đang mở', meta: 'CO2003 • Phòng B4-302 • vừa xong' },
  { icon: 'quiz', tone: 'tone-info', title: 'Quiz Buổi 3 hết hạn lúc 23:59 hôm nay', meta: 'CO2003 • 3 câu hỏi' },
];

export default function Shell({ app, children }) {
  const { user, view, setView, openCourse, theme, toggleTheme, logout, search, setSearch } = app;
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
    crumbs.push({ label: 'Khóa học của tôi', to: 'my-courses' }, { label: 'HK261' }, { label: 'CO2003 - CC01' });
  }

  const isInstructor = user.role === 'instructor';

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
              {n.count ? <em className="count" style={{ fontStyle: 'normal' }}>{n.count}</em> : null}
            </button>
          ))}
        </nav>

        <div className="sb-section">Lớp đang học</div>
        <button className={`sb-course ${view === 'course' ? 'active' : ''}`} onClick={() => { openCourse('sessions'); setDrawer(false); }} title="CO2003 - Cấu trúc Dữ liệu và Giải thuật">
          <div className="thumb"><Cover tone="cyan" pattern="triangles" /></div>
          <div>
            <b>CO2003 • CC01</b>
            <span>Cấu trúc Dữ liệu & Giải thuật</span>
          </div>
        </button>

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
                <span className="dot">{NOTIFS.length}</span>
              </button>
              {menu === 'notif' && (
                <div className="popover" role="menu">
                  <div className="pop-head"><b>Thông báo</b><span>{NOTIFS.length} mục cần chú ý</span></div>
                  {NOTIFS.map((n) => (
                    <div className="notif" key={n.title}>
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
                  <small>{isInstructor ? 'Giảng viên' : 'Sinh viên'}</small>
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
