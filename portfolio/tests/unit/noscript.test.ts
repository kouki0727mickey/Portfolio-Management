import { describe, expect, test } from 'vitest';
import { profile } from '../../src/content/profile';
import { renderNoscript } from '../../src/noscript';

describe('renderNoscript', () => {
  test('wraps name, tagline and mailto link in a noscript tag', () => {
    const html = renderNoscript(profile);
    expect(html.startsWith('<noscript>')).toBe(true);
    expect(html.endsWith('</noscript>')).toBe(true);
    expect(html).toContain(profile.name);
    expect(html).toContain(profile.tagline);
    expect(html).toContain(`href="mailto:${profile.email}"`);
  });
  test('tells the visitor that JavaScript unlocks the desk', () => {
    expect(renderNoscript(profile)).toContain('JavaScript を有効にすると机で遊べます');
  });
  test('escapes profile text', () => {
    const html = renderNoscript({ ...profile, name: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>alert(1)');
    expect(html).toContain('&lt;script&gt;');
  });
});
