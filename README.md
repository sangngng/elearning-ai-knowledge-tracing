# Thiết kế Hệ thống E-Learning có tích hợp AI (Knowledge Tracing)

> **Mã đề tài:** HK261-DAGD1-480  
> **Học phần:** Specialized Project (CO4029), học kỳ HK261 (2026-2027)  
> **GVHD:** TS. Nguyễn Quốc Minh, Khoa Khoa học và Kỹ thuật Máy tính, ĐH Bách Khoa - ĐHQG-HCM  
> **Sinh viên:** Nguyễn Ngọc Sáng (2353046), Nguyễn Hữu Hào (2352296), Phạm Quang Tuấn (2353275)

Định hướng của GVHD: AI là phần nhỏ, ưu tiên hoàn thiện hệ thống E-Learning trước. Chi tiết xem `management/ROADMAP.md`.

## 1. Cấu trúc thư mục

```text
.
├── backend/        REST API (Node.js, Express, TypeScript)
│   ├── src/        server.ts, app.ts, config/, middleware/, routes/
│   └── db/         schema.sql, schema.dbml (nguồn duy nhất của CSDL)
├── frontend/       Cổng BKeL (Next.js 14)
├── ai_service/     Dịch vụ AI (giai đoạn nghiên cứu, hiện có baseline BKT)
├── docs/
│   ├── requirements/   đặc tả use case
│   ├── architecture/   kiến trúc và pipeline
│   ├── database/       từ điển dữ liệu
│   ├── diagrams/       use case, kiến trúc, hoạt động, ERD
│   └── data/           dữ liệu CO2003 (15 buổi, 40 câu hỏi, 11 kỹ năng)
├── report/         mã nguồn LaTeX của báo cáo
├── management/     lộ trình, bảng công việc, nhật ký họp
├── CONTRIBUTING.md quy trình làm việc nhóm
└── docker-compose.yml
```

Quy ước: mỗi loại tài liệu chỉ có một bản. Lược đồ CSDL ở `backend/db/`, sơ đồ ở `docs/diagrams/`.

## 2. Chạy hệ thống

Yêu cầu: Node.js LTS, Docker (hoặc PostgreSQL 15 cài sẵn).

```bash
# 1. Cơ sở dữ liệu (tự áp dụng backend/db/schema.sql) và trang xem CSDL
docker compose up -d
#    Xem CSDL: mở http://localhost:8081/?pgsql=postgres&username=postgres&db=elearning
#    rồi nhập Password: postgres  (đường dẫn này đã chọn sẵn PostgreSQL; nếu mở
#    http://localhost:8081 trực tiếp, nhớ đổi ô System từ MySQL sang PostgreSQL)

# 2. Backend: http://localhost:8080
cd backend
cp .env.example .env            # đặt JWT_SECRET và DATABASE_URL
npm ci && npm run dev

# 3. Frontend: http://localhost:3000
cd ../frontend
cp .env.example .env.local
npm ci && npm run dev
```

Kiểm tra: `curl http://localhost:8080/health` trả về `{"status":"ok"}`; `cd backend && npm run typecheck`.

Chạy trọn bộ bằng container (sau khi có Dockerfile, nhiệm vụ S1-4): `docker compose --profile app up -d --build   # đặt JWT_SECRET trong biến môi trường nếu dùng ngoài máy cá nhân`.

## 3. Dịch vụ AI (giai đoạn nghiên cứu)

```bash
python ai_service/datasets/inspect_dataset.py   # thống kê dữ liệu ASSISTments mẫu
python ai_service/models/bkt_baseline.py        # baseline BKT
```

## 4. Biên dịch báo cáo

```bash
cd report
pdflatex main.tex && pdflatex main.tex
```

## 5. Quản lý tiến độ

`management/ROADMAP.md` (lộ trình và tiêu chí), `management/TASKS.md` (phân công), `management/MEETINGS.md` (nhật ký họp). Quy trình nhánh, pull request và review: `CONTRIBUTING.md`.
