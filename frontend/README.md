# Frontend - Cổng BKeL (Next.js 14)

Giao diện LMS theo phong cách BKeL (Moodle 4.x). Mọi dữ liệu lấy từ backend qua REST API: đăng nhập, lớp của tôi, thời khóa biểu theo tiết, 15 buổi học và tài liệu, điểm danh bằng mã PIN, điểm danh thủ công, thống kê chuyên cần và quiz chấm trên máy chủ. Vai trò (giảng viên, sinh viên) lấy từ tài khoản, không chọn trên giao diện.

Chỉ bản đồ năng lực AI còn dùng dữ liệu minh họa (`app/data/skillMasterySample.js`) cho tới khi nối dịch vụ Knowledge Tracing.

| Màn hình | API |
|---|---|
| Đăng nhập, giữ đăng nhập khi tải lại | `POST /api/auth/login`, `GET /api/me` |
| Trang chủ, Bảng điều khiển, Khóa học của tôi | `GET /api/classes`, `GET /api/schedule` |
| Buổi học | `GET /api/classes/:id/sessions` |
| Thời khóa biểu (theo tiết, theo tuần) | `GET /api/schedule` (`period_start`, `period_end`) |
| Điểm danh của giảng viên | `GET /api/sessions/:id/attendance`, `POST .../attendance/open`, `POST .../attendance/close`, `PUT .../attendance/:userId` |
| Điểm danh của sinh viên | `POST /api/sessions/:id/attendance/check-in`, `GET /api/schedule` (`my_attendance`) |
| Thành viên, Thống kê | `GET /api/classes/:id/attendance/summary` |
| Bài kiểm tra | `GET /api/sessions/:id/quizzes`, `POST /api/quizzes/:id/submit` |

## Chạy cục bộ

Yêu cầu Node.js LTS và backend đang chạy với dữ liệu demo (`scripts\start-dev.bat`, `scripts\load-demo-data.bat`).

```bash
cd frontend
cp .env.example .env.local     # NEXT_PUBLIC_API_URL trỏ tới backend (mặc định http://localhost:8080)
npm ci
npm run dev                    # http://localhost:3000
```

Tài khoản demo (mật khẩu `Demo@2026`): giảng viên `a.nguyen@hcmut.edu.vn`, sinh viên `b.nguyen@hcmut.edu.vn` … `k.ngo@hcmut.edu.vn`. Trang đăng nhập có nút vào nhanh; tắt bằng `NEXT_PUBLIC_DEMO_ACCOUNTS=false`.

Nếu cổng 3000 đang bận: `npm run dev -- -p 3001` (thêm `http://localhost:3001` vào `CORS_ORIGIN` của backend).

## Kiểm tra giao diện

`npm run test:ui` chạy lại T13–T16 bằng Microsoft Edge và Playwright Core (đặt `CHROME_PATH` để dùng trình duyệt Chromium khác); kết quả và ảnh chụp được lưu trong `../docs/testing/`. Backend phải đang chạy với dữ liệu demo.

## Cấu trúc

```text
app/
  layout.jsx, page.jsx, globals.css
  components/   Auth, Shell, Course, views, Modals, ui, Icon
  lib/api.ts    client API có kiểu: token, lỗi, các endpoint và hàm ngày giờ
  data/         skillMasterySample.js (dữ liệu minh họa cho bản đồ năng lực)
public/         logo và banner
```

Quy ước: biểu tượng là SVG thuần (không dùng emoji); mã mới viết bằng TypeScript (`tsconfig.json` có `allowJs` để các component `.jsx` hiện có vẫn dùng được).

Token đăng nhập lưu trong `sessionStorage` (mất khi đóng tab) và hết hạn sau 1 ngày; khi API trả 401, giao diện quay về màn hình đăng nhập.
