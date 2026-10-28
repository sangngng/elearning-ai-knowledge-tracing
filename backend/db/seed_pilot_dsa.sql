-- =============================================================================
-- SEED DATA: PILOT COURSE CO2003 (DATA STRUCTURES AND ALGORITHMS - DSA)
-- Course: Capstone Project (ĐACN CO3047) - HCMUT CSE (HK261)
-- Description: Realistic university pilot dataset for demoing Attendance, 
--              15 Sessions, Timetable, Student Stats, and Quiz Telemetry.
-- =============================================================================

-- Clear existing data if re-running
TRUNCATE TABLE quiz_interactions CASCADE;
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE quizzes CASCADE;
TRUNCATE TABLE session_materials CASCADE;
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE course_sessions CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE course_classes CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE semesters CASCADE;
TRUNCATE TABLE skills CASCADE;
TRUNCATE TABLE users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. SEED ACADEMIC SEMESTER
-- -----------------------------------------------------------------------------
INSERT INTO semesters (id, code, name, start_date, end_date, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'HK261',
  'Học kỳ 1 năm học 2026-2027',
  '2026-09-07',
  '2027-01-16',
  true
);

-- -----------------------------------------------------------------------------
-- 2. SEED USERS (INSTRUCTOR & 3 TEAM MEMBERS & SAMPLE STUDENTS)
-- -----------------------------------------------------------------------------
-- Password for all seed users is 'password123' (bcrypt hashed)
-- hash: $2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK (mock)
INSERT INTO users (id, student_id, name, email, password_hash, role)
VALUES 
  -- Instructor:
  ('22222222-2222-2222-2222-222222222222', 'CB001', 'TS. Nguyễn Quốc Minh', 'minh.nguyen@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'instructor'),
  -- Team Members:
  ('33333333-3333-3333-3333-333333333331', '2353046', 'Nguyễn Ngọc Sáng', 'sang.nguyen@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  ('33333333-3333-3333-3333-333333333332', '2352296', 'Nguyễn Hữu Hào', 'hao.nguyen@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  ('33333333-3333-3333-3333-333333333333', '2353275', 'Phạm Quang Tuấn', 'tuan.pham@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  -- Additional Classmates:
  ('33333333-3333-3333-3333-333333333334', '2351001', 'Trần Văn An', 'an.tran@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  ('33333333-3333-3333-3333-333333333335', '2351002', 'Lê Thị Bích', 'bich.le@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  ('33333333-3333-3333-3333-333333333336', '2351003', 'Hoàng Minh Châu', 'chau.hoang@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  ('33333333-3333-3333-3333-333333333337', '2351004', 'Vũ Quốc Đạt', 'dat.vu@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student'),
  ('33333333-3333-3333-3333-333333333338', '2351005', 'Đỗ Thanh Giang', 'giang.do@hcmut.edu.vn', '$2a$10$wT8m9Lp9V8f5hVw7dCqMxe1i2k.7sYm1qD4x1O9A8g0Jb2u5iY7aK', 'student');

-- -----------------------------------------------------------------------------
-- 3. SEED PILOT COURSE (CO2003 - DSA) & CLASS SECTION (CC01)
-- -----------------------------------------------------------------------------
INSERT INTO courses (id, code, title, credits, description)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'CO2003',
  'Cấu trúc Dữ liệu và Giải thuật',
  4,
  'Môn học trang bị kiến thức nền tảng về cấu trúc dữ liệu tuyến tính, phi tuyến tính, các giải thuật tìm kiếm, sắp xếp và tối ưu hóa.'
);

INSERT INTO course_classes (id, course_id, semester_id, class_code, instructor_id, max_capacity, default_room)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'CC01',
  '22222222-2222-2222-2222-222222222222',
  60,
  'H6-302'
);

-- -----------------------------------------------------------------------------
-- 4. SEED ENROLLMENTS (SĨ SỐ LỚP 8 SINH VIÊN)
-- -----------------------------------------------------------------------------
INSERT INTO enrollments (class_id, user_id, status)
VALUES 
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333331', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333332', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333334', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333335', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333336', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333337', 'enrolled'),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333338', 'enrolled');

-- -----------------------------------------------------------------------------
-- 5. SEED 15 COURSE SESSIONS (THỜI KHÓA BIỂU 15 TUẦN HỌC CHÍNH QUY)
-- -----------------------------------------------------------------------------
INSERT INTO course_sessions (id, class_id, session_number, title, description, session_date, start_time, end_time, room, attendance_code, is_attendance_open)
VALUES 
  ('66666666-6666-6666-6666-000000000001', '55555555-5555-5555-5555-555555555555', 1, 'Buổi 1: Giới thiệu & Độ phức tạp thuật toán O(n)', 'Giới thiệu đề cương, Big-O, Big-Omega, Big-Theta và phân tích thời gian chạy.', '2026-09-09', '07:30', '11:15', 'H6-302', '1234', false),
  ('66666666-6666-6666-6666-000000000002', '55555555-5555-5555-5555-555555555555', 2, 'Buổi 2: Mảng động (Dynamic Array) & Hai con trỏ', 'Quản lý bộ nhớ mảng, vector tự co giãn, kỹ thuật Two Pointers.', '2026-09-16', '07:30', '11:15', 'H6-302', '5678', false),
  ('66666666-6666-6666-6666-000000000003', '55555555-5555-5555-5555-555555555555', 3, 'Buổi 3: Danh sách liên kết đơn (Singly Linked List)', 'Cấu trúc Node, thao tác chèn, xóa, tìm kiếm và đảo ngược danh sách.', '2026-09-23', '07:30', '11:15', 'H6-302', '4829', true), -- Currently open attendance
  ('66666666-6666-6666-6666-000000000004', '55555555-5555-5555-5555-555555555555', 4, 'Buổi 4: Danh sách liên kết đôi & Vòng', 'Doubly Linked List, Circular Linked List và ứng dụng trong thực tế.', '2026-09-30', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000005', '55555555-5555-5555-5555-555555555555', 5, 'Buổi 5: Ngăn xếp (Stack) & Khử đệ quy', 'Cơ chế LIFO, ứng dụng duyệt biểu thức Ba Lan, kiểm tra dấu ngoặc hợp lệ.', '2026-10-07', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000006', '55555555-5555-5555-5555-555555555555', 6, 'Buổi 6: Hàng đợi (Queue) & Deque', 'Cơ chế FIFO, Circular Queue, Double-ended Queue và mô phỏng hàng đợi in ấn.', '2026-10-14', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000007', '55555555-5555-5555-5555-555555555555', 7, 'Buổi 7: Cây nhị phân & Các phép duyệt cây', 'Định nghĩa cây, biểu diễn cây nhị phân, duyệt tiền tự, trung tự, hậu tự.', '2026-10-21', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000008', '55555555-5555-5555-5555-555555555555', 8, 'Buổi 8: Cây nhị phân tìm kiếm (BST)', 'Tính chất BST, tìm kiếm, chèn, xóa nút, độ phức tạp trung bình và suy biến.', '2026-10-28', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000009', '55555555-5555-5555-5555-555555555555', 9, 'Buổi 9: Cây cân bằng AVL (AVL Tree)', 'Yếu tố cân bằng Balance Factor, 4 phép quay: LL, RR, LR, RL.', '2026-11-04', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000010', '55555555-5555-5555-5555-555555555555', 10, 'Buổi 10: Cấu trúc Đống (Binary Heap & Priority Queue)', 'Max-Heap, Min-Heap, thao tác Heapify, giải thuật sắp xếp HeapSort.', '2026-11-11', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000011', '55555555-5555-5555-5555-555555555555', 11, 'Buổi 11: Bảng băm (Hash Table) & Xử lý đụng độ', 'Hàm băm (Hash Function), Chaining, Open Addressing (Linear, Quadratic).', '2026-11-18', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000012', '55555555-5555-5555-5555-555555555555', 12, 'Buổi 12: Đồ thị & Các thuật toán duyệt BFS, DFS', 'Biểu diễn đồ thị bằng ma trận kề, danh sách kề; duyệt theo chiều rộng và sâu.', '2026-11-25', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000013', '55555555-5555-5555-5555-555555555555', 13, 'Buổi 13: Cây khung nhỏ nhất (Kruskal & Prim)', 'Bài toán Minimum Spanning Tree, thuật toán Kruskal (Disjoint Set) và Prim.', '2026-12-02', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000014', '55555555-5555-5555-5555-555555555555', 14, 'Buổi 14: Đường đi ngắn nhất (Dijkstra Algorithm)', 'Thuật toán Dijkstra với trọng số không âm, tối ưu hóa bằng Priority Queue.', '2026-12-09', '07:30', '11:15', 'H6-302', NULL, false),
  ('66666666-6666-6666-6666-000000000015', '55555555-5555-5555-5555-555555555555', 15, 'Buổi 15: Ôn tập tổng kết & Đánh giá năng lực', 'Tổng kết toàn bộ kiến thức môn học, làm bài trắc nghiệm tổng hợp cuối kỳ.', '2026-12-16', '07:30', '11:15', 'H6-302', NULL, false);

-- -----------------------------------------------------------------------------
-- 6. SEED ATTENDANCE RECORDS (DEMO TỶ LỆ ĐI HỌC BUỔI 1 & BUỔI 2)
-- -----------------------------------------------------------------------------
-- Session 1: 100% attendance (8/8)
INSERT INTO attendance_records (session_id, user_id, status, method, checkin_time)
VALUES 
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333331', 'present', 'pin', '2026-09-09 07:35:00'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333332', 'present', 'pin', '2026-09-09 07:36:12'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333333', 'present', 'pin', '2026-09-09 07:34:45'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333334', 'present', 'pin', '2026-09-09 07:38:00'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333335', 'present', 'pin', '2026-09-09 07:37:10'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333336', 'present', 'pin', '2026-09-09 07:35:20'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333337', 'present', 'pin', '2026-09-09 07:39:15'),
  ('66666666-6666-6666-6666-000000000001', '33333333-3333-3333-3333-333333333338', 'present', 'pin', '2026-09-09 07:35:50');

-- Session 2: 75% attendance (6 present, 1 late, 1 absent)
INSERT INTO attendance_records (session_id, user_id, status, method, checkin_time, note)
VALUES 
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333331', 'present', 'pin', '2026-09-16 07:34:00', NULL),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333332', 'present', 'pin', '2026-09-16 07:35:10', NULL),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333333', 'present', 'pin', '2026-09-16 07:33:50', NULL),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333334', 'present', 'pin', '2026-09-16 07:36:00', NULL),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333335', 'late',    'pin', '2026-09-16 07:55:00', 'Đi trễ 25 phút'),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333336', 'present', 'pin', '2026-09-16 07:35:40', NULL),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333337', 'absent',  'manual', NULL, 'Nghỉ học không phép'),
  ('66666666-6666-6666-6666-000000000002', '33333333-3333-3333-3333-333333333338', 'present', 'pin', '2026-09-16 07:37:00', NULL);

