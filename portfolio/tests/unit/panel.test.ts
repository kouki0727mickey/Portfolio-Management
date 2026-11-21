import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createPanel } from '../../src/panel/panel';
import { escapeHtml } from '../../src/util/escape';

beforeEach(() => { document.body.innerHTML = ''; });

describe('escapeHtml', () => {
  test('escapes the five special characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });
});

describe('createPanel', () => {
  test('open moves focus into panel, close returns focus to trigger', () => {
    const root = document.createElement('div'); document.body.append(root);
    const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
    const p = createPanel(root);
    p.open('t', '<p>x</p>', trigger);
    expect(root.contains(document.activeElement)).toBe(true);
    p.close();
    expect(document.activeElement).toBe(trigger);
  });
  test('Escape closes', () => {
    const root = document.createElement('div'); document.body.append(root);
    const p = createPanel(root); p.open('t', '<p>x</p>');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(p.isOpen()).toBe(false);
  });
  test('close button closes and fires onClose once', () => {
    const root = document.createElement('div'); document.body.append(root);
    const p = createPanel(root); const cb = vi.fn(); p.onClose(cb);
    p.open('t', '<p>x</p>');
    root.querySelector<HTMLButtonElement>('button.panel-close')!.click();
    expect(p.isOpen()).toBe(false);
    expect(cb).toHaveBeenCalledTimes(1);
  });
  test('dialog has accessible name from title', () => {
    const root = document.createElement('div'); document.body.append(root);
    const p = createPanel(root); p.open('制作実績', '<p>x</p>');
    const dlg = root.querySelector('[role="dialog"]')!;
    const labelId = dlg.getAttribute('aria-labelledby')!;
    expect(root.querySelector(`#${labelId}`)!.textContent).toBe('制作実績');
  });
  test('closing when already closed does not fire onClose', () => {
    const root = document.createElement('div'); document.body.append(root);
    const p = createPanel(root); const cb = vi.fn(); p.onClose(cb);
    p.close();
    expect(cb).not.toHaveBeenCalled();
  });
  test('Tab on the last focusable wraps to the first', () => {
    const root = document.createElement('div'); document.body.append(root);
    const p = createPanel(root); p.open('t', '<a href="#/x" id="last">l</a>');
    const last = root.querySelector<HTMLElement>('#last')!; last.focus();
    const ev = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    document.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(root.querySelector('button.panel-close'));
  });
});
