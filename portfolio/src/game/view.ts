import { escapeHtml as e } from '../util/escape';
import { advance, createBugHunt, guess, rank, type BugHuntState, type Puzzle } from './bughunt';

export function mountBugHunt(root: HTMLElement, puzzles: readonly Puzzle[], onContact: () => void): void {
  let state: BugHuntState = createBugHunt(puzzles);
  let focusSelector: string | null = null;

  function render() {
    if (state.finished) {
      const total = state.misses.reduce((a, b) => a + b, 0);
      root.innerHTML = `<div class="bughunt">
<p class="bughunt-rank">${e(rank(state))}</p>
<p>全 ${puzzles.length} 問、外した回数は ${total} 回でした。</p>
<button type="button" class="bughunt-contact">相談してみる</button></div>`;
      root.querySelector('.bughunt-contact')!.addEventListener('click', onContact);
      return;
    }
    const puzzle = puzzles[state.index];
    const hit = state.lastResult === 'hit';
    const last = state.index === puzzles.length - 1;
    root.innerHTML = `<div class="bughunt">
<p class="bughunt-progress">${state.index + 1} / ${puzzles.length}（${e(puzzle.language)}）　バグのある行をクリック</p>
<ol class="bughunt-code">${puzzle.lines
      .map((line, i) => {
        const cls = hit && i === puzzle.bugLine ? ' circled' : '';
        return `<li><button type="button" class="bughunt-line${cls}" data-line="${i}" ${hit ? 'disabled' : ''}><span class="ln">${i + 1}</span><code>${e(line) || '&nbsp;'}</code></button></li>`;
      })
      .join('')}</ol>
${state.lastResult === 'miss' ? `<p class="bughunt-hint" role="status">ちがう。ヒント: ${e(puzzle.hint)}</p>` : ''}
${hit ? `<p class="bughunt-story" role="status">${e(puzzle.realStory)}</p><button type="button" class="bughunt-next">${last ? '結果を見る' : '次へ'}</button>` : ''}
</div>`;
    root.querySelectorAll<HTMLButtonElement>('.bughunt-line').forEach((btn) =>
      btn.addEventListener('click', () => {
        const line = Number(btn.dataset.line);
        state = guess(state, puzzles, line);
        focusSelector = state.lastResult === 'hit' ? '.bughunt-next' : `[data-line="${line}"]`;
        render();
      }),
    );
    root.querySelector('.bughunt-next')?.addEventListener('click', () => {
      state = advance(state, puzzles);
      focusSelector = state.finished ? '.bughunt-contact' : '.bughunt-line';
      render();
    });
  }

  render();
  const after = () => {
    if (focusSelector) root.querySelector<HTMLElement>(focusSelector)?.focus();
  };
  new MutationObserver(after).observe(root, { childList: true });
}
