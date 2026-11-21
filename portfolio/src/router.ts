import type { Content } from './content/types';

export type PanelId = 'projects' | 'about' | 'skills' | 'stories' | 'contact' | 'bughunt';
export type Route = { kind: 'desk' } | { kind: 'panel'; panel: PanelId; itemId?: string };

export const PANEL_IDS: readonly PanelId[] = ['projects', 'about', 'skills', 'stories', 'contact', 'bughunt'];

function isPanelId(s: string): s is PanelId {
  return (PANEL_IDS as readonly string[]).includes(s);
}

export function parseHash(hash: string, c: Content): Route {
  const [panel, itemId] = hash.replace(/^#\/?/, '').split('/');
  if (!panel || !isPanelId(panel)) return { kind: 'desk' };
  const items =
    panel === 'projects' ? c.projects.map((p) => p.id) : panel === 'stories' ? c.stories.map((s) => s.id) : [];
  if (itemId && items.includes(itemId)) return { kind: 'panel', panel, itemId };
  return { kind: 'panel', panel };
}

export function toHash(route: Route): string {
  if (route.kind === 'desk') return '#/';
  return route.itemId ? `#/${route.panel}/${route.itemId}` : `#/${route.panel}`;
}
