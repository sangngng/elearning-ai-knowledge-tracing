# AI Knowledge Tracing Service

Microservice cung cấp các thuật toán **Knowledge Tracing (BKT & DKT)** để ước lượng độ thành thạo kỹ năng của người học.

## 1. Cấu trúc thư mục
- `datasets/`: Chứa file dữ liệu benchmark ASSISTments và script phân tích cấu trúc `inspect_dataset.py`.
- `models/`: Chứa thuật toán mô hình cơ sở `bkt_baseline.py` và mô hình học sâu DKT (PyTorch).
- `api/`: FastAPI server cung cấp REST API (`POST /predict-mastery`).

## 2. Cách chạy kiểm thử nhanh
1. Chạy thống kê dữ liệu:
   ```bash
   python datasets/inspect_dataset.py
   ```
2. Chạy thuật toán mô hình cơ sở BKT:
   ```bash
   python models/bkt_baseline.py
   ```
3. Khởi động API Server:
   ```bash
   uvicorn api.main:app --reload --port 8000
   ```
