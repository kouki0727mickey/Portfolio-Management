import type { Content } from './types';

export const BANNED_PHRASES: readonly string[] = [
  '情熱', '革新的', 'シームレス', '最先端', 'ワクワク', '価値を提供', 'ソリューション',
  '幅広い', '様々な', '包括的', '堅牢', 'ご覧ください', 'いかがでしたか',
  'passionate', 'cutting-edge', 'seamless', 'leverage', 'robust', 'innovative',
];

const EMOJI = /\p{Extended_Pictographic}/u;

export function findAiTells(text: string): string[] {
  const lower = text.toLowerCase();
  const hits = BANNED_PHRASES.filter((p) => lower.includes(p.toLowerCase()));
  if (EMOJI.test(text)) hits.push('emoji');
  return hits;
}

export function collectText(c: Content): string[] {
  const { profile, skills, projects, stories } = c;
  return [
    profile.name, profile.tagline, profile.about, ...profile.workStyle,
    ...profile.links.map((l) => l.label),
    ...skills.flatMap((s) => [s.label, ...s.items]),
    ...projects.flatMap((p) => [p.title, p.period, p.role, p.summary, ...p.numbers, ...p.stack]),
    ...stories.flatMap((s) => [s.title, s.whatHappened, s.whatILearned]),
  ];
}
