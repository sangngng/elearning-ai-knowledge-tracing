# Lộ trình dự án - E-Learning System (HK261-DAGD1-480)

Họp GVHD vào Chủ nhật, hai tuần một lần. Cập nhật lần cuối: 14/11/2026.

## 1. Nguyên tắc phạm vi

- GVHD: AI chỉ là một phần nhỏ của đồ án; việc quan trọng là hệ thống E-Learning phải thật tốt trước. Vì vậy AI chạy theo hai làn: nghiên cứu nhẹ song song ngay từ bây giờ (không tranh thời gian của hệ thống), tích hợp vào hệ thống chỉ sau khi qua cổng G3 (mục 5). Báo cáo chưa trình bày AI ngoài kế hoạch HK262 cho đến khi GVHD đồng ý (hỏi ở buổi 06/12).
- Tính năng mới sau 07/12 chỉ nhận khi GVHD yêu cầu; từ đó chỉ sửa lỗi, kiểm thử và viết báo cáo.
- Cơ sở dữ liệu và ERD mô tả không gắn nhãn phiên bản (đây là bản hoàn chỉnh dần trong quá trình làm, không phải bản nâng cấp).

## 2. Hiện trạng (14/11/2026)

| Hạng mục | Tình trạng | Ghi chú |
|---|---|---|
| Báo cáo | 40 trang, 7 mục, 44 tài liệu tham khảo | Mốc 30/11 cần 50 trang, 15/12 cần 70 trang |
| CSDL | 14 bảng, schema áp dụng sạch và chạy lại được (đã kiểm tra trên PostgreSQL) | Chưa có script seed |
| Backend | Typecheck đạt; đăng ký, đăng nhập, lịch, buổi học, điểm danh PIN (5 phút), quiz đã có; đã sửa lỗi check-in PIN trả 500 | Chưa có test tự động; chưa có `GET /api/me`, danh sách lớp của tôi |
| Frontend | Build đạt; giao diện BKeL đầy đủ | Toàn bộ dữ liệu là tĩnh, chưa gọi API nào |
| Docker | Compose chạy được PostgreSQL | Chưa có Dockerfile cho backend và frontend |
| Dữ liệu CO2003 | 15 buổi, 40 câu, 11 kỹ năng | Phân bố không đều: DSA-COMPLEXITY và DSA-RECURSION chỉ có 1 câu |
| Sơ đồ | Use case, kiến trúc, hoạt động, ERD | Sơ đồ 01, 02, 04 còn nhắc bài giảng (lessons) cũ |

## 3. Các buổi họp và mốc báo cáo

| Ngày | Sự kiện | Phải sẵn sàng |
|---|---|---|
| 15/11 (CN) | Mốc báo cáo 1 | Báo cáo từ 30 trang (đã đạt: 40 trang) |
| 22/11 (CN) | Họp GVHD lần 5 | Frontend gọi API thật (đăng nhập, thời khóa biểu, danh sách buổi, điểm danh PIN); kết quả T13-T16; báo cáo khoảng 45-50 trang |
| 30/11 (T2) | Mốc báo cáo 2 | Báo cáo từ 50 trang |
| 06/12 (CN) | Họp GVHD lần 6 | Hệ thống đủ UC1-UC7, chạy bằng một lệnh; báo cáo kiểm thử đầy đủ |
| 15/12 (T3) | Mốc báo cáo 3 | Báo cáo từ 70 trang |
| 20/12 (CN) | Họp GVHD lần 7 | Bản báo cáo gần cuối, tập demo |
| 31/12 (T5) | Bảo vệ | Bản phát hành đóng băng, báo cáo, slide |

## 4. Các giai đoạn

| Giai đoạn | Thời gian | Mục tiêu | Tiêu chí hoàn thành |
|---|---|---|---|
| 1. Ổn định | 16/11 - 22/11 | Một cấu trúc kho, một nguồn sự thật, hệ thống nối thông | Frontend gọi API thật; DB seed lặp lại được; T13-T16 chạy thật; test PIN và sĩ số đạt |
| 2. Hoàn thiện | 23/11 - 06/12 | UC1-UC7 chạy trọn vẹn | Mỗi use case có kịch bản demo và test đạt; `docker compose --profile app up` chạy được |
| 3. Củng cố | 07/12 - 20/12 | Chất lượng, bảo mật, hiệu năng, báo cáo | Báo cáo kiểm thử, báo cáo 70 trang, không còn lỗi nghiêm trọng |
| 4. Bảo vệ | 21/12 - 31/12 | Đóng băng và tập dượt | Tag phát hành, slide, hai buổi tập |

## 5. Làn AI (Knowledge Tracing)

Ngân sách: tối đa khoảng 10% thời gian của Sang đến 06/12, sau đó tăng lên nếu qua cổng G3.

