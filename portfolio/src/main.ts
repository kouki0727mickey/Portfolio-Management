import './styles/base.css';
import './styles/desk.css';
import './styles/panel.css';
import { content } from './content';
import { DESK_OBJECTS } from './desk/objects';
import { mountDesk } from './desk/scene';
import { createPanel } from './panel/panel';
import { renderPanel } from './panel/render';
import { parseHash, toHash } from './router';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

const deskEl = document.createElement('main');
deskEl.id = 'desk';
const panelRoot = document.createElement('div');
panelRoot.id = 'panel-root';
app.replaceChildren(deskEl, panelRoot);

const panel = createPanel(panelRoot);
let lastTrigger: HTMLElement | undefined;
let closingFromRoute = false;

function apply(): void {
  const route = parseHash(location.hash, content);
  if (route.kind === 'panel') {
    const { title, html } = renderPanel(route, content);
    panel.open(title, html, lastTrigger);
  } else if (panel.isOpen()) {
    closingFromRoute = true;
    panel.close();
    closingFromRoute = false;
  }
}

panel.onClose(() => {
  lastTrigger = undefined;
  if (!closingFromRoute && parseHash(location.hash, content).kind !== 'desk') {
    location.hash = toHash({ kind: 'desk' });
  }
});

mountDesk(deskEl, DESK_OBJECTS, (id, trigger) => {
  lastTrigger = trigger;
  location.hash = toHash({ kind: 'panel', panel: id });
});

window.addEventListener('hashchange', apply);
apply();
