const WINNER_KEY = 'quiz:first-winner';
const ATTEMPTS_KEY_PREFIX = 'quiz:attempts:';

let devWinnerClaimed = false;
const devAttempts = new Map();

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  const { Redis } = require('@upstash/redis');
  return new Redis({ url, token });
}

function getMaxAttempts() {
  const max = Number(process.env.QUIZ_MAX_ATTEMPTS ?? 1);
  return Number.isInteger(max) && max > 0 ? max : 1;
}

function attemptsKey(ip) {
  return `${ATTEMPTS_KEY_PREFIX}${ip}`;
}

async function getAttemptCount(ip) {
  const redis = getRedis();
  if (redis) {
    const count = await redis.get(attemptsKey(ip));
    return count ? Number(count) : 0;
  }
  return devAttempts.get(ip) ?? 0;
}

async function incrementAttemptCount(ip) {
  const redis = getRedis();
  if (redis) {
    return redis.incr(attemptsKey(ip));
  }

  const next = (devAttempts.get(ip) ?? 0) + 1;
  devAttempts.set(ip, next);
  return next;
}

async function hasExceededAttempts(ip) {
  return (await getAttemptCount(ip)) >= getMaxAttempts();
}

async function getAttemptStatus(ip) {
  const attemptsUsed = await getAttemptCount(ip);
  const maxAttempts = getMaxAttempts();
  return {
    attemptsUsed,
    maxAttempts,
    attemptsRemaining: Math.max(0, maxAttempts - attemptsUsed),
    attemptsExceeded: attemptsUsed >= maxAttempts,
  };
}

async function isQuizClosed() {
  const redis = getRedis();
  if (redis) {
    const winner = await redis.get(WINNER_KEY);
    return winner !== null;
  }
  return devWinnerClaimed;
}

async function claimFirstWinner() {
  const redis = getRedis();
  if (redis) {
    const claimed = await redis.set(WINNER_KEY, Date.now(), { nx: true });
    return claimed ? 'winner' : 'late';
  }

  if (!devWinnerClaimed) {
    devWinnerClaimed = true;
    return 'winner';
  }

  return 'late';
}

async function resetQuizState() {
  const redis = getRedis();
  if (redis) {
    await redis.del(WINNER_KEY);
    return;
  }

  devWinnerClaimed = false;
  devAttempts.clear();
}

module.exports = {
  claimFirstWinner,
  getAttemptCount,
  getAttemptStatus,
  getMaxAttempts,
  hasExceededAttempts,
  incrementAttemptCount,
  isQuizClosed,
  resetQuizState,
};
