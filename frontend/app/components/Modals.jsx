'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useFocusTrapEscape, useLockBodyScroll } from './ui';
import { SESSION_QUIZ_QUESTIONS } from '../data/dsaCourseData';

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
export function PinModal({ app }) {
  const { setPinOpen, submitPin, pin } = app;
  const [digits, setDigits] = useState(['', '', '', '']);
  const [state, setState] = useState('idle'); // idle | err | ok
  const [msg, setMsg] = useState('');
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const setAt = (i, v) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (state === 'err') setState('idle');
    return next;
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
  const expired = !pin.active || pin.seconds <= 0;

  const submit = (e) => {
    e.preventDefault();
    if (code.length < 4) return;
    const res = submitPin(code);
    setMsg(res.message);
    if (res.success) {
      setState('ok');
      window.setTimeout(() => setPinOpen(false), 1200);
    } else {
      setState('err');
      setDigits(['', '', '', '']);
      window.setTimeout(() => refs.current[0]?.focus(), 30);
    }
  };

  return (
    <Frame onClose={() => setPinOpen(false)} title="Điểm danh Buổi 3" subtitle="CO2003 • Danh sách liên kết đơn • Phòng B4-302">
      <form onSubmit={submit}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div className="stat-ico tone-brand" style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 12px' }}><Icon name="key" size={26} /></div>
          <p className="muted">Nhập mã PIN 4 chữ số đang hiển thị trên màn hình của giảng viên.</p>
        </div>

        <div className={`otp ${state}`} onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i} ref={(el) => (refs.current[i] = el)} value={d} inputMode="numeric" maxLength={1}
              autoComplete="one-time-code" aria-label={`Chữ số ${i + 1}`} disabled={state === 'ok'}
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

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={code.length < 4 || state === 'ok'}>
          {state === 'ok' ? <><Icon name="check" size={18} stroke={2.6} /> Đã điểm danh</> : 'Xác nhận điểm danh'}
        </button>
        <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
          <Icon name="shield" size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> Tối đa 5 lần nhập sai. Mã được băm SHA-256 + salt khi lưu.
        </p>
      </form>
    </Frame>
  );
}

/* =============================================================== QUIZ MODAL */
const L = ['A', 'B', 'C', 'D'];

export function QuizModal({ app }) {
  const { setQuizOpen, toast } = app;
  const Q = SESSION_QUIZ_QUESTIONS;
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [checked, setChecked] = useState(false);
  const [log, setLog] = useState([]); // mỗi lượt trả lời gắn với kỹ năng, phục vụ Knowledge Tracing
  const finished = i >= Q.length;
  const q = Q[i];

  const check = () => {
    const correct = q.options[sel].id === q.correctAnswer;
    setLog((l) => [...l, { questionId: q.id, skill: q.skillCode, chosen: q.options[sel].id, correct, at: new Date().toISOString() }]);
    setChecked(true);
  };
  const next = () => { setI(i + 1); setSel(null); setChecked(false); };
  const reset = () => { setI(0); setSel(null); setChecked(false); setLog([]); };

  const score = log.filter((r) => r.correct).length;
  const pct = Math.round((score / Q.length) * 100);

  const state = (idx) => {
    if (!checked) return sel === idx ? 'sel' : '';
    if (q.options[idx].id === q.correctAnswer) return 'right';
    if (idx === sel) return 'wrong';
    return '';
  };

  return (
    <Frame
      wide onClose={() => setQuizOpen(false)} title="Quiz tương tác • Buổi 3"
      subtitle={finished ? 'Kết quả bài làm' : `Câu ${i + 1}/${Q.length} • Kỹ năng ${q.skillCode}`}
      footer={
        finished ? (
          <>
            <button className="btn" onClick={reset}><Icon name="refresh" size={16} /> Làm lại</button>
            <button className="btn btn-primary" onClick={() => { setQuizOpen(false); toast('Đã ghi nhận kết quả quiz vào bản đồ năng lực', 'ok'); }}>Hoàn tất</button>
          </>
        ) : (
          <>
            <span className="muted" style={{ fontSize: 12.5 }}>{checked ? (log[log.length - 1].correct ? 'Chính xác!' : 'Chưa chính xác') : 'Chọn một đáp án'}</span>
            {!checked ? (
              <button className="btn btn-primary" disabled={sel === null} onClick={check}>Kiểm tra</button>
            ) : (
              <button className="btn btn-primary" onClick={next}>{i === Q.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'} <Icon name="arrow-right" size={16} /></button>
            )}
          </>
        )
      }
    >
      <div className="q-step" aria-hidden="true">
        {Q.map((_, k) => {
          const r = log[k];
          return <i key={k} className={r ? (r.correct ? 'ok' : 'bad') : k === i ? 'on' : ''} />;
        })}
      </div>

      {finished ? (
        <div className="result">
          <div className={`stat-ico ${pct >= 70 ? 'tone-ok' : 'tone-warn'}`} style={{ width: 72, height: 72, borderRadius: 22 }}>
            <Icon name={pct >= 70 ? 'check-circle' : 'target'} size={34} />
          </div>
          <div className="score">{score}/{Q.length}</div>
          <p className="muted">{pct >= 70 ? 'Rất tốt! Bạn nắm vững phần Danh sách liên kết đơn.' : 'Bạn nên xem lại phần Danh sách liên kết đơn và làm bài rèn luyện.'}</p>
          <div className="callout info" style={{ textAlign: 'left', width: '100%' }}>
            <Icon name="brain" size={18} />
            <span>Kết quả đã được gửi đến mô hình Knowledge Tracing để cập nhật xác suất thành thạo kỹ năng <b className="mono">DSA-LINKEDLIST</b>.</span>
          </div>
        </div>
      ) : (
        <div className="question" key={q.id}>
          <div className="q-text"><small className="eyebrow">Câu hỏi {i + 1}</small>{q.prompt}</div>
          <div className="options" role="radiogroup">
            {q.options.map((o, k) => (
              <button key={o.id} role="radio" aria-checked={sel === k} className={`option ${state(k)}`} disabled={checked} onClick={() => setSel(k)}>
                <span className="key">{L[k]}</span>
                <span>{o.text}</span>
                {checked && state(k) === 'right' && <Icon name="check-circle" size={20} style={{ marginLeft: 'auto', color: 'var(--ok)' }} />}
                {checked && state(k) === 'wrong' && <Icon name="x" size={20} style={{ marginLeft: 'auto', color: 'var(--bad)' }} />}
              </button>
            ))}
          </div>
          {checked && (
            <div className="explain"><b>Giải thích: </b>{q.explanation}</div>
          )}
        </div>
      )}
    </Frame>
  );
}
