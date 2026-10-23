'use client';
import { useState } from 'react';
import Link from 'next/link';
const COURSES = [
  { id: 1, name: 'Cấu trúc dữ liệu & Giải thuật', lessons: 12 },
  { id: 2, name: 'Cơ sở dữ liệu', lessons: 10 },
  { id: 3, name: 'Lập trình Web', lessons: 14 },
];
export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const login = () => {
    if (!email || !pw) return setErr('Vui lòng nhập email và mật khẩu.');
    setErr(''); setUser(email); // TODO: gọi API đăng nhập thật
  };
  if (!user) return (
    <div className="card" style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Đăng nhập</h2>
      <label>Email / Mã sinh viên</label>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <label>Mật khẩu</label>
      <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
      {err && <p style={{ color: '#d44' }}>{err}</p>}
      <button className="btn" onClick={login}>Đăng nhập</button>
    </div>
  );
  return (
    <>
      <h2>Xin chào, {user}</h2>
      {COURSES.map(c => (
        <div className="card" key={c.id}>
          <h3>{c.name}</h3>
          <p className="muted">{c.lessons} bài giảng</p>
          <Link className="btn" href="/lecture">Vào học</Link>
        </div>
      ))}
    </>
  );
}
