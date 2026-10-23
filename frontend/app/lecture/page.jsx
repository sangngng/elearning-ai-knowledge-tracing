import Link from 'next/link';
export default function Lecture() {
  return (
    <>
      <div className="card">
        <h2>Bài 3: Cây nhị phân tìm kiếm</h2>
        <div style={{ background: '#222', color: '#aaa', height: 280, borderRadius: 8, display: 'grid', placeItems: 'center' }}>
          [Khung video bài giảng]
        </div>
      </div>
      <div className="card">
        <h3>Nội dung</h3>
        <p>Cây nhị phân tìm kiếm (BST) là cây nhị phân trong đó mọi nút ở cây con trái có khóa nhỏ hơn nút gốc, và mọi nút ở cây con phải có khóa lớn hơn.</p>
        <p>Các thao tác cơ bản: tìm kiếm, chèn, xóa. Độ phức tạp trung bình O(log n).</p>
        <Link className="btn" href="/quiz">Làm bài kiểm tra</Link>
      </div>
    </>
  );
}
