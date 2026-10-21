// Marks the `bin` entries of package.json as executable after the build.
//
// Usage: node scripts/make-executable.mjs

import { chmodSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const { bin } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const files = typeof bin === 'string' ? [bin] : Object.values(bin ?? {});

for (const file of files) {
  chmodSync(new URL(file, root), 0o755);
}
