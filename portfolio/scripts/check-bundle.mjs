import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

export const LIMIT_BYTES = 102400; // 100KB

export function gzipTotal(distDir) {
  const assets = join(distDir, 'assets');
  if (!existsSync(assets)) throw new Error(`${assets} がありません。先に npm run build を実行してください`);
  return readdirSync(assets)
    .filter((f) => f.endsWith('.js'))
    .reduce((sum, f) => sum + gzipSync(readFileSync(join(assets, f))).length, 0);
}

export function checkBundle(distDir) {
  try {
    const size = gzipTotal(distDir);
    return { ok: size <= LIMIT_BYTES, size };
  } catch (err) {
    return { ok: false, size: 0, error: err.message };
  }
}

function main() {
  const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  const r = checkBundle(dist);
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  const kb = (r.size / 1024).toFixed(1);
  if (!r.ok) {
    console.error(`JS が gzip 後 ${kb}KB で、上限 ${LIMIT_BYTES / 1024}KB を超えています`);
    process.exit(1);
  }
  console.log(`JS は gzip 後 ${kb}KB（上限 ${LIMIT_BYTES / 1024}KB）`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
