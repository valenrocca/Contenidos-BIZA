const { isQuizClosed } = require('./quiz-state');

async function handleQuizStatus(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const closed = await isQuizClosed();
    res.status(200).json({ closed });
  } catch (error) {
    console.error('Quiz status failed:', error);
    res.status(500).json({ error: 'Unable to load quiz status.' });
  }
}

module.exports = handleQuizStatus;
