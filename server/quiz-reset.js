const { resetQuizState } = require('./quiz-state');

async function handleQuizReset(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (process.env.VERCEL === '1') {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  try {
    await resetQuizState();
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Quiz reset failed:', error);
    res.status(500).json({ error: 'Unable to reset quiz.' });
  }
}

module.exports = handleQuizReset;
