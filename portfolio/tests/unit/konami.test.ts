import { beforeEach, describe, expect, test, vi } from 'vitest';
import { KONAMI, createKonamiDetector } from '../../src/effects/konami';
import { setNightMode, toggleNightMode } from '../../src/effects/nightmode';

describe('konami', () => {
  test('fires on full sequence', () => {
    const fn = vi.fn();
    const feed = createKonamiDetector(fn);
    KONAMI.forEach(feed);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('wrong key resets but a fresh start still matches', () => {
    const fn = vi.fn();
    const feed = createKonamiDetector(fn);
    ['ArrowUp', 'ArrowUp', 'x', ...KONAMI].forEach(feed);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('repeated ArrowUp prefix still matches', () => {
    const fn = vi.fn();
    const feed = createKonamiDetector(fn);
    ['ArrowUp', ...KONAMI].forEach(feed);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  test('incomplete sequence does not fire', () => {
    const fn = vi.fn();
    const feed = createKonamiDetector(fn);
    KONAMI.slice(0, -1).forEach(feed);
    expect(fn).not.toHaveBeenCalled();
  });
  test('can fire twice in a row', () => {
    const fn = vi.fn();
    const feed = createKonamiDetector(fn);
    [...KONAMI, ...KONAMI].forEach(feed);
    expect(fn).toHaveBeenCalledTimes(2);
  });
  test('uppercase B and A also match', () => {
    const fn = vi.fn();
    const feed = createKonamiDetector(fn);
    [...KONAMI.slice(0, -2), 'B', 'A'].forEach(feed);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('night mode', () => {
  beforeEach(() => document.documentElement.removeAttribute('data-night'));
  test('setNightMode writes data-night', () => {
    setNightMode(true);
    expect(document.documentElement.dataset.night).toBe('true');
    setNightMode(false);
    expect(document.documentElement.dataset.night).toBe('false');
  });
  test('toggleNightMode flips and returns the new state', () => {
    expect(toggleNightMode()).toBe(true);
    expect(toggleNightMode()).toBe(false);
  });
});