| Giai đoạn | Thời gian | Việc | Sản phẩm |
|---|---|---|---|
| A. Nghiên cứu nhẹ | từ nay đến 06/12 | Đọc BKT và DKT, chạy baseline BKT có sẵn, chốt hợp đồng dữ liệu: cách xuất `quiz_interactions` ra CSV và giao diện `POST /predict-mastery` | Một trang ghi chú trong `docs/architecture/` |
| B. Huấn luyện ngoại tuyến | 07/12 - 13/12 | Huấn luyện DKT (LSTM, PyTorch) trên ASSISTments, so sánh AUC và độ chính xác với BKT | Notebook hoặc script và bảng kết quả |
| C. Tích hợp tối thiểu | 14/12 - 20/12, chỉ khi đạt G3 | Backend gọi `ai_service` để lấy độ thành thạo từng kỹ năng của một sinh viên; hiển thị trên bản đồ kỹ năng | Một endpoint và một màn hình, có test |
| D. Nếu chưa đạt G3 | --- | Chỉ trình bày kết quả ngoại tuyến của giai đoạn B và kế hoạch HK262 | Mục AI trong báo cáo |

Quyết định: tích hợp AI chỉ bắt đầu khi hệ thống đủ UC1-UC7 và các test của G3 đạt. Điểm quyết định vào 06/12.

## 6. Cổng chất lượng (đo được)

| Cổng | Khi nào | Điều kiện |
|---|---|---|
| G1 Cấu trúc | 22/11 | Kho gọn, README chạy đúng từ đầu; `npm run typecheck` (backend) và `npm run build` (frontend) đạt |
| G2 Tích hợp | 22/11 | Đăng nhập, lịch, danh sách buổi, mở PIN và check-in chạy end-to-end trên dữ liệu seed |
| G3 Test | 06/12 | Mỗi UC1-UC7 có ít nhất một test tự động hoặc bản ghi test thủ công có bằng chứng; test PIN (khóa sau 5 lần sai, PIN hết hạn, check-in trùng) và test sĩ số đồng thời đạt |
| G4 Tài liệu | 15/12 | 44 tài liệu tham khảo đã đối chiếu, có ngày truy cập; số liệu trong báo cáo khớp với mã nguồn |
| G5 Phát hành | 28/12 | Tag `v1.0`, chạy sạch từ máy trống theo README, không còn lỗi nghiêm trọng |

## 7. Định nghĩa hoàn thành (áp dụng cho mọi nhiệm vụ)

1. Mã được merge qua pull request, có người khác trong nhóm review; typecheck đạt.
2. Có test hoặc bản ghi test thủ công kèm bằng chứng (log, ảnh chụp).
3. Cập nhật `docs/` hoặc `report/` nếu hành vi thay đổi.
4. Không có bí mật, đường dẫn tuyệt đối máy cá nhân hay emoji trong mã và tài liệu.
5. Người làm báo cáo kết quả vào nhóm kèm bằng chứng.

## 8. Rủi ro

| Rủi ro | Ảnh hưởng | Biện pháp | Phụ trách |
|---|---|---|---|
| Frontend vẫn dùng dữ liệu tĩnh | Demo không phải hệ thống thật | S1-1 là việc ưu tiên số một; cắt phần việc khác trước | Sang |
| Chưa có Dockerfile | Không chạy được bằng một lệnh | S1-4, hạn 19/11 | Hào |
| Ngân hàng câu hỏi lệch (2 kỹ năng chỉ có 1 câu) | Cản trở AI sau này và gây hỏi khi bảo vệ | S1-15: tối thiểu 4 câu mỗi kỹ năng | Tuấn |
| Tài liệu tham khảo viết từ trí nhớ | Sai thông tin trích dẫn | S1-10: đối chiếu từng mục | Tuấn |
| Báo cáo 50 và 70 trang | Trượt mốc | Nội dung viết trước hạn theo bảng việc; có danh sách mục dự phòng để thêm | Sang |
| AI lấn thời gian của hệ thống | Hệ thống thiếu hoàn thiện khi bảo vệ | Giới hạn ngân sách làn AI; chỉ tích hợp sau G3 | Sang |
| Hệ thống gắn cứng một môn (15 buổi, dữ liệu CO2003) | Không mở rộng được sang môn khác | S2-11, S2-12, S2-13 | Hào, Sang, Tuấn |
| Ba người cùng sửa một kho | Xung đột merge | Nhánh ngắn, pull request, mỗi thư mục một chủ (xem CONTRIBUTING.md) | Cả nhóm |

## 9. Nếu bị trễ (thứ tự cắt giảm)

1. Giữ nguyên: đăng nhập, lịch, điểm danh PIN, sĩ số, quiz ghi tương tác (cốt lõi của một LMS).
2. Cắt trước: màn hình thống kê nâng cao, chỉnh sửa tài liệu buổi học bằng giao diện.
3. Không bao giờ cắt: test, báo cáo, tài liệu tham khảo đã kiểm chứng.
