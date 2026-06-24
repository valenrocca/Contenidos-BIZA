const { getClientIp } = require('./quiz-ip');
const {
  claimFirstWinner,
  getMaxAttempts,
  getAttemptCount,
  hasExceededAttempts,
  incrementAttemptCount,
  isQuizClosed,
} = require('./quiz-state');

async function handleQuizAnswer(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const maxAttempts = getMaxAttempts();

  try {
    if (await isQuizClosed()) {
      res.status(200).json({
        result: 'late',
        closed: true,
        attemptsUsed: await getAttemptCount(ip),
        maxAttempts,
        attemptsRemaining: 0,
      });
      return;
    }

    if (await hasExceededAttempts(ip)) {
      res.status(200).json({
        result: 'late',
        attemptsExceeded: true,
        attemptsUsed: await getAttemptCount(ip),
        maxAttempts,
        attemptsRemaining: 0,
      });
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

  if (hours === undefined || minutes === undefined || seconds === undefined) {
    res.status(400).json({ error: 'Time is required.' });
    return;
  }

  const submittedTime = formatSubmittedTime(hours, minutes, seconds);
  if (!submittedTime) {
    res.status(400).json({ error: 'Invalid time.' });
    return;
  }

  const isIncorrect = date !== correctDate || submittedTime !== correctTime;
  const reason = date !== correctDate ? 'date' : submittedTime !== correctTime ? 'time' : undefined;

  if (isIncorrect) {
    const attemptsUsed = await incrementAttemptCount(ip);
    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

    if (attemptsUsed >= maxAttempts) {
      res.status(200).json({
        result: 'late',
        attemptsExceeded: true,
        attemptsUsed,
        maxAttempts,
        attemptsRemaining: 0,
      });
      return;
    }

    res.status(200).json({
      result: 'incorrect',
      reason,
      attemptsUsed,
      maxAttempts,
      attemptsRemaining,
    });
    return;
  }

  try {
    const attemptsUsed = await incrementAttemptCount(ip);
    const result = await claimFirstWinner();
    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

    res.status(200).json({
      result,
      closed: result === 'winner',
      attemptsUsed,
      maxAttempts,
      attemptsRemaining,
    });
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
