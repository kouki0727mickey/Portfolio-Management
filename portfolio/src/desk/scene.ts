import type { PanelId } from '../router';
import type { DeskObject } from './objects';

export function mountDesk(
  root: HTMLElement,
  objects: readonly DeskObject[],
  onOpen: (id: PanelId, trigger: HTMLElement) => void,
): void {
  root.classList.add('desk');
  root.replaceChildren(
    ...objects.map((o) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'desk-object';
      btn.dataset.panel = o.id;
      btn.setAttribute('aria-label', o.label);
      const s = btn.style;
      s.setProperty('--x', `${o.x}%`);
      s.setProperty('--y', `${o.y}%`);
      s.setProperty('--r', `${o.rotate}deg`);
      s.setProperty('--w', `${o.width}%`);
      if (o.mobile) {
        s.setProperty('--mx', `${o.mobile.x}%`);
        s.setProperty('--my', `${o.mobile.y}%`);
        s.setProperty('--mw', `${o.mobile.width}%`);
      }
      const img = document.createElement('img');
      img.src = `art/${o.art}`;
      img.alt = '';
      img.draggable = false;
      btn.append(img);
      btn.addEventListener('click', () => onOpen(o.id, btn));
      return btn;
    }),
  );
}
