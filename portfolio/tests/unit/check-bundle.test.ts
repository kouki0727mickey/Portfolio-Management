import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
// @ts-expect-error plain .mjs script without type declarations
import { LIMIT_BYTES, checkBundle, gzipTotal } from '../../scripts/check-bundle.mjs';

function distWith(files: Record<string, Buffer | string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'bundle-'));
  mkdirSync(join(dir, 'assets'));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, 'assets', name), body);
  return dir;
}

describe('check-bundle', () => {
  test('limit is 100KB', () => {
    expect(LIMIT_BYTES).toBe(102400);
  });
  test('gzipTotal sums gzip size of every js file and ignores other files', () => {
    const dir = distWith({ 'a.js': 'x'.repeat(5000), 'b.js': 'y'.repeat(5000), 'a.css': randomBytes(50000) });
    const total = gzipTotal(dir);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThan(200);
  });
  test('small bundle passes', () => {
    const dir = distWith({ 'a.js': 'console.log(1)' });
    expect(checkBundle(dir).ok).toBe(true);
  });
  test('incompressible bundle over the limit fails and reports size', () => {
    const dir = distWith({ 'big.js': randomBytes(LIMIT_BYTES + 5000) });
    const r = checkBundle(dir);
    expect(r.ok).toBe(false);
    expect(r.size).toBeGreaterThan(LIMIT_BYTES);
  });
  test('missing assets directory is a failure, not a pass', () => {
    const dir = mkdtempSync(join(tmpdir(), 'empty-'));
    expect(checkBundle(dir).ok).toBe(false);
  });
});
