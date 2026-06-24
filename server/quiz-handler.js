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
  const correctTime = process.env.QUIZ_CORRECT_TIME ?? '21:08:37';

  const { date, hours, minutes, seconds } = req.body ?? {};
  if (!date || typeof date !== 'string') {
    res.status(400).json({ error: 'Date is required.' });
    return;
  }

  if (
    hours === undefined ||
    minutes === undefined ||
    seconds === undefined
  ) {
    res.status(400).json({ error: 'Time is required.' });
    return;
  }

  const submittedTime = formatSubmittedTime(hours, minutes, seconds);
  if (!submittedTime) {
    res.status(400).json({ error: 'Invalid time.' });
    return;
  }

  if (date !== correctDate) {
    res.status(200).json({ result: 'incorrect', reason: 'date' });
    return;
  }

  if (submittedTime !== correctTime) {
    res.status(200).json({ result: 'incorrect', reason: 'time' });
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

function formatSubmittedTime(hours, minutes, seconds) {
  const h = parseTimePart(hours, 23);
  const m = parseTimePart(minutes, 59);
  const s = parseTimePart(seconds, 59);

  if (h === null || m === null || s === null) {
    return null;
  }

  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function parseTimePart(value, max) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0 || num > max) {
    return null;
  }
  return num;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}