-- -----------------------------------------------------------------------------
-- 7. SEED KNOWLEDGE COMPONENTS (SKILLS)
-- -----------------------------------------------------------------------------
INSERT INTO skills (id, code, name, description)
VALUES 
  ('77777777-7777-7777-7777-000000000001', 'DSA-COMPLEXITY', 'Phân tích độ phức tạp Big-O', 'Đánh giá thời gian và không gian bộ nhớ của thuật toán.'),
  ('77777777-7777-7777-7777-000000000002', 'DSA-ARRAY', 'Thao tác trên Mảng động', 'Kỹ thuật hai con trỏ, chèn, xóa và cấp phát bộ nhớ động.'),
  ('77777777-7777-7777-7777-000000000003', 'DSA-LINKEDLIST', 'Danh sách liên kết', 'Thao tác liên kết Node, Singly và Doubly Linked List.'),
  ('77777777-7777-7777-7777-000000000004', 'DSA-STACK-QUEUE', 'Ngăn xếp và Hàng đợi', 'Cơ chế LIFO/FIFO và các bài toán mô phỏng hàng đợi.'),
  ('77777777-7777-7777-7777-000000000005', 'DSA-TREE', 'Cây nhị phân và Cây AVL', 'Duyệt cây, tìm kiếm nhị phân và kỹ thuật cân bằng xoay cây.'),
  ('77777777-7777-7777-7777-000000000006', 'DSA-HEAP', 'Binary Heap & Priority Queue', 'Cấu trúc đống, HeapSort và ứng dụng hàng đợi ưu tiên.'),
  ('77777777-7777-7777-7777-000000000007', 'DSA-HASH', 'Bảng băm (Hash Table)', 'Hàm băm, xử lý đụng độ bằng Chaining và Open Addressing.'),
  ('77777777-7777-7777-7777-000000000008', 'DSA-GRAPH', 'Đồ thị và Thuật toán duyệt', 'Biểu diễn đồ thị, BFS, DFS, Dijkstra và Kruskal.');

