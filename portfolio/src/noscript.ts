import type { Profile } from './content/types';
import { escapeHtml as e } from './util/escape';

export function renderNoscript(p: Profile): string {
  return `<noscript><div class="noscript"><h1>${e(p.name)}</h1><p>${e(p.tagline)}</p>` +
    `<p><a href="mailto:${e(p.email)}">${e(p.email)}</a></p>` +
    `<p>JavaScript を有効にすると机で遊べます。</p></div></noscript>`;
}
