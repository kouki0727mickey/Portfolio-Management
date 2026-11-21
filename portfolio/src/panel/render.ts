import type { Content, Link } from '../content/types';
import type { PanelId, Route } from '../router';
import { escapeHtml as e } from '../util/escape';

type PanelRoute = Extract<Route, { kind: 'panel' }>;

const TITLES: Record<PanelId, string> = {
  projects: '制作実績',
  about: '自己紹介',
  skills: 'スキル',
  stories: 'やらかし帳',
  contact: '連絡先',
  bughunt: 'バグ探し',
};

const list = (items: string[], cls = '') =>
  `<ul class="${cls}">${items.map((i) => `<li>${e(i)}</li>`).join('')}</ul>`;

const link = (l: Link) => `<li><a href="${e(l.url)}" target="_blank" rel="noopener">${e(l.label)}</a></li>`;

export function renderPanel(route: PanelRoute, c: Content): { title: string; html: string } {
  switch (route.panel) {
    case 'projects': {
      const p = c.projects.find((x) => x.id === route.itemId);
      if (p) {
        return {
          title: p.title,
          html: `<p class="meta">${e(p.period)} / ${e(p.role)}</p>
<p>${e(p.summary)}</p>
${list(p.numbers, 'numbers')}
<p class="stack">${p.stack.map((s) => `<span>${e(s)}</span>`).join('')}</p>
${p.image ? `<img src="${e(p.image)}" alt="${e(p.title)}" />` : ''}
${p.url ? `<p><a href="${e(p.url)}" target="_blank" rel="noopener">見に行く</a></p>` : ''}
<p><a href="#/projects">一覧に戻る</a></p>`,
        };
      }
      return {
        title: TITLES.projects,
        html: `<ul class="index">${c.projects
          .map(
            (x) =>
              `<li><a href="#/projects/${e(x.id)}"><strong>${e(x.title)}</strong><span>${e(x.period)} / ${e(x.role)}</span></a></li>`,
          )
          .join('')}</ul>`,
      };
    }
    case 'about':
      return {
        title: TITLES.about,
        html: `<p class="lead">${e(c.profile.tagline)}</p><p>${e(c.profile.about)}</p>${list(c.profile.workStyle)}`,
      };
    case 'skills':
      return {
        title: TITLES.skills,
        html: c.skills.map((g) => `<h3>${e(g.label)}</h3>${list(g.items)}`).join(''),
      };
    case 'stories': {
      const s = c.stories.find((x) => x.id === route.itemId);
      if (s) {
        return {
          title: s.title,
          html: `<h3>何が起きたか</h3><p>${e(s.whatHappened)}</p><h3>何を学んだか</h3><p>${e(s.whatILearned)}</p><p><a href="#/stories">一覧に戻る</a></p>`,
        };
      }
      return {
        title: TITLES.stories,
        html: `<ul class="index">${c.stories
          .map((x) => `<li><a href="#/stories/${e(x.id)}"><strong>${e(x.title)}</strong></a></li>`)
          .join('')}</ul>`,
      };
    }
    case 'contact':
      return {
        title: TITLES.contact,
        html: `<p><a class="mail" href="mailto:${e(c.profile.email)}">${e(c.profile.email)}</a></p><ul>${c.profile.links.map(link).join('')}</ul>`,
      };
    case 'bughunt':
      return { title: TITLES.bughunt, html: '<div id="bughunt-root"></div>' };
  }
}
