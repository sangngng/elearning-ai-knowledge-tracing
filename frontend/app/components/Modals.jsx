'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useFocusTrapEscape, useLockBodyScroll } from './ui';
import { api, fmtDate, hm } from '../lib/api';

/* ================================================================== TOASTS */
export function Toasts({ items }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          <i><Icon name={t.tone === 'ok' ? 'check' : t.tone === 'bad' ? 'alert' : 'info'} size={16} stroke={2.4} /></i>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

function Frame({ onClose, wide, title, subtitle, children, footer }) {
  useLockBodyScroll(true);
  useFocusTrapEscape(onClose);
  return (
    <div className="backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Đóng"><Icon name="x" size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ================================================================ PIN MODAL */
const fmtClock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function PinModal({ app, session, onClose }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [state, setState] = useState('idle'); // idle | busy | err | ok | locked
  const [msg, setMsg] = useState('');
  const [now, setNow] = useState(Date.now());
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const left = session.attendance_expires_at ? Math.max(0, Math.round((new Date(session.attendance_expires_at).getTime() - now) / 1000)) : 0;
  const expired = left <= 0;

  const setAt = (i, v) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (state === 'err') setState('idle');
  };
  const onChange = (i, e) => {
    const v = e.target.value.replace(/\D/g, '').slice(-1);
    setAt(i, v);
    if (v && i < 3) refs.current[i + 1]?.focus();
  };
  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 3) refs.current[i + 1]?.focus();
  };
  const onPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!text) return;
    e.preventDefault();
    const next = ['', '', '', ''];
    text.split('').forEach((c, i) => (next[i] = c));
    setDigits(next);
    refs.current[Math.min(text.length, 3)]?.focus();
  };

  const code = digits.join('');
  const finish = async (message) => {
    setState('ok');
    setMsg(message);
    await app.refreshSchedule();
    window.setTimeout(onClose, 1300);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (code.length < 4 || state === 'busy') return;
    setState('busy');
    try {
      const res = await api.checkIn(session.id, code);
      await finish(res.alreadyCheckedIn ? 'Bạn đã điểm danh buổi này trước đó.' : `Điểm danh Buổi ${session.session_number} thành công. Trạng thái: Có mặt.`);
    } catch (err) {
      setDigits(['', '', '', '']);
      if (err.status === 429 || (err.status === 401 && err.data?.attemptsLeft === 0)) {
        setState('locked');
        setMsg('Bạn đã nhập sai 2 lần. Hãy báo giảng viên để được điểm danh thủ công.');
      } else if (err.status === 401) {
        setState('err');
        setMsg(`Mã PIN không đúng. Bạn còn ${err.data?.attemptsLeft ?? 1} lần thử.`);
      } else if (err.status === 410) {
        setState('locked');
        setMsg('Phiên điểm danh đã đóng hoặc hết hạn.');
      } else {
        setState('err');
        setMsg(err.message);
      }
      window.setTimeout(() => refs.current[0]?.focus(), 30);
    }
  };

  const disabled = state === 'ok' || state === 'locked' || state === 'busy';
  return (
    <Frame onClose={onClose} title={`Điểm danh Buổi ${session.session_number}`} subtitle={`${session.title} • ${fmtDate(session.session_date)} ${hm(session.start_time)} • Phòng ${session.room || ''}`}>
      <form onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div className="stat-ico tone-brand" style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 12px' }}><Icon name="key" size={26} /></div>
          <p className="muted">Nhập mã PIN 4 chữ số đang hiển thị trên màn hình của giảng viên.</p>
          {!expired && state !== 'ok' && <p style={{ marginTop: 6, fontWeight: 700 }}>Còn {fmtClock(left)}</p>}
        </div>

        <div className={`otp ${state === 'locked' ? 'err' : state}`} onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i} ref={(el) => (refs.current[i] = el)} value={d} inputMode="numeric" maxLength={1}
              autoComplete="one-time-code" aria-label={`Chữ số ${i + 1}`} disabled={disabled}
              onChange={(e) => onChange(i, e)} onKeyDown={(e) => onKeyDown(i, e)}
            />
          ))}
        </div>

        {msg && (
          <div className={`callout ${state === 'ok' ? 'ok' : 'bad'}`} role="alert" style={{ marginBottom: 16 }}>
            <Icon name={state === 'ok' ? 'check-circle' : 'alert'} size={18} /> <span>{msg}</span>
          </div>
        )}
        {!msg && expired && (
          <div className="callout bad" style={{ marginBottom: 16 }}><Icon name="alert" size={18} /> Phiên điểm danh đã hết hạn. Hãy nhờ giảng viên mở phiên mới.</div>
        )}

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={code.length < 4 || disabled || expired}>
          {state === 'ok' ? <><Icon name="check" size={18} stroke={2.6} /> Đã điểm danh</> : state === 'busy' ? <><span className="spinner" /> Đang gửi…</> : 'Xác nhận điểm danh'}
        </button>
        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
          <Icon name="shield" size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Bạn có 2 lần nhập. Sai cả 2 lần thì báo giảng viên để được điểm danh thủ công.
        </p>
      </form>
    </Frame>
  );
}

/* =============================================================== QUIZ MODAL */
const L = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Students answer one question at a time; each answer is graded on the server and stored as one
 * quiz_interactions row. The answer key never reaches the browser, so feedback is right or wrong
 * only. Lecturers get a read-only preview so their clicks do not enter the learning data.
 */
