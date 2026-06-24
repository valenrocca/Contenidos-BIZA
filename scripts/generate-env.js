const fs = require('fs');
const path = require('path');

const mediaCdnUrl = (process.env.MEDIA_CDN_URL ?? 'https://media.42.com.ar').replace(/\/$/, '');
const quizContactEmail = process.env.QUIZ_CONTACT_EMAIL ?? 'contacto.bizarrap@daleplay.la';
const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

const content = `export const environment = {
  production: true,
  mediaCdnUrl: '${mediaCdnUrl}',
  apiBaseUrl: '',
  quizContactEmail: '${quizContactEmail}',
};
`;

fs.writeFileSync(envPath, content, 'utf8');
console.log(
  mediaCdnUrl
    ? `Production CDN URL set: ${mediaCdnUrl}`
    : 'Warning: MEDIA_CDN_URL is not set — screen media will 404 in production.',
);

if (!quizContactEmail) {
  console.log('Warning: QUIZ_CONTACT_EMAIL is not set — winner button will use a placeholder.');
}
