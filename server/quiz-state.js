const WINNER_KEY = 'quiz:first-winner';

let devWinnerClaimed = false;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  const { Redis } = require('@upstash/redis');
  return new Redis({ url, token });
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
