import { cp, mkdir, rm } from 'node:fs/promises';

const out = 'www';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const item of ['index.html', 'manifest.webmanifest', 'sw.js', 'src', 'assets']) {
  await cp(item, `${out}/${item}`, { recursive: true });
}

console.log('Android web assets staged in www/');
