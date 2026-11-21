# Thay đổi ngân hàng câu hỏi CO2003 (S1-15 và S1-9)

Ngày: 21/11/2026. Tệp: `docs/data/dsa_co2003_questions_en.json` (40 → 52 câu).

## S1-9: kết quả rà 40 câu cũ
- Cả 40 câu đều có `skill_code` trùng với kỹ năng của buổi học tương ứng trong `dsa_co2003_sessions_en.json`. Không phải sửa nhãn.
- Đã tính lại các câu có phép tính (Q15, Q26, Q29, Q36): đáp án đúng.
- Không sửa câu cũ nào.
- Lưu ý nhỏ (không bắt buộc): ở Q09 và Q11, đáp án đúng là phương án dài nhất, dễ đoán.

## S1-15: 12 câu mới (DSA-Q41 đến DSA-Q52)
Thực tế có 6 kỹ năng dưới 4 câu, không chỉ 2.

| Kỹ năng | Trước | Sau | Câu mới |
|---|---|---|---|
| DSA-COMPLEXITY | 1 | 4 | Q41, Q42, Q43 |
| DSA-RECURSION | 1 | 4 | Q44, Q45, Q46 |
| DSA-SORT | 2 | 4 | Q47, Q48 |
| DSA-HEAP | 2 | 4 | Q49, Q50 |
| DSA-QUEUE | 3 | 4 | Q51 |
| DSA-HASH | 3 | 4 | Q52 |

Độ khó toàn bộ: 22 dễ, 26 vừa, 4 khó (trước đó chỉ có 1 câu khó). Câu khó mới: Q43, Q46, Q50.

## Cần đồng bộ thủ công (chưa làm)
Cùng bộ 40 câu còn nằm ở các nơi sau, cần thêm 12 câu mới hoặc tạo lại từ JSON:
- `docs/data/DSA_CO2003_sessions_and_questions_EN.md` (ghi "Total: 40 questions")
- `frontend/app/data/co2003QuestionBank.js`
- `scripts/demo_seed_CO2003.sql`
- Báo cáo: chỗ nào ghi "40 câu hỏi"; số liệu 40 câu trong script seed S1-3 của Hào.
