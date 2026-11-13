# Bảng công việc

Phân công: **Sang** (leader, frontend, tích hợp, báo cáo), **Hào** (backend, CSDL, Docker), **Tuấn** (yêu cầu, dữ liệu, tài liệu, nội dung báo cáo).
Trạng thái: `todo`, `doing`, `review`, `done`. Leader kiểm tra bảng vào thứ Tư và thứ Sáu. Mỗi nhiệm vụ làm trên nhánh riêng (xem `CONTRIBUTING.md`).

## Sprint 1: 16/11 - 22/11 (mục tiêu: hệ thống thật, đã tích hợp)

### Hào (Backend, CSDL, Docker)

| ID | Nhiệm vụ | Hạn | Kết quả nộp | Tiêu chí chấp nhận | Trạng thái |
|---|---|---|---|---|---|
| S1-3 | Script seed CO2003 từ `docs/data/*.json`: 1 giảng viên, 8 sinh viên, 1 lớp, 15 buổi, 11 kỹ năng, 40 câu hỏi, mật khẩu băm bcrypt | 17/11 | `backend/db/seed.ts` (hoặc `seed.sql`) và lệnh `npm run seed` | Chạy hai lần cho cùng kết quả; sau seed đăng nhập được bằng tài khoản mẫu | todo |
| S1-14 | Thêm `GET /api/me` và `GET /api/classes` (lớp của tôi, kèm sĩ số) cho frontend | 17/11 | Hai endpoint, tài liệu trong `backend/README.md` | Sinh viên thấy lớp đã ghi danh, giảng viên thấy lớp đang dạy; có test | todo |
| S1-5 | Chạy thật test case T13-T16 và ghi kết quả | 18/11 | `docs/testing/T13-T16.md` kèm log hoặc ảnh | Mỗi case có kết quả Đạt/Không đạt và bằng chứng | todo |
| S1-4 | Dockerfile cho backend và frontend; `docker compose --profile app up` chạy được | 19/11 | Hai Dockerfile, compose chạy | Từ máy sạch, một lệnh lên đủ DB, API, giao diện; `/health` trả `ok` | todo |
| S1-6 | Test tự động cho điểm danh PIN: khóa sau 5 lần sai, PIN hết hạn, check-in trùng | 19/11 | Thư mục test và báo cáo đạt/không đạt | `npm test` chạy được; 3 kịch bản đều đạt | todo |
| S1-7 | Test đồng thời cho trigger sĩ số lớp (nhiều yêu cầu ghi danh cùng lúc) | 20/11 | Script và kết quả | Không vượt `max_capacity` dù chạy song song | todo |
| S1-12 | Viết mục API và bảo mật cho báo cáo (endpoint, xác thực, rate limit, trigger) | 21/11 | 3-4 trang, Markdown hoặc LaTeX | Số liệu khớp mã nguồn hiện tại | todo |

### Tuấn (Yêu cầu, dữ liệu, tài liệu)

| ID | Nhiệm vụ | Hạn | Kết quả nộp | Tiêu chí chấp nhận | Trạng thái |
|---|---|---|---|---|---|
| S1-8 | Viết lại đặc tả chi tiết UC1-UC3 cùng định dạng UC5-UC7 | 18/11 | Cập nhật docx và `USE_CASES_SUMMARY.md` | Đủ tiền điều kiện, luồng chính, luồng thay thế, hậu điều kiện, ngoại lệ | todo |
| S1-15 | Cân bằng ngân hàng câu hỏi: mỗi kỹ năng tối thiểu 4 câu (hiện DSA-COMPLEXITY và DSA-RECURSION chỉ có 1) | 19/11 | `docs/data/dsa_co2003_questions_en.json` cập nhật và danh sách thay đổi | Mỗi kỹ năng có từ 4 câu; có đáp án đúng và giải thích; độ khó phân bố dễ/vừa/khó | todo |
| S1-9 | Rà 40 câu hỏi và nhãn 11 kỹ năng với nội dung 15 buổi | 19/11 | Danh sách sửa và JSON đã chốt | Mỗi câu thuộc đúng một kỹ năng của buổi tương ứng | todo |
| S1-16 | Cập nhật sơ đồ 01, 02, 04 (.drawio và .png): bỏ khái niệm bài giảng (lessons), dùng buổi học (sessions) | 20/11 | Tệp sơ đồ mới trong `docs/diagrams/` | Khớp với `backend/db/schema.sql` và danh sách endpoint | todo |
| S1-10 | Đối chiếu 44 tài liệu tham khảo, thêm ngày truy cập cho nguồn online | 20/11 | Danh sách đã sửa (BibTeX hoặc văn bản) | Từng mục đúng tác giả, năm, nhan đề, đường dẫn mở được | todo |
| S1-11 | Viết mục so sánh BKeL/Moodle và mục rủi ro cho báo cáo | 21/11 | 4-5 trang | Có nguồn trích dẫn; khớp với phạm vi hệ thống | todo |