-- -----------------------------------------------------------------------------
-- 8. SEED QUIZ & QUESTIONS CHO BUỔI 3 (LINKED LIST)
-- -----------------------------------------------------------------------------
INSERT INTO quizzes (id, session_id, title, time_limit_minutes, is_published)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '66666666-6666-6666-6666-000000000003',
  'Quiz củng cố Buổi 3: Danh sách liên kết đơn',
  10,
  true
);

INSERT INTO questions (id, quiz_id, skill_id, prompt, options, correct_answer, explanation, position)
VALUES 
  (
    '99999999-9999-9999-9999-000000000001',
    '88888888-8888-8888-8888-888888888888',
    '77777777-7777-7777-7777-000000000003',
    'Trong Danh sách liên kết đơn có con trỏ head, độ phức tạp thời gian khi chèn một phần tử mới vào ĐẦU danh sách là bao nhiêu?',
    '["A. O(1)", "B. O(n)", "C. O(log n)", "D. O(n^2)"]'::jsonb,
    'A. O(1)',
    'Chèn vào đầu danh sách liên kết đơn chỉ cần tạo node mới, trỏ next vào head cũ và gán head bằng node mới nên chỉ tốn O(1).',
    1
  ),
  (
    '99999999-9999-9999-9999-000000000002',
    '88888888-8888-8888-8888-888888888888',
    '77777777-7777-7777-7777-000000000003',
    'Nhược điểm lớn nhất của Danh sách liên kết đơn so với Mảng (Array) là gì?',
    '["A. Không thể co giãn kích thước động", "B. Không hỗ trợ truy cập ngẫu nhiên theo chỉ số trong O(1)", "C. Tiêu tốn ít bộ nhớ hơn", "D. Tốc độ chèn vào đầu chậm hơn"]'::jsonb,
    'B. Không hỗ trợ truy cập ngẫu nhiên theo chỉ số trong O(1)',
    'Linked list phải duyệt tuần tự từ đầu qua các con trỏ next nên việc truy xuất phần tử thứ k tốn O(k), không có tính ngẫu nhiên O(1) như mảng.',
    2
  ),
  (
    '99999999-9999-9999-9999-000000000003',
    '88888888-8888-8888-8888-888888888888',
    '77777777-7777-7777-7777-000000000003',
    'Khi xóa một phần tử ở CUỐI danh sách liên kết đơn (chỉ có con trỏ head), ta cần thực hiện duyệt danh sách với thời gian là:',
    '["A. O(1)", "B. O(n)", "C. O(log n)", "D. O(1) nếu có tail pointer"]'::jsonb,
    'B. O(n)',
    'Vì là danh sách liên kết đơn, để xóa phần tử cuối ta bắt buộc phải tìm nút áp chót để gán next của nó bằng NULL, do đó luôn tốn O(n).',
    3
  );
