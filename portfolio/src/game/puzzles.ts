import type { Puzzle } from './bughunt';

export const PUZZLES: readonly Puzzle[] = [
  {
    id: 'off-by-one',
    language: 'TypeScript',
    lines: [
      'function total(prices: number[]): number {',
      '  let sum = 0;',
      '  for (let i = 0; i <= prices.length; i++) {',
      '    sum += prices[i];',
      '  }',
      '  return sum;',
      '}',
    ],
    bugLine: 2,
    hint: '【仮】ループの終わりを見てみる。',
    realStory: '【仮】実際に遭遇した似たバグの話を 1〜2 行で。',
  },
  {
    id: 'mutable-default',
    language: 'Python',
    lines: [
      'def add_tag(tag, tags=[]):',
      '    tags.append(tag)',
      '    return tags',
      '',
      'a = add_tag("new")',
      'b = add_tag("sale")',
    ],
    bugLine: 0,
    hint: '【仮】呼ぶたびに同じ物が使われていないか。',
    realStory: '【仮】実際に遭遇した似たバグの話を 1〜2 行で。',
  },
  {
    id: 'assign-in-if',
    language: 'JavaScript',
    lines: [
      'function canDelete(user) {',
      "  if (user.role = 'admin') {",
      '    return true;',
      '  }',
      '  return false;',
      '}',
    ],
    bugLine: 1,
    hint: '【仮】= の数を数えてみる。',
    realStory: '【仮】実際に遭遇した似たバグの話を 1〜2 行で。',
  },
];