### Sang (Leader, frontend, báo cáo)

| ID | Nhiệm vụ | Hạn | Kết quả nộp | Trạng thái |
|---|---|---|---|---|
| S1-2 | Thiết lập `.env`, `tsconfig` (allowJs) và client API có kiểu `frontend/lib/api.ts` | 17/11 | Mã trong nhánh `feat/s1-2-api-client` | todo |
| S1-1 | Thay dữ liệu tĩnh bằng API: đăng nhập, thời khóa biểu, danh sách buổi, check-in PIN | 20/11 | Frontend chạy với backend seed | todo |
| S1-17 | Sửa bìa báo cáo (tên có dấu), ghép các phần của Hào và Tuấn, biên dịch lại | 22/11 | PDF báo cáo mới | todo |
| S1-13 | Chuẩn bị họp lần 5: slide ngắn, kịch bản demo, bảng kết quả test | 22/11 | `management/MEETINGS.md` mục lần 5 hoàn chỉnh | todo |
| S1-18 | Kiểm tiến độ: thứ Tư 18/11 và thứ Sáu 20/11 | 20/11 | Cập nhật cột trạng thái, báo cáo cho cả nhóm | todo |

Phụ thuộc: S1-1 cần S1-3 và S1-14; S1-6 cần S1-3; S1-17 cần S1-8, S1-10, S1-11, S1-12.

## Sprint 2: 23/11 - 06/12 (mục tiêu: UC1-UC7 trọn vẹn, báo cáo 50 trang)

| ID | Nhiệm vụ | Phụ trách | Hạn |
|---|---|---|---|
| S2-1 | Màn hình giảng viên: mở/đóng PIN, tổng hợp điểm danh, quản lý buổi học | Sang | 29/11 |
| S2-2 | Màn hình sinh viên: ghi danh, tài liệu, làm quiz và lưu kết quả | Sang | 29/11 |
| S2-3 | Endpoint còn thiếu cho quiz (kết quả theo kỹ năng) và tài liệu buổi học, có test | Hào | 27/11 |
| S2-4 | Test phân quyền theo vai trò (sinh viên không gọi được endpoint của giảng viên) | Hào | 29/11 |
| S2-5 | Kịch bản demo cho từng use case, có kết quả mong đợi | Tuấn | 29/11 |
| S2-6 | Báo cáo đạt 50 trang (mốc 30/11) | Cả nhóm | 30/11 |
| S2-7 | Test end-to-end toàn bộ use case và danh sách lỗi | Tuấn | 04/12 |
| S2-8 | Sửa lỗi, kiểm tra hiệu năng truy vấn lịch và tổng hợp điểm danh | Hào, Sang | 05/12 |
| S2-9 | Làn AI giai đoạn A: ghi chú BKT/DKT, hợp đồng dữ liệu và API, chạy baseline BKT | Sang | 06/12 |
| S2-10 | Hào hỗ trợ: endpoint hoặc script xuất `quiz_interactions` ra CSV đúng hợp đồng dữ liệu | Hào | 06/12 |

## Sprint 3: 07/12 - 20/12 (mục tiêu: chất lượng và báo cáo 70 trang)

Làn AI giai đoạn B và C (xem `ROADMAP.md`, mục 5), báo cáo kiểm thử, rà soát bảo mật, kiểm tra khả dụng và truy cập, báo cáo 70 trang vào 15/12, bản nháp slide, tập dượt họp lần 7. Phân công chi tiết lập vào 06/12 sau khi có phản hồi của GVHD.

## Sprint 4: 21/12 - 31/12

Đóng băng, gắn tag phát hành, hoàn thiện báo cáo và slide, hai buổi tập bảo vệ.
