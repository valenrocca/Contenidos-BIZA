const express = require('express');
const handleQuizAnswer = require('./quiz-handler');
const handleQuizStatus = require('./quiz-status');
const handleQuizReset = require('./quiz-reset');
const handleImg1535 = require('./media-img-1535');

const app = express();
const port = process.env.QUIZ_API_PORT || 3001;
const allowedOrigins = new Set(['http://localhost:4200', 'http://127.0.0.1:4200']);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json());
app.get('/api/quiz/status', handleQuizStatus);
app.post('/api/quiz/answer', handleQuizAnswer);
app.post('/api/quiz/reset', handleQuizReset);
app.get('/api/media/img-1535', handleImg1535);

app.listen(port, '127.0.0.1', () => {
  console.log(`Quiz API running at http://127.0.0.1:${port}`);
});
