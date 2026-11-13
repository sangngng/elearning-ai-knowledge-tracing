# THIẾT KẾ HỆ THỐNG E-LEARNING CÓ TÍCH HỢP AI (KNOWLEDGE TRACING)

> **Mã đề tài:** HK261-DAGD1-480  
> **Học phần:** Đồ án Chuyên ngành (ĐACN) ➡️ Đồ án Tốt nghiệp (ĐATN)  
> **GVHD:** TS. Nguyễn Quốc Minh (Bộ môn Trí tuệ Nhân tạo - Khoa KH&KT Máy tính, ĐH Bách Khoa ĐHQG-HCM)  
> **Sinh viên thực hiện:**
> 1. Nguyễn Ngọc Sáng (2353046)
> 2. Nguyễn Hữu Hào (2352296)
> 3. Phạm Quang Tuấn (2353275)

---

## 1. Cấu trúc Thư mục Dự án

```text
elearning-ai-knowledge-tracing/
├── backend/                  # REST API (Node.js, Express, TypeScript)
│   ├── src/                  #   app, routes, middleware, config
│   ├── db/                   #   schema.sql và schema.dbml (nguồn duy nhất của CSDL)
│   └── .env.example
├── frontend/                 # Cổng BKeL (Next.js 14)
│   ├── app/                  #   trang, components, dữ liệu
│   └── public/
├── ai_service/               # Dịch vụ AI (tạm dừng, chỉ có baseline BKT)
├── docs/
│   ├── requirements/         # Đặc tả use case
│   ├── architecture/         # Kiến trúc và pipeline tổng thể
│   ├── database/             # Từ điển dữ liệu
│   ├── diagrams/             # Sơ đồ use case, kiến trúc, hoạt động, ERD
│   └── data/                 # Dữ liệu môn CO2003 (15 buổi, 40 câu hỏi, 11 kỹ năng)
├── report/                   # Mã nguồn LaTeX của báo cáo (main.tex, content/, images/)
├── management/               # Lộ trình, bảng công việc, nhật ký họp với GVHD
├── docker-compose.yml
└── README.md
```

Quy ước: mỗi loại tài liệu chỉ có một bản. Lược đồ CSDL nằm ở `backend/db/`, sơ đồ nằm ở `docs/diagrams/`.

---

## 2. Hướng dẫn Chạy Thử nghiệm Từng Thành phần

### 2.1. Kiểm tra Dữ liệu & Chạy Thuật toán AI Baseline
```bash
# 1. Chạy thống kê dữ liệu benchmark ASSISTments:
python ai_service/datasets/inspect_dataset.py

# 2. Chạy thuật toán mô hình cơ sở BKT:
python ai_service/models/bkt_baseline.py
```

### 2.2. Khởi động Web Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# Truy cập giao diện tại: http://localhost:3000
```

### 2.3. Khởi động Backend API (Node.js)
```bash
cd backend
npm install
npm start
# API chạy tại: http://localhost:5000
```

### 2.4. Khởi chạy Toàn bộ Hệ thống bằng Docker Compose
```bash
docker compose up -d
# PostgreSQL: port 5432
# Backend API: port 5000
# AI Service: port 8000
# Web Frontend: port 3000
```

### 2.3. Biên dịch báo cáo
```bash
cd report
pdflatex main.tex && pdflatex main.tex
```

### 2.4. Quản lý tiến độ
Xem `management/ROADMAP.md` (lộ trình), `management/TASKS.md` (phân công) và `management/MEETINGS.md` (nhật ký họp).
