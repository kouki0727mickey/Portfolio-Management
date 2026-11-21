import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const yml = readFileSync(join(process.cwd(), '..', '.github', 'workflows', 'portfolio.yml'), 'utf8');
const at = (needle: string) => {
  const i = yml.indexOf(needle);
  expect(i, `${needle} should be in the workflow`).toBeGreaterThanOrEqual(0);
  return i;
};

describe('portfolio workflow', () => {
  test('runs on main pushes that touch portfolio only', () => {
    expect(yml).toMatch(/branches:\s*\[main\]/);
    expect(yml).toContain("'portfolio/**'");
  });
  test('verifies before building, and builds before deploying', () => {
    const order = [
      'npm ci',
      'npm test',
      'playwright install',
      'npm run e2e',
      'npm run check:content',
      'npm run build',
      'npm run check:bundle',
      'upload-pages-artifact',
      'deploy-pages',
    ].map(at);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
  test('deploys the portfolio dist folder', () => {
    expect(yml).toContain('path: portfolio/dist');
  });
  test('has the permissions Pages needs', () => {
    expect(yml).toMatch(/pages:\s*write/);
    expect(yml).toMatch(/id-token:\s*write/);
  });
});
