import './styles/base.css';
import './styles/desk.css';
import './styles/panel.css';
import './styles/terminal.css';
import './styles/game.css';
import { content } from './content';
import { DESK_OBJECTS } from './desk/objects';
import { PUZZLES } from './game/puzzles';
import { mountBugHunt } from './game/view';
import { mountDesk } from './desk/scene';
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
app.replaceChildren(deskEl, panelRoot, terminalRoot, hint, terminalButton);

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
});
terminalButton.addEventListener('click', () => terminal.toggle());
document.addEventListener('keydown', (ev) => {
  if (shouldToggleTerminal(ev)) {
    ev.preventDefault();
    terminal.toggle();
  }
});

window.addEventListener('hashchange', apply);
apply();
