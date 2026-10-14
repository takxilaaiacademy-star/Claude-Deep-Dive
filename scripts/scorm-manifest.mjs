// Run after `vite build`: rewrites dist/imsmanifest.xml so it lists every built file (SCORM 1.2).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [relative(dist, p).split('\\').join('/')];
  });
const files = walk(dist).filter((f) => f !== 'imsmanifest.xml');
const xml = readFileSync(join(dist, 'imsmanifest.xml'), 'utf8').replace(
  /(<resource [^>]*>)[\s\S]*?(<\/resource>)/,
  `$1\n${files.map((f) => `      <file href="${f}" />`).join('\n')}\n    $2`,
);
writeFileSync(join(dist, 'imsmanifest.xml'), xml);
console.log(`imsmanifest.xml lists ${files.length} files. Zip the contents of dist/ and upload to your LMS.`);
