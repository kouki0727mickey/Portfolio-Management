import { describe, expect, test } from 'vitest';
import { content } from '../../src/content';
import { parseHash, toHash, type Route } from '../../src/router';

describe('router', () => {
  test('empty and root hash are desk', () => {
    expect(parseHash('', content)).toEqual({ kind: 'desk' });
    expect(parseHash('#/', content)).toEqual({ kind: 'desk' });
  });
  test('panel hash', () => {
    expect(parseHash('#/skills', content)).toEqual({ kind: 'panel', panel: 'skills' });
  });
  test('project detail hash', () => {
    const id = content.projects[0].id;
    expect(parseHash(`#/projects/${id}`, content)).toEqual({ kind: 'panel', panel: 'projects', itemId: id });
  });
  test('story detail hash', () => {
    const id = content.stories[0].id;
    expect(parseHash(`#/stories/${id}`, content)).toEqual({ kind: 'panel', panel: 'stories', itemId: id });
  });
  test('parseHash falls back to desk for unknown panel', () => {
    expect(parseHash('#/nope', content)).toEqual({ kind: 'desk' });
    expect(parseHash('#%%%', content)).toEqual({ kind: 'desk' });
  });
  test('parseHash falls back to project list for unknown project id', () => {
    expect(parseHash('#/projects/does-not-exist', content)).toEqual({ kind: 'panel', panel: 'projects' });
  });
  test('itemId is ignored for panels that have no items', () => {
    expect(parseHash('#/skills/whatever', content)).toEqual({ kind: 'panel', panel: 'skills' });
  });
  test('toHash round-trips', () => {
    const r: Route = { kind: 'panel', panel: 'projects', itemId: content.projects[0].id };
    expect(parseHash(toHash(r), content)).toEqual(r);
    expect(toHash({ kind: 'desk' })).toBe('#/');
    expect(toHash({ kind: 'panel', panel: 'about' })).toBe('#/about');
  });
});
