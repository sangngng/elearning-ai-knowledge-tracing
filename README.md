# Hệ thống E-Learning tích hợp AI (Knowledge Tracing)

Nền tảng quản lý học tập (LMS) theo phong cách BKeL của ĐH Bách Khoa - ĐHQG-HCM, dùng chung cho nhiều môn học: học kỳ, lớp môn học, thời khóa biểu, buổi học, điểm danh bằng mã PIN, ngân hàng câu hỏi gắn nhãn kỹ năng. Thuật toán Knowledge Tracing (BKT, DKT) là phần mở rộng nhỏ, làm sau khi hệ thống ổn định.

| | |
|---|---|
| Học phần | Specialized Project (CO4029), HK261 (2026-2027) |
| Mã đề tài | HK261-DAGD1-480 |
| GVHD | TS. Nguyễn Quốc Minh, Khoa KH&KT Máy tính |
| Nhóm | Nguyễn Ngọc Sáng (2353046), Nguyễn Hữu Hào (2352296), Phạm Quang Tuấn (2353275) |

## 1. Chạy nhanh (Windows)

Yêu cầu: **Docker Desktop** (chờ dòng "Engine running") và **Node.js LTS**.

1. Nhấp đúp `scripts\start-dev.bat`. File này bật PostgreSQL và Adminer, tạo `.env`, cài thư viện, mở backend và frontend, rồi mở trình duyệt.
2. Nhấp đúp `scripts\load-demo-data.bat` để nạp dữ liệu mẫu (chạy một lần vào database trống).
3. Xem database: `http://localhost:8081/?pgsql=postgres&username=postgres&db=elearning`, mật khẩu `postgres`.

| Cổng | Dịch vụ | Địa chỉ |
|---|---|---|
| 3000 | Frontend (Next.js) | http://localhost:3000 |
| 8080 | Backend API | http://localhost:8080/health |
| 8081 | Adminer (xem database) | đường dẫn ở bước 3 |
| 5432 | PostgreSQL 15 | `postgres` / `postgres` / `elearning` |
| 8000 | AI service (tùy chọn) | chỉ chạy khi bật profile `ai` |

Các file khác trong `scripts\`: `stop-dev.bat` (tắt, giữ dữ liệu), `reset-db.bat` (xóa sạch dữ liệu, hỏi xác nhận).

## 2. Chạy bằng lệnh (mọi hệ điều hành)

```bash
# Cơ sở dữ liệu + Adminer (tự áp dụng backend/db/schema.sql)
docker compose up -d

# Backend
cd backend
cp .env.example .env        # đặt JWT_SECRET là một chuỗi dài, ngẫu nhiên
npm ci
npm run dev                 # kiểm tra: npm run typecheck

