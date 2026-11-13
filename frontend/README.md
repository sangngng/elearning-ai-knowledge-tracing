# Frontend - Cổng BKeL (Next.js 14)

Giao diện LMS theo phong cách BKeL (Moodle 4.x): đăng nhập tách vai trò giảng viên / sinh viên, danh sách khóa học, không gian môn học CO2003 gồm 15 buổi học, thời khóa biểu, điểm danh bằng mã PIN và thống kê.

> Trạng thái: giao diện đang dùng dữ liệu tĩnh trong `app/data/dsaCourseData.js`. Việc nối với backend là nhiệm vụ S1-1 và S1-2 trong `management/TASKS.md`.

## Chạy cục bộ

Yêu cầu Node.js LTS.

```bash
cd frontend
cp .env.example .env.local     # NEXT_PUBLIC_API_URL trỏ tới backend (mặc định http://localhost:8080)
npm ci
npm run dev                    # http://localhost:3000
```

Nếu cổng 3000 đang bận: `npm run dev -- -p 3001` (thêm `http://localhost:3001` vào `CORS_ORIGIN` của backend).

## Cấu trúc

```text
app/
  layout.jsx, page.jsx, globals.css
  components/   Auth, Shell, Course, views, Modals, ui, Icon
  data/         dsaCourseData.js (dữ liệu tĩnh, sẽ thay bằng lời gọi API)
public/         logo và banner
```

Quy ước: biểu tượng là SVG thuần (không dùng emoji); mã mới viết bằng TypeScript.
