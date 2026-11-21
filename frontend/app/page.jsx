'use client';

import { useCallback, useEffect, useState } from 'react';
import Auth from './components/Auth';
import Shell from './components/Shell';
import Course from './components/Course';
import { DashboardView, HomeView, MyCoursesView } from './components/views';
import { PinModal, QuizModal, Toasts } from './components/Modals';
import { api, getToken, onUnauthorized, roleLabel, setToken } from './lib/api';

/** API user -> the fields the layout shows. */
function toViewUser(u) {
  return { ...u, title: roleLabel(u.role), code: String(u.email || '').split('@')[0] };
}

export default function Portal() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [activeClassId, setActiveClassId] = useState(null);

  const [view, setView] = useState('home'); // home | dashboard | my-courses | course
  const [courseTab, setCourseTab] = useState('sessions');
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const [pinSession, setPinSession] = useState(null); // session the student is checking in to
  const [quizSession, setQuizSession] = useState(null); // session whose quiz is open
  const [toasts, setToasts] = useState([]);

  /* ---- theme ---- */
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('bklms-theme', next); } catch { /* storage blocked */ }
      return next;
    });
  }, []);

  /* ---- toast ---- */
  const toast = useCallback((text, tone = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  /* ---- data shared by every page ---- */
  const loadAcademic = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([api.classes(), api.schedule()]);
      setClasses(c.classes);
      setSchedule(s.sessions);
      setLoadError('');
      setActiveClassId((cur) => (cur && c.classes.some((x) => x.class_id === cur) ? cur : c.classes[0]?.class_id ?? null));
    } catch (error) {
      setLoadError(error.message);
    }
  }, []);
  const refreshSchedule = useCallback(async () => {
    try { setSchedule((await api.schedule()).sessions); } catch { /* keep the last schedule */ }
  }, []);

  const resetSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setClasses([]);
    setSchedule([]);
    setActiveClassId(null);
    setView('home');
    setSearch('');
    setPinSession(null);
    setQuizSession(null);
  }, []);

  /* ---- restore a login after reload; drop it when the token expires ---- */
  useEffect(() => {
    onUnauthorized(() => {
      resetSession();
      toast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'bad');
    });
    if (!getToken()) { setBooting(false); return; }
    api.me()
      .then(async ({ user: u }) => { setUser(toViewUser(u)); await loadAcademic(); })
      .catch(() => setToken(null))
      .finally(() => setBooting(false));
  }, [loadAcademic, resetSession, toast]);

  const login = async (email, password) => {
    const { user: u, token } = await api.login(email, password);
    setToken(token);
    setUser(toViewUser(u));
    setView('home');
    setCourseTab('sessions');
    await loadAcademic();
  };
  const logout = () => resetSession();

  const openCourse = (classId, tab = 'sessions') => {
    if (classId) setActiveClassId(classId);
    setCourseTab(tab);
    setView('course');
    window.scrollTo({ top: 0 });
  };

  if (booting) {
    return <div className="boot"><span className="spinner" /> Đang tải…</div>;
  }
  if (!user) return <Auth onLogin={login} />;

  const activeClass = classes.find((c) => c.class_id === activeClassId) || null;
  const app = {
    user, view, setView, courseTab, setCourseTab, openCourse, theme, toggleTheme, logout,
    search, setSearch, courseFilter, setCourseFilter, toast,
    classes, schedule, activeClass, loadError, reload: loadAcademic, refreshSchedule,
    openPin: setPinSession, openQuiz: setQuizSession,
  };

  return (
    <>
      <Shell app={app}>
        {loadError && (
          <div className="callout bad" role="alert" style={{ marginBottom: 16 }}>
            <span>{loadError}</span>
            <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={loadAcademic}>Thử lại</button>
          </div>
        )}
        {view === 'home' && <HomeView app={app} />}
        {view === 'dashboard' && <DashboardView app={app} />}
        {view === 'my-courses' && <MyCoursesView app={app} />}
        {view === 'course' && activeClass && <Course key={activeClass.class_id} app={app} cls={activeClass} />}
      </Shell>
      {pinSession && <PinModal app={app} session={pinSession} onClose={() => setPinSession(null)} />}
      {quizSession && <QuizModal app={app} session={quizSession} onClose={() => setQuizSession(null)} />}
      <Toasts items={toasts} />
    </>
  );
}
