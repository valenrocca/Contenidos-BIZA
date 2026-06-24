const express = require('express');
const handleQuizAnswer = require('./quiz-handler');
const handleQuizStatus = require('./quiz-status');

const app = express();
const port = process.env.QUIZ_API_PORT || 3001;

app.use(express.json());
app.get('/api/quiz/status', handleQuizStatus);
app.post('/api/quiz/answer', handleQuizAnswer);

app.listen(port, () => {
  console.log(`Quiz API running at http://localhost:${port}`);
});
