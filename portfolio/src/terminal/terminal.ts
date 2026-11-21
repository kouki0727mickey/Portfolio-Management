import type { Content } from '../content/types';
import { escapeHtml } from '../util/escape';
import { runCommand, type CommandAction } from './commands';

export type TerminalController = { toggle(): void; isOpen(): boolean };

export function mountTerminal(
  root: HTMLElement,
  c: Content,
  onAction: (a: CommandAction) => void,
): TerminalController {
  root.classList.add('terminal');
  root.hidden = true;
  root.innerHTML = `<div class="terminal-output" aria-live="polite"></div>
<form class="terminal-form"><span aria-hidden="true">$</span>
<input type="text" aria-label="terminal" autocomplete="off" autocapitalize="off" spellcheck="false" /></form>`;
  const out = root.querySelector<HTMLElement>('.terminal-output')!;
  const form = root.querySelector<HTMLFormElement>('form')!;
  const input = root.querySelector<HTMLInputElement>('input')!;
  const history: string[] = [];
  let cursor = 0;

  const print = (lines: string[]) => {
    out.insertAdjacentHTML('beforeend', lines.map((l) => `<div>${escapeHtml(l) || '&nbsp;'}</div>`).join(''));
    out.scrollTop = out.scrollHeight;
  };

  function setOpen(open: boolean) {
    root.hidden = !open;
    if (open) input.focus();
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const text = input.value;
    input.value = '';
    if (text.trim()) {
      history.push(text);
      cursor = history.length;
      print([`$ ${text}`]);
    }
    const { lines, action } = runCommand(text, c);
    print(lines);
    if (!action) return;
    if (action.kind === 'clear') out.replaceChildren();
    else if (action.kind === 'close') setOpen(false);
    else {
      if (action.kind === 'navigate' || action.kind === 'mailto') setOpen(false);
      onAction(action);
    }
  });

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      setOpen(false);
    } else if (ev.key === 'ArrowUp' && history.length) {
      ev.preventDefault();
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor];
    } else if (ev.key === 'ArrowDown' && history.length) {
      ev.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? '';
    }
  });

  return {
    toggle: () => setOpen(root.hidden),
    isOpen: () => !root.hidden,
  };
}
