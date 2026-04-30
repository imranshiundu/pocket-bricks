import { cp, mkdir, rm, stat } from 'node:fs/promises';

const out = process.argv[2] || process.env.POCKET_BRICKS_OUT || 'www';
const items = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'src',
  'assets',
  'robots.txt',
];

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const item of items) {
  if (await exists(item)) {
    await cp(item, `${out}/${item}`, { recursive: true });
  }
}

console.log(`Pocket Bricks static assets staged in ${out}/`);
