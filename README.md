# THIẾT KẾ HỆ THỐNG E-LEARNING CÓ TÍCH HỢP AI (KNOWLEDGE TRACING)

> **Mã đề tài:** HK261-DAGD1-480  
> **Học phần:** Đồ án Chuyên ngành (ĐACN) ➡️ Đồ án Tốt nghiệp (ĐATN)  
> **GVHD:** TS. Nguyễn Quốc Minh (Bộ môn Trí tuệ Nhân tạo - Khoa KH&KT Máy tính, ĐH Bách Khoa ĐHQG-HCM)  
> **Sinh viên thực hiện:**
> 1. Nguyễn Ngọc Sáng (2353046)
> 2. Nguyễn Hữu Hào (2352296)
> 3. Phạm Quang Tuấn (2353275)

---

## 1. Cấu trúc Thư mục Dự án Chuẩn mực (Monorepo)

```text
Elearning-AI/
├── docs/                                # Tài liệu phân tích và thiết kế hệ thống
│   ├── use-cases/                       # Bảng đặc tả Use Cases & Sơ đồ tương tác
│   │   ├── Use_Case_Specification_EN.docx
│   │   └── USE_CASES_SUMMARY.md
│   ├── database/                        # Thiết kế Cơ sở Dữ liệu quan hệ
│   │   ├── erd_elearning.png            # Ảnh sơ đồ quan hệ thực thể (ERD)
│   │   ├── schema.sql                   # Mã DDL PostgreSQL chuẩn hóa
│   │   ├── schema.dbml                  # Mã nguồn DBML
│   │   └── DATABASE_DICTIONARY.md       # Từ điển dữ liệu chi tiết các bảng
│   └── architecture/                    # Kiến trúc tổng thể & luồng dữ liệu
│       └── OVERALL_PIPELINE.md          # Sơ đồ Pipeline kết nối Web & AI
│
├── frontend/                            # Giao diện người dùng Web LMS (Next.js 14)
│   ├── app/
│   │   ├── page.jsx                     # Đăng nhập & Danh sách khóa học
│   │   ├── lecture/page.jsx             # Giao diện xem bài giảng
│   │   └── quiz/page.jsx                # Làm bài trắc nghiệm ghi nhận từng câu
│   ├── package.json
│   └── README.md
│
├── backend/                             # Dịch vụ Backend API (Node.js / Express)
│   ├── src/
│   │   └── server.js                    # API xác thực, khóa học và ghi nhận tương tác
│   ├── db/
│   │   └── schema.sql                   # Script khởi tạo CSDL
│   ├── .env.example
│   └── package.json
│
├── ai_service/                          # Dịch vụ AI & Theo dõi trạng thái kiến thức
│   ├── datasets/                        # Dữ liệu benchmark chuẩn quốc tế
│   │   ├── sample_assistments.csv       # Mẫu dữ liệu ASSISTments 2009-2010
│   │   └── inspect_dataset.py           # Script thống kê quy mô dữ liệu
│   ├── models/                          # Thuật toán AI
│   │   └── bkt_baseline.py              # Thuật toán Bayesian Knowledge Tracing cơ sở
│   ├── api/
│   │   └── main.py                      # FastAPI endpoint suy luận độ thành thạo kỹ năng
│   └── requirements.txt
│
├── docker-compose.yml                   # Khởi chạy toàn bộ hệ thống bằng 1 lệnh
├── .gitignore
└── README.md
```

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
