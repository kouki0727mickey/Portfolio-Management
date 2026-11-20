import type { Profile, SkillGroup } from './types';

export const profile: Profile = {
  name: '【仮】名前',
  tagline: '【仮】何をする人かを一文で',
  about: '【仮】自己紹介。自分の言葉で書く。',
  workStyle: ['【仮】仕事の進め方その1', '【仮】仕事の進め方その2'],
  // 【仮】公開前に本物のメールアドレスへ置き換える
  email: 'you@example.com',
  links: [{ label: '【仮】GitHub', url: 'https://github.com/' }],
};

export const skills: SkillGroup[] = [
  { label: '【仮】言語', items: ['【仮】TypeScript', '【仮】Python'] },
  { label: '【仮】道具', items: ['【仮】Docker', '【仮】PostgreSQL'] },
];
