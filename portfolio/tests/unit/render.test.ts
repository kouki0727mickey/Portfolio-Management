import { describe, expect, test } from 'vitest';
import { content } from '../../src/content';
import { renderPanel } from '../../src/panel/render';

describe('renderPanel', () => {
  test('escapes content', () => {
    const c = structuredClone(content);
    c.profile.about = '<img src=x onerror=alert(1)>';
    const { html } = renderPanel({ kind: 'panel', panel: 'about' }, c);
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img');
  });
  test('project list links to detail hashes', () => {
    const { html } = renderPanel({ kind: 'panel', panel: 'projects' }, content);
    content.projects.forEach((p) => expect(html).toContain(`href="#/projects/${p.id}"`));
  });
  test('project detail shows numbers and stack', () => {
    const p = content.projects[0];
    const { title, html } = renderPanel({ kind: 'panel', panel: 'projects', itemId: p.id }, content);
    expect(title).toBe(p.title);
    p.numbers.forEach((n) => expect(html).toContain(n));
    p.stack.forEach((s) => expect(html).toContain(s));
  });
  test('story detail shows both sections', () => {
    const s = content.stories[0];
    const { html } = renderPanel({ kind: 'panel', panel: 'stories', itemId: s.id }, content);
    expect(html).toContain(s.whatHappened);
    expect(html).toContain(s.whatILearned);
  });
  test('skills lists every group', () => {
    const { html } = renderPanel({ kind: 'panel', panel: 'skills' }, content);
    content.skills.forEach((g) => expect(html).toContain(g.label));
  });
  test('contact has mailto', () => {
    const { html } = renderPanel({ kind: 'panel', panel: 'contact' }, content);
    expect(html).toContain(`href="mailto:${content.profile.email}"`);
  });
  test('bughunt returns mount point', () => {
    const { html } = renderPanel({ kind: 'panel', panel: 'bughunt' }, content);
    expect(html).toContain('id="bughunt-root"');
  });
});
