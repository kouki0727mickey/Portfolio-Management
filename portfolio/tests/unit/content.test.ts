import { describe, expect, test } from 'vitest';
import { content } from '../../src/content';
import { collectText, findAiTells } from '../../src/content/lint';

describe('content', () => {
  test('contains no AI tells', () => {
    const hits = collectText(content).flatMap((t) =>
      findAiTells(t).map((h) => `${h}: ${t.slice(0, 30)}`),
    );
    expect(hits).toEqual([]);
  });
  test('project ids are unique and url-safe', () => {
    const ids = content.projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9-]+$/));
  });
  test('every project has at least one number', () => {
    content.projects.forEach((p) => expect(p.numbers.length).toBeGreaterThan(0));
  });
});
