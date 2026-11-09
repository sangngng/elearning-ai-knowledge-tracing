'use client';

import { useEffect, useId, useRef, useState } from 'react';

/* ------------------------------------------------------------------ Avatar */
const AVATAR_TONES = ['', 't1', 't2', 't3', 't4'];
export function initials(name = '') {
  const parts = name.replace(/^(TS\.|ThS\.|PGS\.|GS\.)\s*/i, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}
export function Avatar({ name, size = '', tone }) {
  const t = tone ?? AVATAR_TONES[(name?.length ?? 0) % AVATAR_TONES.length];
  return <div className={`avatar ${size} ${t}`}>{initials(name)}</div>;
}

/* ------------------------------------------------------------- Count-up */
export function CountUp({ value, decimals = 0, duration = 900 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{v.toFixed(decimals)}</>;
}

/* ------------------------------------------------------------ Progress */
export function Progress({ value, tone = '' }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress ${tone}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ----------------------------------------------------------- Progress ring */
export function Ring({ value, size = 84, stroke = 8, track = 'rgba(255,255,255,.22)', color = '#fff', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOff(c * (1 - value / 100)));
    return () => cancelAnimationFrame(id);
  }, [value, c]);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Donut */
export function Donut({ segments, size = 148, stroke = 20, center }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${Math.max(0, len - 3)} ${c}`} strokeDashoffset={-acc} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray .8s cubic-bezier(.22,1,.36,1)' }}
            />
          );
          acc += len;
          return s.value > 0 ? el : null;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{center}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ Radar */
export function RadarChart({ data, size = 360 }) {
  const gid = useId().replace(/:/g, '');
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 62;
  const PAD = 120; // chừa chỗ cho nhãn kỹ năng hai bên
  const n = data.length;
  const ang = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, ratio) => [cx + Math.cos(ang(i)) * R * ratio, cy + Math.sin(ang(i)) * R * ratio];
  const poly = (ratio) => data.map((_, i) => pt(i, ratio).join(',')).join(' ');
  const shape = data.map((d, i) => pt(i, d.mastery / 100).join(',')).join(' ');
  return (
    <svg viewBox={`${-PAD} 0 ${size + PAD * 2} ${size}`} role="img" aria-label="Biểu đồ radar mức độ thành thạo kỹ năng">
      <defs>
        <linearGradient id={`g${gid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#26a6b9" stopOpacity=".55" />
          <stop offset="100%" stopColor="#6d5efc" stopOpacity=".4" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={poly(r)} fill={r === 1 ? 'var(--surface-2)' : 'none'} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray={r === 1 ? '0' : '3 4'} />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" />;
      })}
      <polygon className="radar-area" points={shape} fill={`url(#g${gid})`} stroke="var(--primary)" strokeWidth="2.2" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.mastery / 100);
        const [lx, ly] = pt(i, 1.14);
        const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
        const weak = d.mastery < 70;
        return (
          <g key={d.code}>
            <circle cx={x} cy={y} r="5" fill="var(--surface)" stroke={weak ? 'var(--warn)' : 'var(--primary)'} strokeWidth="2.5" />
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize="15" fontWeight="600" fill="var(--text-2)">
              {d.skill.length > 26 ? d.skill.slice(0, 25) + '…' : d.skill}
            </text>
            <text x={lx} y={ly + 19} textAnchor={anchor} dominantBaseline="middle" fontSize="14.5" fontWeight="700" fill={weak ? 'var(--warn)' : 'var(--primary)'}>
              {d.mastery}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------ Course cover */
const TONES = {
  teal: ['#005a6e', '#26a6b9'],
  cyan: ['#006b7f', '#48cae4'],
  purple: ['#4b3fd1', '#9a8fff'],
  indigo: ['#1d4ed8', '#60a5fa'],
};
export function Cover({ tone = 'teal', pattern = 'circles' }) {
  const id = useId().replace(/:/g, '');
  const [a, b] = TONES[tone] ?? TONES.teal;
  const tile = {
    circles: <><circle cx="14" cy="14" r="9" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" /><circle cx="14" cy="14" r="3" fill="#fff" fillOpacity=".25" /></>,
    hexagons: <path d="M14 3l9 5.2v10.4L14 24l-9-5.4V8.2z" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />,
    triangles: <path d="M14 4l10 18H4z" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />,
    diamonds: <path d="M14 3l11 11-11 11L3 14z" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />,
  }[pattern];
  return (
    <div className="cover">
      <svg viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`c${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </linearGradient>
          <pattern id={`p${id}`} width="28" height="28" patternUnits="userSpaceOnUse">{tile}</pattern>
          <radialGradient id={`r${id}`} cx="85%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity=".38" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="280" height="140" fill={`url(#c${id})`} />
        <rect width="280" height="140" fill={`url(#p${id})`} />
        <rect width="280" height="140" fill={`url(#r${id})`} />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------- Click-away */
export function useClickAway(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    const onKey = (e) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [ref, handler, active]);
}

/* -------------------------------------------------------------- Modal frame */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
}

export function useFocusTrapEscape(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return ref;
}
