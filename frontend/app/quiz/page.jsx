'use client';
import { useState } from 'react';
const QUESTIONS = [
  { id: 'Q1', skill: 'CTDL-CAY-01', text: 'Duyệt in-order một BST cho dãy có tính chất gì?', options: ['Giảm dần', 'Tăng dần', 'Ngẫu nhiên', 'Theo mức'], answer: 1 },
  { id: 'Q2', skill: 'CTDL-CAY-02', text: 'Độ phức tạp trung bình của tìm kiếm trong BST cân bằng?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], answer: 2 },
  { id: 'Q3', skill: 'CTDL-CAY-03', text: 'Nút nhỏ nhất của BST nằm ở đâu?', options: ['Gốc', 'Lá phải nhất', 'Con phải của gốc', 'Con trái nhất'], answer: 3 },
];
const L = ['A', 'B', 'C', 'D'];
export default function Quiz() {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [log, setLog] = useState([]); // ghi nhận từng câu
  const done = i >= QUESTIONS.length;
  const q = QUESTIONS[i];
  const submit = () => {
    const rec = { questionId: q.id, skill: q.skill, chosen: sel, correct: sel === q.answer, at: new Date().toISOString() };
    setLog([...log, rec]);
    setSubmitted(true);
    // TODO: fetch('/api/answers', { method: 'POST', body: JSON.stringify(rec) })
  };
  const next = () => { setI(i + 1); setSel(null); setSubmitted(false); };
  if (done) {
    const score = log.filter(r => r.correct).length;
    return <div className="card"><h2>Hoàn thành!</h2><p>Điểm: {score}/{QUESTIONS.length}</p></div>;
  }
  const cls = k => submitted ? (k === q.answer ? 'opt ok' : k === sel ? 'opt bad' : 'opt') : (k === sel ? 'opt sel' : 'opt');
  return (
    <div className="card">
      <p className="muted">Câu {i + 1}/{QUESTIONS.length}</p>
      <h3>{q.text}</h3>
      {q.options.map((o, k) => (
        <button key={k} className={cls(k)} disabled={submitted} onClick={() => setSel(k)}>
          <b>{L[k]}.</b> {o}
        </button>
      ))}
      {!submitted
        ? <button className="btn" disabled={sel === null} onClick={submit}>Nộp câu</button>
        : <button className="btn" onClick={next}>Câu tiếp theo</button>}
    </div>
  );
}
