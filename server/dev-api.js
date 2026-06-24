const express = require('express');
const handleQuizAnswer = require('./quiz-handler');
const handleQuizStatus = require('./quiz-status');
const handleQuizReset = require('./quiz-reset');
const handleImg1535 = require('./media-img-1535');

const app = express();
const port = process.env.QUIZ_API_PORT || 3001;

app.use(express.json());
app.get('/api/quiz/status', handleQuizStatus);
app.post('/api/quiz/answer', handleQuizAnswer);
app.post('/api/quiz/reset', handleQuizReset);
app.get('/api/media/img-1535', handleImg1535);

app.listen(port, () => {
  console.log(`Quiz API running at http://localhost:${port}`);
});
