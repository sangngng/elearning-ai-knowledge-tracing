import './globals.css';

export const metadata = {
  title: 'BK-LMS AI | Hệ thống E-Learning Thích ứng • ĐH Bách Khoa TP.HCM',
  description: 'Hệ thống Quản lý Học tập E-Learning tích hợp AI - Khoa KH&KT Máy tính HCMUT',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="https://lms.hcmut.edu.vn/pluginfile.php/3/core_admin/favicon/64x64/1775124670/logoBK.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