# Frontend (cửa sổ khác)
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:8080
npm ci
npm run dev
```

Docker compose có ba nhóm dịch vụ:
- Mặc định: `postgres`, `adminer`.
- `--profile app`: backend và frontend dạng container (cần Dockerfile, nhiệm vụ S1-4).
- `--profile ai`: dịch vụ AI (chưa có Dockerfile; hiện chạy bằng `python ai_service/api/main.py`).

## 3. Tài khoản và dữ liệu mẫu

Môn đang triển khai đầu tiên là CO2003 (Cấu trúc dữ liệu và Giải thuật). Cơ sở dữ liệu đã hỗ trợ nhiều môn và nhiều lớp; giao diện hiện mới hiển thị CO2003 và mỗi lớp đang giới hạn 15 buổi. Sau `load-demo-data.bat` có 1 giảng viên, 8 sinh viên, lớp CC01 của CO2003 với 15 buổi, 11 kỹ năng, 40 câu hỏi. Mật khẩu mọi tài khoản mẫu: `Demo@2026`.

| Vai trò | Email |
|---|---|
| Giảng viên | a.nguyen@hcmut.edu.vn |
| Sinh viên | b.nguyen@hcmut.edu.vn (và c.tran, d.le, e.pham, f.hoang, g.vu, h.do, k.ngo cùng đuôi @hcmut.edu.vn) |

Đây là dữ liệu tạm. Script seed chính thức là nhiệm vụ S1-3. Giao diện web hiện vẫn dùng dữ liệu tĩnh; việc nối API là nhiệm vụ S1-1.

## 4. Kiến trúc và cấu trúc thư mục

Ba tầng: Frontend (Next.js 14) gọi Backend (Express, TypeScript) qua REST, Backend đọc ghi PostgreSQL. AI service (FastAPI) nối vào Backend ở giai đoạn sau.

```text
.
├── backend/          REST API
│   ├── src/          server.ts, app.ts, config/, middleware/, routes/ (auth, academic, quizzes)
│   └── db/           schema.sql (14 bảng, nguồn duy nhất), schema.dbml
├── frontend/         Cổng BKeL (Next.js 14, React)
├── ai_service/       Dịch vụ AI: baseline BKT, dữ liệu ASSISTments mẫu
├── docs/             requirements/, architecture/, database/, diagrams/, data/ (dữ liệu môn học)
├── report/           Mã nguồn LaTeX của báo cáo
├── management/       ROADMAP.md, TASKS.md, MEETINGS.md
├── scripts/          Các file .bat chạy nhanh trên Windows và dữ liệu mẫu
├── docker-compose.yml
└── CONTRIBUTING.md
```

Mỗi loại tài liệu chỉ có một bản: CSDL ở `backend/db/`, sơ đồ ở `docs/diagrams/`.

## 5. Tham khảo kỹ thuật

- Xác thực: JWT (hạn một ngày), gửi qua header `Authorization: Bearer <token>`. Đăng ký tạo tài khoản sinh viên.
- Điểm danh PIN: bốn chữ số ngẫu nhiên, hiệu lực 5 phút (giảng viên có thể chọn 1-15 phút qua `durationMinutes`); sinh viên nhập sai 5 lần trong 15 phút bị khóa (HTTP 429); mỗi sinh viên chỉ có một bản ghi điểm danh mỗi buổi.
- Sĩ số lớp: trigger PostgreSQL với khóa `FOR UPDATE`; vượt sĩ số trả lỗi `Class capacity has been reached`.
- Mã định danh phải là UUID hợp lệ (ký tự thứ 13 từ 1 đến 8, ký tự thứ 17 là 8, 9, a hoặc b). Khi viết seed, để PostgreSQL sinh bằng `gen_random_uuid()`.
- Danh sách endpoint và quy tắc: `backend/README.md`. Từ điển dữ liệu: `docs/database/DATABASE_DICTIONARY.md`.
- Biên dịch báo cáo: `cd report && pdflatex main.tex && pdflatex main.tex`.

## 6. Quy trình làm việc

Chi tiết trong `CONTRIBUTING.md`. Tóm tắt:

1. Lấy việc từ `management/TASKS.md`, tạo nhánh `feat/<mã-việc>-<chủ-đề>` từ `main`.
2. Làm nhỏ, commit rõ ràng (`feat`, `fix`, `docs`, `test`, `chore`), mở pull request, nhờ một người khác review.
3. Cập nhật cột trạng thái trong `TASKS.md` ngay trong pull request.
4. Báo tiến độ vào nhóm tối thứ Tư và thứ Sáu: đã xong, đang bị chặn, việc tiếp theo.

**Việc chỉ được coi là xong khi:** mã đã merge qua pull request; có test hoặc bản ghi test kèm bằng chứng; `docs/` hoặc `report/` đã cập nhật; không có bí mật, đường dẫn máy cá nhân hay emoji; typecheck (`npm run typecheck`) và build (`npm run build`) đạt.

Quy ước mã: TypeScript với kiểu rõ ràng và bắt lỗi chặt chẽ; thay đổi CSDL chỉ làm trong `schema.sql` và phải chạy lại được nhiều lần; biểu tượng dùng SVG; không đưa `.env` hay dữ liệu database vào Git.

## 7. Tiến độ

Lộ trình, mốc họp GVHD và cổng chất lượng: `management/ROADMAP.md`. Phân công theo tuần: `management/TASKS.md`. Nhật ký họp: `management/MEETINGS.md`. Họp GVHD vào Chủ nhật, hai tuần một lần (kế tiếp 22/11/2026).

## 8. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| Docker báo không kết nối được engine | Mở Docker Desktop, chờ "Engine running", chạy lại. |
| Lỗi `port is already allocated` (5432) | Máy đang có PostgreSQL khác dùng cổng này: tắt dịch vụ đó hoặc đổi cổng trong `docker-compose.yml`. |
| Adminer báo "Connection refused" | Ô System đang là MySQL: mở bằng đường dẫn ở mục 1, hoặc chọn PostgreSQL. |
| Backend báo `Missing required environment variable: JWT_SECRET` | Chưa tạo `backend/.env` hoặc chưa đặt `JWT_SECRET`. |
| `npm` bị chặn vì "running scripts is disabled" | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, hoặc dùng `npm.cmd`. |
| Nạp dữ liệu mẫu báo trùng khóa | Dữ liệu đã nạp: chạy `scripts\reset-db.bat` rồi nạp lại. |
| Cần database sạch | `docker compose down -v` rồi `docker compose up -d` (xóa toàn bộ dữ liệu). |
