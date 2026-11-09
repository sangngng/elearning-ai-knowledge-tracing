'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Auth from './components/Auth';
import Shell from './components/Shell';
import Course from './components/Course';
import { DashboardView, HomeView, MyCoursesView } from './components/views';
import { PinModal, QuizModal, Toasts } from './components/Modals';
import { ENROLLED_STUDENTS } from './data/dsaCourseData';

const USERS = {
  instructor: { role: 'instructor', name: 'TS. Nguyễn Văn A', code: 'CB001001', title: 'Giảng viên', email: 'a.nguyen@hcmut.edu.vn' },
  student: { role: 'student', name: 'Nguyễn Văn B', code: '2110001', title: 'Sinh viên', email: 'b.nguyen@hcmut.edu.vn' },
};

const PIN_TTL = 300; // 5 phút
const PIN_MAX_ATTEMPTS = 5;
const ME_ID = '2110001';

const randomPin = () => String(Math.floor(1000 + Math.random() * 9000));

export default function Portal() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home | dashboard | my-courses | course
  const [courseTab, setCourseTab] = useState('sessions');
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const [roster, setRoster] = useState(() =>
    ENROLLED_STUDENTS.map((s, idx) => ({
      ...s,
      session3Status: idx === 0 ? 'absent' : idx === 4 ? 'late' : idx === 6 ? 'excused' : 'present',
    }))
  );

  const [pin, setPin] = useState({ code: '8392', seconds: 285, active: true });
  const attempts = useRef(0);
  const [pinOpen, setPinOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  /* ---- theme ---- */
  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('bklms-theme', next); } catch { /* bỏ qua khi storage bị chặn */ }
      return next;
    });
  }, []);

  /* ---- toast ---- */
  const toast = useCallback((text, tone = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  /* ---- PIN countdown ---- */
  useEffect(() => {
    if (!pin.active || pin.seconds <= 0) return undefined;
    const id = window.setInterval(() => {
      setPin((p) => (p.seconds > 0 ? { ...p, seconds: p.seconds - 1 } : p));
    }, 1000);
    return () => window.clearInterval(id);
  }, [pin.active, pin.seconds > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePin = useCallback(() => {
    attempts.current = 0;
    setPin({ code: randomPin(), seconds: PIN_TTL, active: true });
    toast('Đã tạo mã PIN mới, hiệu lực 5 phút', 'ok');
  }, [toast]);

  const submitPin = useCallback(
    (code) => {
      if (attempts.current >= PIN_MAX_ATTEMPTS) {
        return { success: false, message: 'Bạn đã nhập sai quá 5 lần. Vui lòng liên hệ giảng viên để được mở lại.' };
      }
      if (!pin.active || pin.seconds <= 0) {
        return { success: false, message: 'Phiên điểm danh đã hết hạn.' };
      }
      if (code === pin.code) {
        setRoster((r) => r.map((s) => (s.studentId === ME_ID ? { ...s, session3Status: 'present' } : s)));
        return { success: true, message: 'Điểm danh Buổi 3 thành công. Trạng thái: Có mặt.' };
      }
      attempts.current += 1;
      const left = PIN_MAX_ATTEMPTS - attempts.current;
      return { success: false, message: left > 0 ? `Mã PIN không đúng. Bạn còn ${left} lần thử.` : 'Bạn đã nhập sai quá 5 lần. Vui lòng liên hệ giảng viên.' };
    },
    [pin]
  );

  const setStatus = useCallback(
    (studentId, status) => {
      setRoster((r) => r.map((s) => (s.studentId === studentId ? { ...s, session3Status: status } : s)));
    },
    []
  );

  const login = (role) => {
    setUser(USERS[role]);
    setView('home');
    setCourseTab('sessions');
  };
  const logout = () => {
    setUser(null);
    setView('home');
    setSearch('');
  };
  const openCourse = (tab = 'sessions') => {
    setCourseTab(tab);
    setView('course');
    window.scrollTo({ top: 0 });
  };

  if (!user) return <Auth onLogin={login} />;

  const app = {
    user, view, setView, courseTab, setCourseTab, openCourse, theme, toggleTheme, logout,
    search, setSearch, courseFilter, setCourseFilter, roster, pin, generatePin, submitPin, setStatus,
    setPinOpen, setQuizOpen, toast,
  };

  return (
    <>
      <Shell app={app}>
        {view === 'home' && <HomeView app={app} />}
        {view === 'dashboard' && <DashboardView app={app} />}
        {view === 'my-courses' && <MyCoursesView app={app} />}
        {view === 'course' && <Course app={app} />}
      </Shell>
      {pinOpen && <PinModal app={app} />}
      {quizOpen && <QuizModal app={app} />}
      <Toasts items={toasts} />
    </>
  );
}
