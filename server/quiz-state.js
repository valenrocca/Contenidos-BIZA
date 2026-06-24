const WINNER_KEY = 'quiz:first-winner';

let devWinnerClaimed = false;

function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }
  const { Redis } = require('@upstash/redis');
  return Redis.fromEnv();
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
}

module.exports = { isQuizClosed, claimFirstWinner, resetQuizState };
