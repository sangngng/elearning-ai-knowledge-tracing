# LMS Thích ứng – Khung giao diện (Next.js)

Bản demo giao diện sơ bộ gồm 3 màn hình, dùng dữ liệu giả (chưa nối backend).

| Đường dẫn | Màn hình |
|---|---|
| `/` | Đăng nhập, sau đó là danh sách khóa học |
| `/lecture` | Xem bài giảng (video + nội dung văn bản) |
| `/quiz` | Làm trắc nghiệm, chọn A/B/C/D rồi bấm "Nộp câu" |

## Yêu cầu
- Node.js bản LTS (tải tại https://nodejs.org), kiểm tra bằng `node -v` và `npm -v`

## Cách chạy
```
cd lms-ui
npm install
npm run dev
```
Mở trình duyệt tại http://localhost:3000

Trên đăng nhập, nhập bất kỳ email và mật khẩu nào (chưa kiểm tra thật).

## Lỗi thường gặp (Windows)
- **`npm is not recognized`**: chưa cài Node.js, hoặc chưa mở lại PowerShell sau khi cài.
- **`running scripts is disabled on this system`**: chạy một lần
  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
  hoặc dùng `npm.cmd install` / `npm.cmd run dev`, hoặc mở Command Prompt (cmd).
- **Không thấy `package.json`**: bạn đang đứng sai thư mục, hãy `cd` vào thư mục chứa file đó.
- **Cổng 3000 đang bận**: chạy `npm run dev -- -p 3001` rồi mở http://localhost:3001

## Cấu trúc thư mục
```
app/
  layout.jsx        Thanh điều hướng chung
  globals.css       Giao diện
  page.jsx          Đăng nhập / danh sách khóa học
  lecture/page.jsx  Màn hình bài giảng
  quiz/page.jsx     Màn hình trắc nghiệm
```

## Việc cần nối backend (đã đánh dấu TODO trong code)
- `app/page.jsx`: gọi API đăng nhập, lấy danh sách khóa học thật
- `app/quiz/page.jsx`: gửi từng câu trả lời lên `/api/answers` (mã câu, đáp án, đúng/sai, Skill Tag, thời gian)
