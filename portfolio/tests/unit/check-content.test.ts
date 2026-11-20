import { describe, expect, test } from 'vitest';
// @ts-expect-error plain .mjs script without type declarations
import { findPlaceholders } from '../../scripts/check-content.mjs';

describe('findPlaceholders', () => {
  test('returns 1-based line numbers containing the placeholder marker', () => {
    const text = ['const a = 1;', "title: '【仮】実績'", '', "// 【仮】あとで"].join('\n');
    expect(findPlaceholders(text)).toEqual([2, 4]);
  });
  test('returns empty array when no placeholders remain', () => {
    expect(findPlaceholders("title: '決済画面の離脱率を下げた'")).toEqual([]);
  });
});
