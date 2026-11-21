import { escapeHtml } from '../util/escape';

export type PanelController = {
  open(title: string, html: string, trigger?: HTMLElement): void;
  close(): void;
  isOpen(): boolean;
  onClose(cb: () => void): void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

export function createPanel(root: HTMLElement): PanelController {
  let open = false;
  let trigger: HTMLElement | undefined;
  const closeCbs: Array<() => void> = [];

  const focusables = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));

  function onKey(ev: KeyboardEvent) {
    if (ev.key === 'Escape') {
      close();
      return;
    }
    if (ev.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (!root.contains(active)) {
      ev.preventDefault();
      first.focus();
    } else if (ev.shiftKey && active === first) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && active === last) {
      ev.preventDefault();
      first.focus();
    }
  }

  function close() {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey);
    root.replaceChildren();
    root.hidden = true;
    trigger?.focus();
    trigger = undefined;
    closeCbs.forEach((cb) => cb());
  }

  function openPanel(title: string, html: string, from?: HTMLElement) {
    if (open) {
      root.replaceChildren();
    } else {
      trigger = from ?? (document.activeElement instanceof HTMLElement ? document.activeElement : undefined);
      document.addEventListener('keydown', onKey);
    }
    open = true;
    root.hidden = false;
    root.innerHTML = `<section class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
<header><h2 id="panel-title">${escapeHtml(title)}</h2><button type="button" class="panel-close">机に戻る</button></header>
<div class="panel-body">${html}</div></section>`;
    root.querySelector('.panel-close')!.addEventListener('click', close);
    root.querySelector<HTMLElement>('.panel-close')!.focus();
  }

  root.hidden = true;
  return { open: openPanel, close, isOpen: () => open, onClose: (cb) => void closeCbs.push(cb) };
}
