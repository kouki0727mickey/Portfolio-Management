import type { Content } from '../content/types';
import { PANEL_IDS, type Route } from '../router';

export type CommandAction =
  | { kind: 'navigate'; route: Route }
  | { kind: 'mailto'; href: string }
  | { kind: 'clear' }
  | { kind: 'close' }
  | { kind: 'toggleNight' };
export type CommandResult = { lines: string[]; action?: CommandAction };

const HELP = [
  'help            コマンド一覧',
  'whoami          自己紹介をひとこと',
  'ls              机の上にあるもの',
  'ls projects     実績の id 一覧',
  'open <名前>     開く（例: open projects）',
  'hire            仕事の相談メールを書く',
  'lights          照明を切り替える',
  'coffee          コーヒーを淹れる',
  'clear / exit    画面を消す / 閉じる',
];

const COFFEE = ['    ( (', '     ) )', '  .______.', '  |      |]', '  \\      /', '   `----\'', 'どうぞ。ぬるくなる前に。'];

function hire(c: Content): CommandAction {
  return { kind: 'mailto', href: `mailto:${c.profile.email}?subject=${encodeURIComponent('お仕事のご相談')}` };
}

export function runCommand(input: string, c: Content): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };
  const [head, ...rest] = trimmed.split(/\s+/);
  const cmd = head.toLowerCase();
  const arg = rest.join(' ');

  switch (cmd) {
    case 'help':
      return { lines: HELP };
    case 'whoami':
      return { lines: [c.profile.name, c.profile.tagline] };
    case 'ls':
      if (!arg) return { lines: [PANEL_IDS.join(' ')] };
      if (arg === 'projects') return { lines: [c.projects.map((p) => p.id).join(' ')] };
      return { lines: [`ls: ${arg}: No such directory`] };
    case 'open': {
      if (!arg) return { lines: ['open: 何を開きますか？ 例: open projects'] };
      const panel = PANEL_IDS.find((p) => p === arg);
      if (panel) return { lines: [], action: { kind: 'navigate', route: { kind: 'panel', panel } } };
      if (c.projects.some((p) => p.id === arg)) {
        return { lines: [], action: { kind: 'navigate', route: { kind: 'panel', panel: 'projects', itemId: arg } } };
      }
      return { lines: [`open: ${arg}: not found`] };
    }
    case 'hire':
      return { lines: [], action: hire(c) };
    case 'sudo':
      if (arg.toLowerCase() === 'hire') {
        return { lines: ['権限は不要です。普通に `hire` で大丈夫です。'], action: hire(c) };
      }
      break;
    case 'lights':
      return { lines: [], action: { kind: 'toggleNight' } };
    case 'coffee':
      return { lines: COFFEE };
    case 'clear':
      return { lines: [], action: { kind: 'clear' } };
    case 'exit':
      return { lines: [], action: { kind: 'close' } };
  }
  return { lines: [`command not found: ${trimmed}`, '`help` で一覧が出ます'] };
}

export function shouldToggleTerminal(e: { key: string; target: EventTarget | null }): boolean {
  if (e.key !== '`') return false;
  const t = e.target;
  if (!(t instanceof Element)) return true;
  if (t.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')) return false;
  return true;
}
