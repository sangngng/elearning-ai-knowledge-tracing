# TỔNG QUAN VÀ TRẠNG THÁI DỰ ÁN (PROJECT MASTER STATE)
> **Dự án:** Thiết kế hệ thống E-Learning có tích hợp AI (Đồ án Chuyên ngành CO3047 - HK261)  
> **Mã đề tài:** `HK261-DAGD1-480`  
> **Đơn vị:** Khoa Khoa học và Kỹ thuật Máy tính - Trường Đại học Bách Khoa, ĐHQG-HCM  
> **Giảng viên hướng dẫn:** TS. Nguyễn Quốc Minh  
> **Kho lưu trữ GitHub:** [https://github.com/sangngng/elearning-ai-knowledge-tracing.git](https://github.com/sangngng/elearning-ai-knowledge-tracing.git)  
> **File này được cập nhật tự động:** Ngày 28/10/2026 (Sau Meeting 3)

---

## 👥 1. THÀNH VIÊN NHÓM & VAI TRÒ CHUYÊN MÔN
| Thành viên | MSSV | Vai trò chính | Lĩnh vực phụ trách |
| :--- | :---: | :--- | :--- |
| **Nguyễn Ngọc Sáng** | **`2353046`** | Fullstack & AI Integration Lead | Thiết kế kiến trúc tổng thể, Giao diện Next.js 14, Tích hợp API, Cổng kết nối AI |
| **Nguyễn Hữu Hào** | **`2352296`** | Backend & Database Lead | Thiết kế CSDL PostgreSQL (ERD & 3NF), Xây dựng Express.js REST API, Docker |
| **Phạm Quang Tuấn** | **`2353275`** | Requirements & Domain Lead | Phân tích yêu cầu, Đặc tả Use Case Tables, Biên soạn nội dung dữ liệu môn học mẫu |

---

## 📅 2. TIẾN TRÌNH CÁC BUỔI GẶP GVHD (MEETINGS TIMELINE)

| Buổi | Ngày họp | Trọng tâm báo cáo | Kết quả / Đánh giá của GVHD |
| :---: | :---: | :--- | :--- |
| **Buổi 1** | 27/09/2026 | Đề cương sơ bộ, phân chia sơ bộ nhiệm vụ | Đã thông qua hướng nghiên cứu tổng quát. |
| **Buổi 2** | 11/10/2026 | Khảo sát tổng quan Knowledge Tracing (BKT vs DKT), bộ dữ liệu ASSISTments | Thầy đồng ý hướng tiếp cận song song BKT (baseline) & DKT (deep learning). |
| **Buổi 3** | **25/10/2026** | Báo cáo kiến trúc hệ thống, 4 Use Cases cốt lõi, ERD CSDL PostgreSQL v1, Prototype | **ĐÃ HỌP XONG.** Thầy đánh giá: Thiết kế ban đầu còn quá đơn giản (giống web trắc nghiệm/video hơn là LMS đại học).<br>👉 **Yêu cầu mở rộng:** Điểm danh theo môn học, Tạo buổi học (Sessions), Thời khóa biểu (Timetable), Thống kê số lượng người học. Trước mắt tập trung làm thật đầy đủ chức năng cho 1 môn học cụ thể. |
| **Buổi 4** | **08/11/2026** | Báo cáo ERD v2 mở rộng, Demo môn học mẫu (DSA) với đầy đủ Buổi học, Điểm danh, Thống kê | ⏳ **MỤC TIÊU SPRINT HIỆN TẠI (28/10 - 08/11/2026)** |
| **Buổi 5** | 22/11/2026 | Demo kết nối luồng AI Knowledge Tracing thời gian thực | ⏳ Lộ trình kế tiếp |
| **Buổi 6-7** | 12/2026 | Hoàn thiện toàn bộ các tính năng, viết dự thảo cuốn báo cáo chính thức | ⏳ Lộ trình kế tiếp |
| **Buổi 8** | 31/12/2026 | **BẢO VỆ ĐỒ ÁN CHUYÊN NGÀNH** | 🎓 Đích đến |

---

## 🎯 3. PHÂN TÍCH FEEDBACK THẦY NGUYỄN QUỐC MINH (MEETING 3 - 25/10/2026)

### 3.1. Điểm Thầy đánh giá "Còn đơn giản":
* ERD v1 chỉ gồm các bảng cơ bản: `users`, `courses`, `lessons`, `quizzes`, `skills`, `questions`, `quiz_interactions`.
* Mô hình này giống một trang web bán khóa học xem video online hoặc web trắc nghiệm thông thường, **chưa thể hiện được bản chất của một Hệ thống Quản lý Học tập (LMS) cho trường Đại học**.

### 3.2. Bổ sung bắt buộc cần làm ngay:
1. **Quản lý Lớp môn học & Buổi học (Class & Course Sessions):**
   - 1 môn học có thể mở theo lớp (Class Section: CC01, L01...) theo học kỳ (HK261).
   - Mỗi lớp môn học gồm nhiều Buổi học cụ thể (Sessions: Buổi 1, Buổi 2,... Buổi 15).
2. **Thời khóa biểu (Timetable / Schedule):**
   - Lịch học từng buổi: Ngày học, Tiết học (Tiết 3-5), Phòng học (H6-302 / Online Meet), Giảng viên phụ trách.
3. **Điểm danh theo buổi học (Attendance Management):**
   - Cơ chế điểm danh sinh viên: Có mặt (Present), Vắng (Absent), Đi trễ (Late), Có phép (Excused).
   - Hỗ trợ Giảng viên mở mã PIN / QR để sinh viên tự check-in trên web hoặc Giảng viên tick thủ công.
4. **Thống kê số lượng người học (Enrollment & Class Analytics):**
   - Thống kê sĩ số lớp đã đăng ký (`enrollments`).
   - Tỷ lệ sinh viên đi học theo từng buổi, danh sách sinh viên vắng nhiều.
5. **Tập trung làm trọn vẹn 1 môn học mẫu (Pilot Course):**
   - Lựa chọn môn: **"Cấu trúc Dữ liệu và Giải thuật" (Data Structures and Algorithms - DSA, Mã môn: CO2003)**.
   - Lý do: Môn cơ sở ngành cốt lõi của CSE Bách Khoa, có 15 buổi học rõ ràng, cây kỹ năng kiến thức (Knowledge Components) phong phú, cực kỳ thuận lợi cho cả tính năng LMS lẫn mô hình AI Knowledge Tracing.

---

## 🗄️ 4. NÂNG CẤP KIẾN TRÚC CƠ SỞ DỮ LIỆU (POSTGRESQL ERD V2)

### Các thực thể mở rộng:
1. `semesters`: Quản lý các học kỳ (id, code: 'HK261', name: 'Học kỳ 1 năm học 2026-2027', start_date, end_date).
2. `courses`: Danh mục môn học lý thuyết (id, code: 'CO2003', title: 'Cấu trúc Dữ liệu và Giải thuật', credits: 4, description).
3. `course_classes`: Các lớp môn học thực tế được mở (id, course_id, semester_id, class_code: 'CC01', instructor_id, max_capacity, default_room).
4. `enrollments`: Danh sách sinh viên đăng ký lớp (id, class_id, user_id, status: 'enrolled'/'dropped', enrolled_at). *(Phục vụ thống kê sĩ số).*
5. `course_sessions`: Chi tiết các buổi học trong thời khóa biểu (id, class_id, session_number: 1..15, title, session_date, start_time, end_time, room, lesson_id). *(Phục vụ buổi học & thời khóa biểu).*
6. `attendance_records`: Kết quả điểm danh sinh viên từng buổi (id, session_id, user_id, status: 'present'/'absent'/'late'/'excused', checkin_time, method: 'pin'/'qr'/'manual', note). *(Phục vụ điểm danh).*
7. `lessons`, `quizzes`, `skills`, `questions`, `quiz_interactions`: Giữ nguyên và liên kết chặt chẽ với từng buổi học (`course_sessions`).

---

## 📋 5. PHÂN CHIA NHIỆM VỤ CHI TIẾT (SPRINT 28/10 - 08/11/2026)

### 👤 Phạm Quang Tuấn (Requirements & Content Lead)
* [ ] **Task T1:** Soạn thảo 3 bảng Use Case Specifications mới:
  - *UC5: Quản lý Buổi học & Thời khóa biểu (Manage Sessions & Timetable)*.
  - *UC6: Điểm danh buổi học (Take Attendance - PIN Code / QR Code / Manual)*.
  - *UC7: Thống kê sĩ số & Chuyên cần lớp học (View Enrollment & Attendance Analytics)*.
* [ ] **Task T2:** Xây dựng bộ dữ liệu mẫu môn Pilot **CO2003 - DSA**:
  - Soạn danh mục 15 buổi học chuẩn theo đề cương Bách Khoa.
  - Soạn ngân hàng 30-40 câu hỏi trắc nghiệm chia theo 5 kỹ năng chính (`DSA-ARRAY`, `DSA-LINKEDLIST`, `DSA-STACK-QUEUE`, `DSA-TREE`, `DSA-GRAPH`).

### 👤 Nguyễn Hữu Hào (Backend & Database Lead)
* [ ] **Task H1:** Cập nhật script `schema.sql` và migrate PostgreSQL:
  - Thêm các bảng: `semesters`, `course_classes`, `enrollments`, `course_sessions`, `attendance_records`.
  - Cập nhật sơ đồ `05_erd_database.png` và tài liệu `DATABASE_DICTIONARY.md`.
* [ ] **Task H2:** Xây dựng các RESTful API mới phía Express.js:
  - `GET /api/classes/:classId/timetable`: Lấy thời khóa biểu và danh sách các buổi học.
  - `POST /api/sessions`: Tạo/cập nhật thông tin buổi học (phòng, ngày, giờ).
  - `POST /api/sessions/:sessionId/attendance`: Giảng viên lưu điểm danh lớp.
  - `POST /api/attendance/check-in`: Sinh viên tự nhập mã PIN để điểm danh.
  - `GET /api/classes/:classId/stats`: Thống kê sĩ số đăng ký và tỷ lệ chuyên cần từng buổi.

### 👤 Nguyễn Ngọc Sáng (Fullstack & AI Lead)
* [ ] **Task S1:** Thiết kế và code giao diện Next.js 14 cho 3 phân hệ mới:
  - **Màn hình Thời khóa biểu (Timetable / Calendar View):** Xem lịch học theo tuần của môn DSA, trạng thái các buổi học (Đã diễn ra / Sắp tới).
  - **Màn hình Chi tiết Buổi học & Điểm danh (Session & Attendance View):** 
    - Giao diện Giảng viên: Bấm "Mở điểm danh" sinh mã PIN, danh sách sinh viên lớp có nút tích Có mặt/Vắng/Trễ.
    - Giao diện Sinh viên: Ô nhập mã PIN để check-in tức thì.
  - **Màn hình Thống kê lớp học (Course Analytics Dashboard):** Biểu đồ cột tỷ lệ đi học qua các buổi, tổng số học viên đăng ký, danh sách sinh viên vắng nhiều.
* [ ] **Task S2:** Tích hợp gọi API từ Frontend sang Backend Express của Hào.
* [ ] **Task S3:** Quản lý Git, cấu hình Docker Compose đồng bộ và chuẩn bị nội dung demo cho Meeting 4 (08/11/2026).

---

## 📌 6. SỔ TAY KỸ THUẬT & QUY TẮC CẦN NHỚ
1. **Sinh viên & MSSV chuẩn xác:**
   - Nguyễn Ngọc Sáng: `2353046`
   - Nguyễn Hữu Hào: `2352296`
   - Phạm Quang Tuấn: `2353275`
2. **Quy tắc làm việc:**
   - Kịch bản thuyết trình và tài liệu chung viết bình đẳng, không dùng chức danh phân biệt leader khi trình bày với Thầy.
   - Luôn duy trì đồng bộ code và tài liệu với remote GitHub.
   - Thường xuyên cập nhật trạng thái checklist trong file này.
