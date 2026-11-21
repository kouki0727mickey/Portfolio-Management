import './styles/base.css';
import './styles/desk.css';
import './styles/panel.css';
import './styles/terminal.css';
import './styles/game.css';
import './styles/night.css';
import { content } from './content';
import { DESK_OBJECTS } from './desk/objects';
import { PUZZLES } from './game/puzzles';
import { mountBugHunt } from './game/view';
import { mountDesk } from './desk/scene';
import { createKonamiDetector } from './effects/konami';
import { toggleNightMode } from './effects/nightmode';
import { createPanel } from './panel/panel';
import { renderPanel } from './panel/render';
import { parseHash, toHash } from './router';
import { shouldToggleTerminal } from './terminal/commands';
import { mountTerminal } from './terminal/terminal';

const app = document.getElementById('app');
if (!app) throw new Error('#app not found');

const deskEl = document.createElement('main');
deskEl.id = 'desk';
const panelRoot = document.createElement('div');
panelRoot.id = 'panel-root';
const terminalRoot = document.createElement('section');
terminalRoot.id = 'terminal-root';
const hint = document.createElement('p');
hint.className = 'terminal-hint';
hint.textContent = '` を押すと…';
const terminalButton = document.createElement('button');
terminalButton.type = 'button';
terminalButton.className = 'terminal-open';
terminalButton.textContent = 'ターミナルを開く';
const nightOverlay = document.createElement('div');
nightOverlay.id = 'night-overlay';
nightOverlay.setAttribute('aria-hidden', 'true');
const hireNote = document.createElement('a');
hireNote.className = 'hire-note';
hireNote.href = toHash({ kind: 'panel', panel: 'contact' });
hireNote.textContent = '仕事の相談はこちら →';
app.replaceChildren(deskEl, panelRoot, nightOverlay, terminalRoot, hint, terminalButton, hireNote);

const panel = createPanel(panelRoot);
let lastTrigger: HTMLElement | undefined;
let closingFromRoute = false;

function apply(): void {
  const route = parseHash(location.hash, content);
  if (route.kind === 'panel') {
    const { title, html } = renderPanel(route, content);
    panel.open(title, html, lastTrigger);
    const huntRoot = document.getElementById('bughunt-root');
    if (huntRoot) mountBugHunt(huntRoot, PUZZLES, () => (location.hash = toHash({ kind: 'panel', panel: 'contact' })));
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

const terminal = mountTerminal(terminalRoot, content, (action) => {
  if (action.kind === 'navigate') location.hash = toHash(action.route);
  else if (action.kind === 'mailto') location.href = action.href;
  else if (action.kind === 'toggleNight') toggleNightMode();
});
terminalButton.addEventListener('click', () => terminal.toggle());
const feedKonami = createKonamiDetector(() => toggleNightMode());
const moveLight = (ev: PointerEvent) => {
  const style = document.documentElement.style;
  style.setProperty('--lx', `${ev.clientX}px`);
  style.setProperty('--ly', `${ev.clientY}px`);
};
window.addEventListener('pointermove', moveLight);
window.addEventListener('pointerdown', moveLight);

document.addEventListener('keydown', (ev) => {
  feedKonami(ev.key);
  if (shouldToggleTerminal(ev)) {
    ev.preventDefault();
    terminal.toggle();
  }
});

window.addEventListener('hashchange', apply);
apply();
