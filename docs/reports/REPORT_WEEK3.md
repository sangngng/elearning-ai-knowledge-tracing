# TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐHQG-HCM
## KHOA KHOA HỌC VÀ KỸ THUẬT MÁY TÍNH
### CHƯƠNG TRÌNH ĐÀO TẠO TIẾNG ANH (CC/CT/QT)

---

# BÁO CÁO TIẾN ĐỘ ĐỒ ÁN CHUYÊN NGÀNH (TUẦN 3)
## ĐỀ TÀI: THIẾT KẾ HỆ THỐNG E-LEARNING CÓ TÍCH HỢP AI
- **Mã đề tài**: `HK261-DAGD1-480`
- **Ngày báo cáo**: 25/10/2026 (Buổi gặp thứ 3)
- **Giảng viên hướng dẫn**: TS. Nguyễn Quốc Minh
- **Sinh viên thực hiện**:
  1. **Nguyễn Ngọc Sáng** (MSSV: `2353046`)
  2. **Nguyễn Hữu Hào** (MSSV: `2352296`)
  3. **Phạm Quang Tuấn** (MSSV: `2353275`)
- **Kho lưu trữ GitHub**: [https://github.com/sangngng/elearning-ai-knowledge-tracing.git](https://github.com/sangngng/elearning-ai-knowledge-tracing.git)

---

## 1. TỔNG QUAN ĐỀ TÀI VÀ MỤC TIÊU HỆ THỐNG

### 1.1. Hiện trạng và Thách thức từ các Hệ thống LMS truyền thống
Trong bối cảnh chuyển đổi số giáo dục, các Hệ thống Quản lý Học tập trực tuyến (LMS) đã trở thành công cụ không thể thiếu. Điển hình như tại Trường Đại học Bách Khoa, hệ thống BK-LMS (xây dựng trên nền tảng Moodle với ngôn ngữ PHP và kiến trúc nguyên khối Monolithic) phục vụ quản lý đào tạo rất hiệu quả. Tuy nhiên, dưới góc độ học tập tương tác và phân tích năng lực cá nhân hóa, các hệ thống này bộc lộ những rào cản lớn:
- **Cơ chế nộp bài theo đợt (Batch Submission) thụ động:** Học viên làm trọn vẹn cả đề 20–30 câu rồi mới nộp bài 1 lần. Trình duyệt phải tải lại toàn bộ trang web (page reload). Người học chỉ nhận được 1 con điểm tổng (ví dụ 6/10 hay 7/10) mà không kịp thời học hỏi từ lỗi sai ngay trong mạch cảm xúc làm bài.
- **Đánh giá cào bằng và thiếu hụt thông tin năng lực:** Điểm số tổng kết không phản ánh được bản chất quá trình tiếp thu. Hai sinh viên cùng đạt 7/10 điểm hoàn toàn có thể có lỗ hổng kiến thức trái ngược nhau. Hệ thống truyền thống không có cơ chế chỉ rõ điểm mạnh/yếu từng kỹ năng.
- **Kiến trúc nguyên khối nặng nề, khó tích hợp công nghệ mới:** Do mã nguồn giao diện (Frontend) và logic máy chủ (Backend) bị gắn chặt, việc nhúng các dịch vụ suy luận AI hoặc thu nhận luồng tương tác thời gian thực rất cồng kềnh và dễ nghẽn hệ thống.

### 1.2. Mục tiêu nghiên cứu và Định hướng giai đoạn nền tảng
- Xây dựng nền tảng E-Learning hoàn chỉnh, đa tác nhân cho 3 nhóm đối tượng: Học viên (Student), Giảng viên (Lecturer), và Quản trị viên (Admin).
- Tối ưu hóa trải nghiệm làm bài trắc nghiệm với cơ chế **tương tác từng câu (Per-Question Interactivity)**: làm tới đâu, nộp và nhận phản hồi đúng/sai tức thì tới đó.
- Thiết kế cơ sở dữ liệu chuẩn hóa, sẵn sàng thu nhận dữ liệu tương tác chi tiết (Telemetry Logging) làm cơ sở dữ liệu cho các thuật toán AI theo dõi kiến thức ở các tuần tiếp theo.

> **💡 3 ĐỘT PHÁ VƯỢT TRỘI SO VỚI LMS TRUYỀN THỐNG:**  
> 1. **Trải nghiệm mượt mà không reload trang:** Sử dụng Next.js 14 (Single Page App) loại bỏ hoàn toàn độ trễ tải lại trang.  
> 2. **Học tập tương tác tức thời:** Chấm điểm từng câu giúp sinh viên khắc phục sai sót ngay lập tức.  
> 3. **Bản đồ năng lực trực quan (Radar Chart):** Trực quan hóa độ thuần thục theo từng kỹ năng, chỉ rõ lỗ hổng kiến thức thay vì một con điểm vô hồn.

---

## 2. ĐẶC TẢ YÊU CẦU VÀ SƠ ĐỒ USE CASE HỆ THỐNG

### 2.1. Phân loại Tác nhân Hệ thống
- **Student (Học viên):** Học bài giảng, làm trắc nghiệm tương tác từng câu, theo dõi biểu đồ năng lực.
- **Lecturer (Giảng viên):** Quản lý khóa học, soạn ngân hàng câu hỏi và bắt buộc gán thẻ kỹ năng (Skill Tagging).
- **Admin (Quản trị viên):** Quản lý tài khoản và phân quyền hệ thống.
- **AI Analysis Module (Secondary Actor):** Dịch vụ hỗ trợ tính toán xác suất thành thạo kỹ năng.

### 2.2. Sơ đồ Use Case Tổng thể (10 Use Cases)
![Sơ đồ Use Case tổng thể](../01_use_case_diagram.png)

### 2.3. Bảng Đặc tả Chi tiết 4 Ca Sử dụng Cốt lõi
- **UC1: Đăng nhập & Xem bài giảng đa phương tiện (Student)**: Xác thực JWT, xem video/văn bản bài học, lưu tiến trình.
- **UC2: Làm bài trắc nghiệm tương tác từng câu (Student)**: Nộp từng câu, đối chiếu đáp án an toàn phía Server, lưu log `quiz_interactions`, phản hồi tức thời.
- **UC3: Soạn câu hỏi & Bắt buộc gán thẻ kỹ năng (Lecturer)**: Tạo câu hỏi A-B-C-D, đánh dấu đáp án đúng, bắt buộc chọn mã Knowledge Component (Skill Tag).
- **UC4: Theo dõi Biểu đồ Năng lực trực quan (Student)**: Render biểu đồ Radar Chart đa kỹ năng, hiển thị tỷ lệ thuần thục và gợi ý bài giảng ôn tập.

*(Các use case còn lại là các thao tác quản lý dữ liệu thông thường CRUD đang tiếp tục được bổ sung vào phụ lục).*

---

## 3. THIẾT KẾ KIẾN TRÚC HỆ THỐNG PHÂN TẦNG (MULTI-TIER ARCHITECTURE)

![Sơ đồ Kiến trúc Phân tầng](../02_system_architecture.png)

### Chi tiết các phân tầng kỹ thuật:
1. **Tier 1: Presentation Layer (Next.js 14 / React / Tailwind CSS / TypeScript):** Giao diện Single Page App hiện đại, không reload trang, tối ưu hóa tốc độ tải trang và hỗ trợ vẽ biểu đồ radar năng lực.
2. **Tier 2: Backend API Layer (Express.js / Node.js Engine):** Xử lý bất đồng bộ non-blocking I/O hiệu năng cao, tiếp nhận luồng tương tác câu hỏi liên tục không gây nghẽn máy chủ, bảo mật với JWT Middleware và RoleGuard.
3. **Tier 3: Persistence Layer (PostgreSQL 15 Relational DB):** Lưu trữ quan hệ chuẩn 3NF, bảo đảm toàn vẹn giao dịch ACID và khóa ngoại chặt chẽ, tối ưu hóa truy vấn bằng Composite Index.
4. **Tier 4: Phân tầng AI Microservice (FastAPI / PyTorch - Giai đoạn sau):** Phân tách độc lập qua RESTful API, bảo đảm máy chủ Web LMS cốt lõi luôn chạy ổn định khi AI thực hiện các tính toán ma trận tensor nặng.

---

## 4. THIẾT KẾ LUỒNG NGHIỆP VỤ TƯƠNG TÁC (ACTIVITY DIAGRAM)

![Sơ đồ Luồng hoạt động](../03_activity_diagram.png)

- **Cơ chế Server-Side Verification:** Client chỉ nhận nội dung câu hỏi và 4 lựa chọn A, B, C, D (không lộ đáp án đúng). Khi học viên nộp bài, Backend đối chiếu trực tiếp với database trong PostgreSQL và lưu vết kết quả.
- **Ghi nhận Telemetry chi tiết:** Lưu bản ghi đầy đủ vào bảng `quiz_interactions`: `(id, user_id, question_id, skill_id, is_correct, attempt_count, created_at)`.

---

## 5. THIẾT KẾ CƠ SỞ DỮ LIỆU QUAN HỆ (POSTGRESQL 3NF)

![Sơ đồ Cơ sở dữ liệu](../05_erd_database.png)

### Lược đồ Bảng Thực thể Cốt lõi:
- `users`: id (UUID PK), name, email (UK), password_hash (bcrypt), role, created_at.
- `courses` & `lessons`: Cấu trúc cây khóa học phân cấp theo thứ tự `order_idx`.
- `quizzes`, `skills` & `questions`: Quản lý bài kiểm tra, ngân hàng câu hỏi và mã kỹ năng chuẩn hóa (ví dụ: `CTDL-CAY-01`).
- `quiz_interactions`: Bảng log tương tác học tập với chỉ mục tổ hợp B-Tree:
  ```sql
  CREATE INDEX idx_user_skill_seq ON quiz_interactions (user_id, skill_id, created_at DESC);
  ```

---

## 6. TIẾN ĐỘ THỰC TẾ & KẾ HOẠCH TUẦN 4

### Tiến độ Tuần 1 - Tuần 3:
- ✔ Hoàn thành 100% tài liệu đặc tả yêu cầu và sơ đồ UML (Use Case, Activity, System Architecture).
- ✔ Thiết kế hoàn chỉnh CSDL PostgreSQL chuẩn 3NF và Database Data Dictionary.
- ✔ Khởi tạo khung mã nguồn Frontend Next.js 14 và Backend Express.js.
- ✔ Đẩy toàn bộ mã nguồn lên GitHub repository: [https://github.com/sangngng/elearning-ai-knowledge-tracing.git](https://github.com/sangngng/elearning-ai-knowledge-tracing.git).

### Kế hoạch Tuần 4:
1. Hiện thực hóa các API cốt lõi: Auth JWT, CRUD Khóa học, Bài học và Câu hỏi.
2. Tích hợp kết nối API giữa Frontend Next.js và Backend Express.
3. Hoàn thiện màn hình làm bài trắc nghiệm per-question và kiểm thử ghi nhận dữ liệu vào PostgreSQL.
4. Chuẩn bị môi trường thử nghiệm cho phân hệ AI.

---

## 7. TÀI LIỆU THAM KHẢO
1. Corbett, A. T., & Anderson, J. R. (1995). *Knowledge tracing: Modeling the acquisition of procedural knowledge.* User Modeling and User-Adapted Interaction, 4(4), 253-278.
2. Piech, C., et al. (2015). *Deep knowledge tracing.* NeurIPS 2015, 28, 505-513.
3. PostgreSQL 15 Documentation. (2023). [https://www.postgresql.org/docs/15/](https://www.postgresql.org/docs/15/)
4. Next.js 14 Documentation. (2024). [https://nextjs.org/docs](https://nextjs.org/docs)
