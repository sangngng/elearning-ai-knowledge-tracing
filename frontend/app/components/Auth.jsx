'use client';

import { useState } from 'react';
import Icon from './Icon';

const FEATURES = [
  { icon: 'key', text: 'Điểm danh bằng mã PIN động, chống gian lận' },
  { icon: 'brain', text: 'Knowledge Tracing theo dõi năng lực theo thời gian thực' },
  { icon: 'target', text: 'Lộ trình học thích ứng và bài tập rèn luyện cá nhân hóa' },
];

// Accounts created by the demo seed (scripts/demo_seed_CO2003.sql or `npm run seed`).
// Hide the shortcuts in a real deployment with NEXT_PUBLIC_DEMO_ACCOUNTS=false.
const DEMO_PASSWORD = 'Demo@2026';
const DEMO_ACCOUNTS = process.env.NEXT_PUBLIC_DEMO_ACCOUNTS === 'false' ? [] : [
  { email: 'b.nguyen@hcmut.edu.vn', role: 'Sinh viên', name: 'Nguyen Van B', icon: 'grades' },
  { email: 'a.nguyen@hcmut.edu.vn', role: 'Giảng viên', name: 'Nguyen Van A', icon: 'users' },
];

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signIn = async (e, p) => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await onLogin(e.trim(), p);
    } catch (err) {
      setError(err.status === 401 ? 'Email hoặc mật khẩu không đúng.' : err.message);
      setLoading(false);
    }
  };
  const submit = (e) => {
    e.preventDefault();
    signIn(email, password);
  };

  return (
    <div className="auth">
      <aside className="auth-hero">
        <div className="auth-brand">
          <img src="/bkel-logo.png" alt="Logo Trường Đại học Bách Khoa" />
          <div>
            <b>TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐHQG-HCM</b>
            <span>Khoa Khoa học và Kỹ thuật Máy tính</span>
          </div>
        </div>

        <div className="auth-pitch">
          <span className="badge" style={{ background: 'rgba(255,255,255,.16)', color: '#fff', marginBottom: 18 }}>
            <Icon name="sparkles" size={14} /> Tích hợp AI Knowledge Tracing
          </span>
          <h1>
            Học tập thông minh,<br />
            <em>đo được từng kỹ năng.</em>
          </h1>
          <p>Nền tảng LMS chuẩn đại học kết hợp mô hình BKT và DKT để hiểu bạn đang vững ở đâu và cần ôn gì tiếp theo.</p>
          <ul className="auth-features">
            {FEATURES.map((f) => (
              <li key={f.icon}>
                <i><Icon name={f.icon} size={18} /></i>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-float" aria-hidden="true">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600 }}>
            <Icon name="brain" size={16} /> Năng lực của bạn
          </div>
          {[['Mảng & Con trỏ', 92], ['Danh sách liên kết', 78], ['Cây nhị phân', 64]].map(([n, v]) => (
            <div key={n}>
              <div className="row"><span>{n}</span><b>{v}%</b></div>
              <div className="bar"><i style={{ width: `${v}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="auth-foot">Đồ án chuyên ngành CO4029 • HK261 • Mã đề tài HK261-DAGD1-480</div>
      </aside>

      <main className="auth-panel">
        <div className="auth-form">
          <h2>Đăng nhập</h2>
          <p>Dùng tài khoản HCMUT để truy cập BK-LMS.</p>

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="u">Email HCMUT</label>
              <div className="input-wrap">
                <span className="lead"><Icon name="user" size={18} /></span>
                <input
                  id="u" className="input has-lead" type="email" placeholder="ten.ho@hcmut.edu.vn"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="p">Mật khẩu</label>
              <div className="input-wrap">
                <span className="lead"><Icon name="lock" size={18} /></span>
                <input
                  id="p" className="input has-lead has-trail" type={show ? 'text' : 'password'} placeholder="Nhập mật khẩu"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
                />
                <button type="button" className="icon-btn trail" style={{ width: 34, height: 34 }} onClick={() => setShow((s) => !s)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                  <Icon name={show ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div className="callout bad" role="alert" style={{ marginBottom: 14 }}>
                <Icon name="alert" size={18} /> <span>{error}</span>
              </div>
            )}

            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Đang xác thực…</> : <>Đăng nhập <Icon name="arrow-right" size={18} /></>}
            </button>
          </form>

          {DEMO_ACCOUNTS.length > 0 && (
            <>
              <div className="auth-divider">hoặc vào nhanh bằng tài khoản demo</div>
              <div className="role-grid">
                {DEMO_ACCOUNTS.map((a) => (
                  <button key={a.email} type="button" className="role-card" disabled={loading} onClick={() => signIn(a.email, DEMO_PASSWORD)}>
                    <i><Icon name={a.icon} size={20} /></i>
                    <div><b>{a.role}</b><span>{a.name} • {a.email}</span></div>
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="auth-legal">
            Cần hỗ trợ tài khoản? <a href="mailto:cti-cnit@hcmut.edu.vn">cti-cnit@hcmut.edu.vn</a>
          </p>
        </div>
      </main>
    </div>
  );
}
