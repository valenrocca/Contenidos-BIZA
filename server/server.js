const express = require('express');
const path = require('path');

const handleQuizAnswer = require('./quiz-handler');
const handleQuizStatus = require('./quiz-status');
const handleQuizReset = require('./quiz-reset');
const handleImg1535 = require('./media-img-1535');

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, '..', 'dist', 'contenidos-biza', 'browser');

const ONE_YEAR = 31536000;

app.use(express.json());
app.get('/api/quiz/status', handleQuizStatus);
app.post('/api/quiz/answer', handleQuizAnswer);
app.post('/api/quiz/reset', handleQuizReset);
app.get('/api/media/img-1535', handleImg1535);

app.use(
  express.static(distPath, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return;
      }
      res.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);
    },
  }),
);

app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
