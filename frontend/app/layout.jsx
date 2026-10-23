import './globals.css';
import Link from 'next/link';
export const metadata = { title: 'LMS Thích ứng' };
export default function RootLayout({ children }) {
  return (
    <html lang="vi"><body>
      <div className="nav"><b>LMS Thích ứng</b>
        <Link href="/">Khóa học</Link><Link href="/lecture">Bài giảng</Link><Link href="/quiz">Trắc nghiệm</Link>
      </div>
      <div className="wrap">{children}</div>
    </body></html>
  );
}
