export type Link = { label: string; url: string };
export type Profile = {
  name: string;
  tagline: string;
  about: string;
  workStyle: string[];
  email: string;
  links: Link[];
};
export type SkillGroup = { label: string; items: string[] };
export type Project = {
  id: string;
  title: string;
  period: string;
  role: string;
  summary: string;
  numbers: string[];
  stack: string[];
  image?: string;
  url?: string;
};
export type Story = { id: string; title: string; whatHappened: string; whatILearned: string };
export type Content = {
  profile: Profile;
  skills: SkillGroup[];
  projects: Project[];
  stories: Story[];
};