export function QuizModal({ app, session, onClose }) {
  const preview = app.user.role !== 'student';
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]); // { questionId, correct }

  const load = useCallback(async () => {
    try {
      const { quizzes } = await api.quizzes(session.id);
      const q = quizzes.find((x) => x.questions.length) || null;
      setQuiz(q);
      setError(q ? '' : 'Buổi này chưa có quiz.');
    } catch (err) { setError(err.message); }
  }, [session.id]);
  useEffect(() => { load(); }, [load]);

  const Q = quiz?.questions || [];
  const finished = quiz && i >= Q.length;
  const q = Q[i];
  const answered = log.find((r) => r.questionId === q?.id);

  const check = async () => {
    if (preview) { setLog((l) => [...l, { questionId: q.id, correct: null }]); return; }
    setBusy(true);
    try {
      const res = await api.submitQuiz(quiz.quizId, [{ questionId: q.id, answer: q.options[sel].id }]);
      setLog((l) => [...l, { questionId: q.id, correct: res.results[0].isCorrect }]);
    } catch (err) { app.toast(err.message, 'bad'); } finally { setBusy(false); }
  };
  const next = () => { setI(i + 1); setSel(null); };
  const reset = () => { setI(0); setSel(null); setLog([]); };

  const score = log.filter((r) => r.correct).length;
  const pct = Q.length ? Math.round((score / Q.length) * 100) : 0;
  const optState = (idx) => {
    if (!answered) return sel === idx ? 'sel' : '';
    if (idx !== sel || answered.correct === null) return '';
    return answered.correct ? 'right' : 'wrong';
  };

  const title = quiz ? `${quiz.quizTitle} • Buổi ${session.session_number}` : `Quiz Buổi ${session.session_number}`;
  return (
    <Frame
      wide onClose={onClose} title={title}
      subtitle={!quiz ? session.title : finished ? 'Kết quả bài làm' : `Câu ${i + 1}/${Q.length} • Kỹ năng ${q.skillCode}${preview ? ' • Xem trước (không ghi kết quả)' : ''}`}
      footer={!quiz ? null : finished ? (
        <>
          <button className="btn" onClick={reset}><Icon name="refresh" size={16} /> Làm lại</button>
          <button className="btn btn-primary" onClick={onClose}>Hoàn tất</button>
        </>
      ) : (
        <>
          <span className="muted" style={{ fontSize: 12.5 }}>{answered ? (answered.correct === null ? 'Chế độ xem trước' : answered.correct ? 'Chính xác!' : 'Chưa chính xác') : 'Chọn một đáp án'}</span>
          {!answered ? (
            <button className="btn btn-primary" disabled={sel === null || busy} onClick={check}>{busy ? <><span className="spinner" /> Đang chấm…</> : preview ? 'Tiếp' : 'Kiểm tra'}</button>
          ) : (
            <button className="btn btn-primary" onClick={next}>{i === Q.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'} <Icon name="arrow-right" size={16} /></button>
          )}
        </>
      )}
    >
      {error && <div className="callout info"><Icon name="info" size={18} /> <span>{error}</span></div>}
      {!error && !quiz && <p className="muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="spinner" /> Đang tải quiz…</p>}
      {quiz && (
        <>
          <div className="q-step" aria-hidden="true">
            {Q.map((x, k) => {
              const r = log.find((y) => y.questionId === x.id);
              return <i key={x.id} className={r ? (r.correct === false ? 'bad' : 'ok') : k === i ? 'on' : ''} />;
            })}
          </div>

          {finished ? (
            <div className="result">
              <div className={`stat-ico ${pct >= 70 || preview ? 'tone-ok' : 'tone-warn'}`} style={{ width: 72, height: 72, borderRadius: 22 }}>
                <Icon name={pct >= 70 || preview ? 'check-circle' : 'target'} size={34} />
              </div>
              {preview ? <p className="muted">Đã xem hết {Q.length} câu. Kết quả không được ghi.</p> : (
                <>
                  <div className="score">{score}/{Q.length}</div>
                  <p className="muted">{pct >= 70 ? 'Rất tốt! Bạn nắm vững phần kiến thức này.' : 'Bạn nên xem lại tài liệu buổi học và làm lại bài.'}</p>
                  <div className="callout info" style={{ textAlign: 'left', width: '100%' }}>
                    <Icon name="brain" size={18} />
                    <span>Mỗi câu trả lời đã được lưu kèm kỹ năng ({[...new Set(Q.map((x) => x.skillCode))].join(', ')}) để mô hình Knowledge Tracing ước lượng mức thành thạo.</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="question" key={q.id}>
              <div className="q-text"><small className="eyebrow">Câu hỏi {i + 1}</small>{q.prompt}</div>
              <div className="options" role="radiogroup">
                {q.options.map((o, k) => (
                  <button key={o.id} role="radio" aria-checked={sel === k} className={`option ${optState(k)}`} disabled={Boolean(answered) || busy} onClick={() => setSel(k)}>
                    <span className="key">{L[k] || o.id}</span>
                    <span>{o.text}</span>
                    {optState(k) === 'right' && <Icon name="check-circle" size={20} style={{ marginLeft: 'auto', color: 'var(--ok)' }} />}
                    {optState(k) === 'wrong' && <Icon name="x" size={20} style={{ marginLeft: 'auto', color: 'var(--bad)' }} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Frame>
  );
}
