const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'background');
const lfsMarker = 'version https://git-lfs.github.com/spec/v1';

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.name !== '.gitkeep') {
      files.push(fullPath);
    }
  }
  return files;
}

const mediaFiles = walk(assetsDir);
const pointers = mediaFiles.filter((file) => {
  const content = fs.readFileSync(file, 'utf8');
  return content.startsWith(lfsMarker);
});

if (pointers.length > 0) {
  console.error('Git LFS pointer files detected (Vercel cannot serve these):');
  pointers.forEach((file) => console.error(`  - ${path.relative(process.cwd(), file)}`));
  console.error('\nRun locally: git lfs pull');
  console.error('Then re-add assets without LFS and push again.');
  process.exit(1);
}

console.log(`Verified ${mediaFiles.length} media file(s) are real binaries.`);
