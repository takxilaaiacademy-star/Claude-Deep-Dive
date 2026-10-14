// Warns when picture files are Git LFS "pointer" text files instead of real images.
// That is why screenshots show a placeholder: the repo stores PNGs in Git LFS and a plain
// zip download only contains the ~130 byte pointers. Fix: run `git lfs pull` (see README-IMAGES.md).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../public/images/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const bad = [];
let total = 0;
for (const f of readdirSync(dir)) {
  if (!/\.(png|jpe?g|webp|gif)$/i.test(f)) continue;
  total++;
  const p = join(dir, f);
  if (statSync(p).size < 400 && readFileSync(p, 'utf8').startsWith('version https://git-lfs')) bad.push(f);
}
if (bad.length) {
  console.warn(`\n⚠  ${bad.length} of ${total} images are Git LFS pointers, not real pictures:`);
  console.warn('   ' + bad.slice(0, 6).join(', ') + (bad.length > 6 ? ', …' : ''));
  console.warn('   The course will show the designed fallback card for them.');
  console.warn('   Fix: in your original git clone run  git lfs install && git lfs pull,');
  console.warn('   then copy the real files into public/images/  (details: README-IMAGES.md)\n');
} else {
  console.log(`✓ ${total} images look good.`);
}
