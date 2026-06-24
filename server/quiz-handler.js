const { claimFirstWinner, isQuizClosed } = require('./quiz-state');

async function handleQuizAnswer(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    if (await isQuizClosed()) {
      res.status(200).json({ result: 'late', closed: true });
      return;
    }
  } catch (error) {
    console.error('Quiz closed check failed:', error);
    res.status(500).json({ error: 'Unable to process your answer. Please try again.' });
    return;
  }

  const correctDate = process.env.QUIZ_CORRECT_DATE ?? '2021-05-15';

  const { date } = req.body ?? {};
  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Date is required.' });
    return;
  }

  if (date !== correctDate) {
    res.status(200).json({ result: 'incorrect' });
    return;
  }

  try {
    const result = await claimFirstWinner();
    res.status(200).json({ result, closed: result === 'winner' });
  } catch (error) {
    console.error('Quiz claim failed:', error);
    res.status(500).json({ error: 'Unable to process your answer. Please try again.' });
  }
}

module.exports = handleQuizAnswer;
