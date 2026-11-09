// Bộ icon SVG nét liền (stroke 1.8), không dùng emoji.
const PATHS = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>,
  layout: <><rect x="3" y="3" width="7.5" height="9" rx="2" /><rect x="13.5" y="3" width="7.5" height="5" rx="2" /><rect x="13.5" y="11" width="7.5" height="10" rx="2" /><rect x="3" y="15" width="7.5" height="6" rx="2" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>,
  calendar: <><rect x="3" y="4.5" width="18" height="16.5" rx="3" /><path d="M3 10h18M8 2.5v4M16 2.5v4" /></>,
  users: <><path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" /><circle cx="9.5" cy="7.5" r="3.5" /><path d="M21 20v-1.5a4 4 0 0 0-3-3.87M15.5 4.13a3.5 3.5 0 0 1 0 6.74" /></>,
  user: <><circle cx="12" cy="7.5" r="4" /><path d="M20 21v-1.5a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5V21" /></>,
  chart: <><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7.5" y="11" width="3" height="6" rx="1" /><rect x="13" y="7" width="3" height="10" rx="1" /></>,
  brain: <><path d="M9.5 3A3.5 3.5 0 0 0 6 6.5a3 3 0 0 0-2 5 3.2 3.2 0 0 0 1.5 5.4A3.5 3.5 0 0 0 9 20.5a2.5 2.5 0 0 0 3-2.4V5.4A2.4 2.4 0 0 0 9.5 3z" /><path d="M14.5 3A3.5 3.5 0 0 1 18 6.5a3 3 0 0 1 2 5 3.2 3.2 0 0 1-1.5 5.4A3.5 3.5 0 0 1 15 20.5a2.5 2.5 0 0 1-3-2.4" /></>,
  check: <path d="M20 6.5 9.5 17 4 11.5" />,
  'check-circle': <><circle cx="12" cy="12" r="9.5" /><path d="m8 12.3 2.8 2.8L16.3 9.5" /></>,
  clock: <><circle cx="12" cy="12" r="9.5" /><path d="M12 7v5.2l3.3 2" /></>,
  pin: <><path d="M12 21.5s7-5.7 7-11.5a7 7 0 1 0-14 0c0 5.8 7 11.5 7 11.5z" /><circle cx="12" cy="10" r="2.6" /></>,
  bell: <><path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  chat: <path d="M21 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-5 4V5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4.2-4.2" /></>,
  logout: <><path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  grades: <><path d="M12 3 2 8l10 5 10-5z" /><path d="M6 10.5v5.2c0 1.2 2.7 2.8 6 2.8s6-1.6 6-2.8v-5.2" /><path d="M22 8v6" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  quiz: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M9 9.2a3 3 0 1 1 4.3 2.7c-.8.4-1.3 1-1.3 1.8M12 17h.01" /></>,
  code: <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></>,
  forum: <path d="M17 11.5a5.5 5.5 0 0 1-5.5 5.5H8l-4 3.5v-12A5.5 5.5 0 0 1 9.5 3h2A5.5 5.5 0 0 1 17 8.5z" />,
  folder: <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2.5h6.5A2.5 2.5 0 0 1 21 10v8.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5z" />,
  download: <><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" /><path d="M4 17v1.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V17" /></>,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  'chevron-down': <path d="m5 9 7 7 7-7" />,
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  refresh: <><path d="M20 11a8 8 0 0 0-14.3-4.4L4 8.5" /><path d="M4 4v4.5h4.5" /><path d="M4 13a8 8 0 0 0 14.3 4.4L20 15.5" /><path d="M20 20v-4.5h-4.5" /></>,
  sparkles: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8zM5 2.5l.6 1.6 1.6.6-1.6.6L5 7l-.6-1.7-1.6-.6 1.6-.6z" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  sidebar: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" /></>,
  moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2z" />,
  shield: <><path d="M12 3 4.5 6v5.5c0 4.7 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.8 7.5-9.5V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10.5" rx="3" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  'eye-off': <><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6A17 17 0 0 0 2 12s3.6 7 10 7c1.6 0 3-.4 4.3-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  trend: <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  'trend-down': <><path d="m3 7 6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
  target: <><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="5.5" /><circle cx="12" cy="12" r="1.5" /></>,
  dots: <><circle cx="12" cy="5" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="12" cy="19" r="1.3" /></>,
  info: <><circle cx="12" cy="12" r="9.5" /><path d="M12 11v5.5M12 7.8h.01" /></>,
  alert: <><path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9.5v4.2M12 17h.01" /></>,
  help: <><circle cx="12" cy="12" r="9.5" /><path d="M9.2 9.2a2.9 2.9 0 1 1 4.2 2.6c-.9.5-1.4 1.1-1.4 2M12 17.2h.01" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
  rss: <><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5.5" cy="18.5" r="1.3" /></>,
  link: <><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" /></>,
  key: <><circle cx="8" cy="15" r="4.5" /><path d="m11.2 11.8 8.3-8.3M16.5 6.5l3 3M14 9l2.5 2.5" /></>,
  zap: <path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z" />,
  layers: <><path d="m12 3 9.5 5-9.5 5L2.5 8z" /><path d="m2.5 12.5 9.5 5 9.5-5M2.5 16.5l9.5 5 9.5-5" /></>,
};

export default function Icon({ name, size = 18, stroke = 1.8, className = '', style }) {
  const shape = PATHS[name];
  if (!shape) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
}
