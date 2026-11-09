import { Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-mono-var',
});

export const metadata = {
  title: 'BK-LMS AI | Hệ thống E-Learning thích ứng • ĐH Bách Khoa TP.HCM',
  description: 'Hệ thống Quản lý Học tập tích hợp AI Knowledge Tracing - Khoa KH&KT Máy tính, ĐH Bách Khoa ĐHQG-HCM',
  icons: { icon: '/bkel-logo.png' },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#008299' },
    { media: '(prefers-color-scheme: dark)', color: '#0a1220' },
  ],
};

// Áp dụng theme trước khi hydrate để tránh nhấp nháy sáng/tối.
const themeInit = `(function(){try{var t=localStorage.getItem('bklms-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
