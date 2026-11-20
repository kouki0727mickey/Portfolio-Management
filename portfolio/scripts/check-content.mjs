import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';

const MARKER = '【仮】';

export function findPlaceholders(text) {
  return text
    .split('\n')
    .flatMap((line, i) => (line.includes(MARKER) ? [i + 1] : []));
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dirs = ['src/content', 'src/game'];
  const files = dirs
    .map((d) => join(root, d))
    .filter(existsSync)
    .flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.ts')).map((f) => join(d, f)));

  const problems = files.flatMap((f) =>
    findPlaceholders(readFileSync(f, 'utf8')).map((n) => `${relative(root, f)}:${n}`),
  );

  if (problems.length > 0) {
    console.error(`${MARKER} が ${problems.length} か所に残っています:`);
    problems.forEach((p) => console.error(`  ${p}`));
    process.exit(1);
  }
  console.log('プレースホルダーは残っていません');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
