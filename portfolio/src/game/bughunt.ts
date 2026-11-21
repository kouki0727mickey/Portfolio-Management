export type Puzzle = {
  id: string;
  language: string;
  lines: string[];
  bugLine: number; // 0 始まり
  hint: string;
  realStory: string;
};
export type BugHuntState = {
  index: number;
  misses: number[]; // misses[i] は i 問目で外した回数
  lastResult: 'hit' | 'miss' | null;
  finished: boolean;
};

export function createBugHunt(puzzles: readonly Puzzle[]): BugHuntState {
  return { index: 0, misses: puzzles.map(() => 0), lastResult: null, finished: false };
}

export function guess(s: BugHuntState, puzzles: readonly Puzzle[], line: number): BugHuntState {
  if (s.finished || s.lastResult === 'hit') return s;
  const puzzle = puzzles[s.index];
  if (!Number.isInteger(line) || line < 0 || line >= puzzle.lines.length) return s;
  if (line === puzzle.bugLine) return { ...s, lastResult: 'hit' };
  const misses = s.misses.slice();
  misses[s.index] += 1;
  return { ...s, misses, lastResult: 'miss' };
}

export function advance(s: BugHuntState, puzzles: readonly Puzzle[]): BugHuntState {
  if (s.finished || s.lastResult !== 'hit') return s;
  if (s.index + 1 >= puzzles.length) return { ...s, lastResult: null, finished: true };
  return { ...s, index: s.index + 1, lastResult: null };
}

export function rank(s: BugHuntState): string {
  const total = s.misses.reduce((a, b) => a + b, 0);
  if (total === 0) return '一緒にレビューしてほしいレベル';
  if (total <= 2) return '現場ならもう直せてます';
  if (total <= 5) return 'いい線いってます';
  return 'バグは手強い。だから仕事になる';
}
