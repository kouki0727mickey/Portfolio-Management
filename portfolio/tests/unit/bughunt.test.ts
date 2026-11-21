import { describe, expect, test } from 'vitest';
import { advance, createBugHunt, guess, rank, type BugHuntState } from '../../src/game/bughunt';
import { PUZZLES as P } from '../../src/game/puzzles';

const wrongLine = (i: number) => (P[i].bugLine + 1) % P[i].lines.length;

describe('bughunt', () => {
  test('miss increments current puzzle misses', () => {
    const s = guess(createBugHunt(P), P, wrongLine(0));
    expect(s.misses[0]).toBe(1);
    expect(s.lastResult).toBe('miss');
    expect(s.index).toBe(0);
  });
  test('hit sets lastResult and does not advance until advance()', () => {
    const s = guess(createBugHunt(P), P, P[0].bugLine);
    expect(s.lastResult).toBe('hit');
    expect(s.index).toBe(0);
    expect(advance(s, P).index).toBe(1);
    expect(advance(s, P).lastResult).toBeNull();
  });
  test('guess after hit is ignored', () => {
    const s = guess(createBugHunt(P), P, P[0].bugLine);
    expect(guess(s, P, 0)).toEqual(s);
  });
  test('out-of-range and non-integer lines are ignored', () => {
    const s0 = createBugHunt(P);
    expect(guess(s0, P, -1)).toEqual(s0);
    expect(guess(s0, P, 999)).toEqual(s0);
    expect(guess(s0, P, 1.5)).toEqual(s0);
    expect(guess(s0, P, Number.NaN)).toEqual(s0);
  });
  test('advance without a hit is ignored', () => {
    const s0 = createBugHunt(P);
    expect(advance(s0, P)).toEqual(s0);
  });
  test('finishing all puzzles', () => {
    let s = createBugHunt(P);
    for (const p of P) s = advance(guess(s, P, p.bugLine), P);
    expect(s.finished).toBe(true);
    expect(rank(s)).toBe('一緒にレビューしてほしいレベル');
  });
  test('nothing changes after finishing', () => {
    let s = createBugHunt(P);
    for (const p of P) s = advance(guess(s, P, p.bugLine), P);
    expect(guess(s, P, 0)).toEqual(s);
    expect(advance(s, P)).toEqual(s);
  });
  test('puzzles are valid', () => {
    expect(P).toHaveLength(3);
    P.forEach((p) => {
      expect(p.bugLine).toBeGreaterThanOrEqual(0);
      expect(p.bugLine).toBeLessThan(p.lines.length);
    });
  });
  test('rank boundaries by total misses', () => {
    const withMisses = (n: number): BugHuntState => ({ index: 2, misses: [n, 0, 0], lastResult: null, finished: true });
    expect(rank(withMisses(0))).toBe('一緒にレビューしてほしいレベル');
    expect(rank(withMisses(1))).toBe('現場ならもう直せてます');
    expect(rank(withMisses(2))).toBe('現場ならもう直せてます');
    expect(rank(withMisses(3))).toBe('いい線いってます');
    expect(rank(withMisses(5))).toBe('いい線いってます');
    expect(rank(withMisses(6))).toBe('バグは手強い。だから仕事になる');
  });
});
