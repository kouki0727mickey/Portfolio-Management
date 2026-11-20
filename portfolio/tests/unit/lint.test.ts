import { describe, expect, test } from 'vitest';
import { findAiTells } from '../../src/content/lint';

describe('findAiTells', () => {
  test('detects banned phrases', () => {
    expect(findAiTells('情熱を持って最先端の開発をしています')).toEqual(['情熱', '最先端']);
  });
  test('detects English phrases case-insensitively', () => {
    expect(findAiTells('We Leverage robust tools')).toEqual(['leverage', 'robust']);
  });
  test('detects emoji', () => {
    expect(findAiTells('よろしくお願いします🚀')).toEqual(['emoji']);
  });
  test('clean text passes', () => {
    expect(findAiTells('3か月で決済画面の離脱率を 42% から 18% に下げた')).toEqual([]);
  });
});
