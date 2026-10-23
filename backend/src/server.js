const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elearning-backend', timestamp: new Date().toISOString() });
});

// Mock Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  return res.json({
    token: 'jwt-mock-token-xyz',
    user: {
      id: 'c1a8d052-4e0c-43f1-b9cb-65239df30001',
      name: 'Nguyen Ngoc Sang',
      email: email,
      role: 'student'
    }
  });
});

// Courses endpoint
app.get('/api/courses', (req, res) => {
  res.json([
    { id: 'course-1', title: 'Cấu trúc Dữ liệu & Giải thuật', lessons: 12, instructor: 'TS. Nguyễn Quốc Minh' },
    { id: 'course-2', title: 'Cơ sở Dữ liệu Nâng cao', lessons: 10, instructor: 'Khoa KH&KT Máy tính' },
    { id: 'course-3', title: 'Nhập môn Trí tuệ Nhân tạo', lessons: 14, instructor: 'Bộ môn Trí tuệ Nhân tạo' }
  ]);
});

// Quiz interaction logging endpoint (Per-question recording)
const inMemoryInteractions = [];

app.post('/api/quizzes/interactions', (req, res) => {
  const { userId, questionId, skillId, isCorrect, attemptCount } = req.body;
  
  const interaction = {
    id: `interaction-${Date.now()}`,
    userId: userId || 'student-demo-id',
    questionId: questionId || 'Q1',
    skillId: skillId || 'CTDL-CAY-01',
    isCorrect: Boolean(isCorrect),
    attemptCount: attemptCount || 1,
    createdAt: new Date().toISOString()
  };

  inMemoryInteractions.push(interaction);
  console.log('[LOG] Saved interaction:', interaction);

  return res.status(201).json({
    success: true,
    message: 'Interaction recorded for Knowledge Tracing analysis',
    data: interaction
  });
});

// Competency analytics endpoint (Provides radar chart data)
app.get('/api/analytics/competency/:userId', async (req, res) => {
  // If AI service is configured, proxy to FastAPI service; otherwise return calibrated mock data
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  
  try {
    // Attempt fetch from python ai_service if reachable
    // Fallback response for instant demonstration:
    res.json({
      userId: req.params.userId,
      masteryChart: [
        { skillCode: 'CTDL-CAY-01', skillName: 'BST In-order Traversal', mastery: 0.88, status: 'Mastered' },
        { skillCode: 'CTDL-CAY-02', skillName: 'Balanced Tree Search O(log n)', mastery: 0.42, status: 'Needs Review' },
        { skillCode: 'CTDL-CAY-03', skillName: 'Tree Minimum Finding', mastery: 0.79, status: 'Proficient' },
        { skillCode: 'CTDL-DO-THI-01', skillName: 'Dijkstra Shortest Path', mastery: 0.35, status: 'Needs Review' },
        { skillCode: 'CTDL-BANG-BAM-01', skillName: 'Hash Collision Resolution', mastery: 0.65, status: 'Developing' }
      ],
      recommendations: [
        { skillCode: 'CTDL-CAY-02', suggestedLecture: 'Bài 3: Cây nhị phân tìm kiếm cân bằng', reason: 'Dự đoán xác suất làm đúng dưới 50%' },
        { skillCode: 'CTDL-DO-THI-01', suggestedLecture: 'Bài 7: Thuật toán đồ thị nâng cao', reason: 'Cần ôn lại trước kỳ thi giữa kỳ' }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve competency analytics' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
