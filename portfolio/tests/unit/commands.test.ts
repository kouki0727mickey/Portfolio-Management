import { describe, expect, test } from 'vitest';
import { content } from '../../src/content';
import { runCommand, shouldToggleTerminal } from '../../src/terminal/commands';

describe('runCommand', () => {
  test('open panel navigates', () => {
    expect(runCommand('open skills', content).action).toEqual({ kind: 'navigate', route: { kind: 'panel', panel: 'skills' } });
  });
  test('open project id navigates to detail', () => {
    const id = content.projects[0].id;
    expect(runCommand(`open ${id}`, content).action).toEqual({ kind: 'navigate', route: { kind: 'panel', panel: 'projects', itemId: id } });
  });
  test('open without target explains usage', () => {
    const r = runCommand('open', content);
    expect(r.action).toBeUndefined();
    expect(r.lines[0]).toContain('open');
  });
  test('open unknown target reports not found', () => {
    const r = runCommand('open nowhere', content);
    expect(r.action).toBeUndefined();
    expect(r.lines).toEqual(['open: nowhere: not found']);
  });
  test('hire builds mailto with encoded subject', () => {
    expect(runCommand('hire', content).action).toEqual({
      kind: 'mailto',
      href: `mailto:${content.profile.email}?subject=${encodeURIComponent('お仕事のご相談')}`,
    });
  });
  test('sudo hire also builds mailto with a quip', () => {
    const r = runCommand('sudo hire', content);
    expect(r.lines[0]).toContain('権限は不要');
    expect(r.action?.kind).toBe('mailto');
  });
  test('input is trimmed and case-insensitive for command names', () => {
    expect(runCommand('  HELP  ', content).lines.length).toBeGreaterThan(0);
  });
  test('unknown command', () => {
    expect(runCommand('rm -rf /', content).lines[0]).toBe('command not found: rm -rf /');
  });
  test('empty input does nothing', () => {
    expect(runCommand('   ', content)).toEqual({ lines: [] });
  });
  test('whoami shows name and tagline', () => {
    const lines = runCommand('whoami', content).lines.join('\n');
    expect(lines).toContain(content.profile.name);
    expect(lines).toContain(content.profile.tagline);
  });
  test('ls lists desk objects, ls projects lists ids', () => {
    expect(runCommand('ls', content).lines.join(' ')).toContain('bughunt');
    const ids = runCommand('ls projects', content).lines.join(' ');
    content.projects.forEach((p) => expect(ids).toContain(p.id));
  });
  test('clear, exit, lights map to actions', () => {
    expect(runCommand('clear', content).action).toEqual({ kind: 'clear' });
    expect(runCommand('exit', content).action).toEqual({ kind: 'close' });
    expect(runCommand('lights', content).action).toEqual({ kind: 'toggleNight' });
  });
  test('coffee prints something', () => {
    expect(runCommand('coffee', content).lines.length).toBeGreaterThan(1);
  });
});

describe('shouldToggleTerminal', () => {
  test('shouldToggleTerminal ignores keys typed into inputs', () => {
    const input = document.createElement('input');
    const ta = document.createElement('textarea');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    expect(shouldToggleTerminal({ key: '`', target: input })).toBe(false);
    expect(shouldToggleTerminal({ key: '`', target: ta })).toBe(false);
    expect(shouldToggleTerminal({ key: '`', target: editable })).toBe(false);
    expect(shouldToggleTerminal({ key: '`', target: document.body })).toBe(true);
    expect(shouldToggleTerminal({ key: 'a', target: document.body })).toBe(false);
  });
});
