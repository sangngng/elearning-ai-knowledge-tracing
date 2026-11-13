# Quy trình làm việc nhóm

Ba thành viên, một kho mã, phản hồi nhanh.

## Phân chia thư mục (mỗi thư mục một chủ; người khác đóng góp qua pull request)

| Thư mục | Chủ | Người review |
|---|---|---|
| `frontend/` | Sang | Hào |
| `backend/`, `docker-compose.yml` | Hào | Sang |
| `docs/requirements/`, `docs/data/`, `docs/diagrams/` | Tuấn | Sang |
| `report/` | Sang (gộp đóng góp) | Tuấn |
| `management/` | Sang (leader) | --- |

## Nhánh và commit

- `main` luôn chạy được. Không push thẳng; merge bằng pull request sau khi có một người review.
- Tên nhánh: `feat/<mã-việc>-<chủ-đề>`, `fix/<chủ-đề>`, `docs/<chủ-đề>`, `chore/<chủ-đề>`. Ví dụ: `feat/s1-3-seed-co2003`.
- Thông điệp commit bằng tiếng Anh, dạng mệnh lệnh, có tiền tố `feat`, `fix`, `docs`, `test`, `chore`. Ví dụ: `feat(backend): seed CO2003 class and questions`.
- Pull request nhỏ (dưới khoảng 400 dòng thay đổi), gắn với một mã việc trong `management/TASKS.md`.

## Báo cáo tiến độ

- Cập nhật cột trạng thái trong `management/TASKS.md` ngay trong pull request hoàn thành việc đó.
- Tối thứ Tư và thứ Sáu mỗi người nhắn vào nhóm: đã xong gì, đang bị chặn bởi gì, việc tiếp theo. Leader cập nhật bảng.
- Việc chỉ được coi là xong khi đạt Định nghĩa hoàn thành trong `management/ROADMAP.md`.

## Quy tắc mã

- Backend và mã frontend mới viết bằng TypeScript, kiểu rõ ràng, bắt lỗi chặt chẽ, không để bí mật trong mã (dùng `.env`).
- Thay đổi CSDL chỉ làm trong `backend/db/schema.sql` và phải chạy lại được nhiều lần (áp dụng hai lần để kiểm tra).
- Biểu tượng dùng SVG; không dùng emoji trong mã, giao diện và tài liệu.
- CSDL và ERD mô tả không gắn nhãn phiên bản.
