'use client';

import { useState } from 'react';
import Icon from './Icon';

const FEATURES = [
  { icon: 'key', text: 'Điểm danh bằng mã PIN động, chống gian lận' },
  { icon: 'brain', text: 'Knowledge Tracing theo dõi năng lực theo thời gian thực' },
  { icon: 'target', text: 'Lộ trình học thích ứng và bài tập rèn luyện cá nhân hóa' },
];

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const u = username.toLowerCase();
    const role = u.includes('gv') || u.includes('admin') ? 'instructor' : 'student';
    window.setTimeout(() => onLogin(role), 650);
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
              <label htmlFor="u">Tên đăng nhập / MSSV</label>
              <div className="input-wrap">
                <span className="lead"><Icon name="user" size={18} /></span>
                <input
                  id="u" className="input has-lead" placeholder="Ví dụ: 2110001 hoặc gv_nguyenvana"
                  value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required
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

            <div className="auth-row">
              <label className="check"><input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</a>
            </div>

            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? <><span className="spinner" /> Đang xác thực…</> : <>Đăng nhập <Icon name="arrow-right" size={18} /></>}
            </button>
          </form>

          <div className="auth-divider">hoặc vào nhanh bằng tài khoản mẫu</div>

          <div className="role-grid">
            <button type="button" className="role-card" onClick={() => onLogin('student')}>
              <i><Icon name="grades" size={20} /></i>
              <div><b>Sinh viên</b><span>Nguyễn Văn B • 2110001</span></div>
            </button>
            <button type="button" className="role-card" onClick={() => onLogin('instructor')}>
              <i><Icon name="users" size={20} /></i>
              <div><b>Giảng viên</b><span>TS. Nguyễn Văn A</span></div>
            </button>
          </div>

          <p className="auth-legal">
            Cần hỗ trợ tài khoản? <a href="mailto:cti-cnit@hcmut.edu.vn">cti-cnit@hcmut.edu.vn</a>
          </p>
        </div>
      </main>
    </div>
  );
}
