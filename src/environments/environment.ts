export const environment = {
  production: false,
  /** Cloudflare R2 / CDN base URL. Empty = same-origin /assets (local dev). */
  mediaCdnUrl: 'https://media.42.com.ar',
  /** Local Express API. Empty in production (same-origin /api). */
  apiBaseUrl: 'http://127.0.0.1:3001',
  /** Prize contact email for quiz winner mailto button. */
  quizContactEmail: 'contacto.bizarrap@daleplay.la',
  /** Terms PDF for quiz winner acceptance. */
  quizTermsPdfUrl: '/assets/terminos-y-condiciones.pdf',
};
