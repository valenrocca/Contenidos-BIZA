const convert = require('heic-convert');

const SOURCE_URL = 'https://media.42.com.ar/images/IMG_1535.jpg';

let cachedJpeg = null;
let cachedAt = 0;
const CACHE_MS = 24 * 60 * 60 * 1000;

async function getJpegBuffer() {
  const now = Date.now();
  if (cachedJpeg && now - cachedAt < CACHE_MS) {
    return cachedJpeg;
  }

  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Source image unavailable (${response.status})`);
  }

  const heicBuffer = Buffer.from(await response.arrayBuffer());
  const jpegBuffer = await convert({
    buffer: heicBuffer,
    format: 'JPEG',
    quality: 0.92,
  });

  cachedJpeg = Buffer.from(jpegBuffer);
  cachedAt = now;
  return cachedJpeg;
}

async function handleImg1535(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const jpeg = await getJpegBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

    if (req.method === 'HEAD') {
      res.setHeader('Content-Length', jpeg.length);
      res.status(200).end();
      return;
    }

    res.status(200).send(jpeg);
  } catch (error) {
    console.error('IMG_1535 conversion failed:', error);
    res.status(502).json({ error: 'Unable to load image.' });
  }
}

module.exports = handleImg1535;
