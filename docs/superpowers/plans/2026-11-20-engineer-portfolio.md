# エンジニアポートフォリオ「作業机」 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 真上から見た作業机をクリックして回る、遊べるポートフォリオサイトを `portfolio/` に作り、GitHub Pages で公開する。

**Architecture:** フレームワークなしの Vite + TypeScript による静的サイト。コンテンツは型付きの TS ファイルに分け、ルーティング・ターミナルのコマンド・バグ探しの状態遷移は DOM に依存しない純粋関数にして Vitest で単体テストする。DOM の結線と見た目は Playwright の E2E テストで確認する。

**Tech Stack:** Node 20 / Vite 5 / TypeScript 5（strict）/ Vitest / @playwright/test / GitHub Actions（Pages）

**Spec:** `docs/superpowers/specs/2026-11-20-portfolio-design.md`

## Global Constraints

- 新サイトはすべて `portfolio/` 配下に置く。リポジトリ直下の `index.html` は変更しない。
- UI フレームワーク（React / Vue など）、CSS フレームワーク、アニメーションライブラリを入れない。
- `<html lang="ja">`。文言は日本語が主。
- カラートークン（これ以外の色を使わない）：`--paper:#F4EFE6` `--wood:#B88A5E` `--wood-dark:#8C6440` `--ink:#2B2A28` `--pencil-red:#D2452B` `--pencil-blue:#2F5D8A` `--shadow:rgba(43,42,40,.18)`
- フォント：本文 `Noto Sans JP`、付箋・手書き風 `Klee One`、コード `JetBrains Mono`。Google Fonts から読み込み、`display=swap`。
- 禁止デザイン：紫系グラデーション、ガラス風（backdrop-filter）カード、絵文字アイコン、ストックイラスト、3列カードのヒーローセクション。
- 禁止フレーズ（コンテンツに含まれていたらテスト失敗）：`情熱` `革新的` `シームレス` `最先端` `ワクワク` `価値を提供` `ソリューション` `幅広い` `様々な` `包括的` `堅牢` `ご覧ください` `いかがでしたか` `passionate` `cutting-edge` `seamless` `leverage` `robust` `innovative`、および絵文字（`\p{Extended_Pictographic}`）。
- 幅 360px で横スクロールが出ないこと。
- 初回読み込みの JS は gzip 後 100KB 以下。
- `prefers-reduced-motion: reduce` のときは移動・拡大のアニメーションをすべて止める。
- E2E は `npx playwright test --trace off` で実行する。

## Review Focus

1. **スマホ（タッチ・幅 360px）** — ホバーがなくても机のすべての物がタップでき、横スクロールが出ない。→ Task 9 のテスト `mobile: all desk objects tappable without horizontal scroll`
2. **入力欄の中でのバッククォート** — ターミナルの入力欄など、文字入力中に `` ` `` を打ってもターミナルは開閉しない。→ Task 6 のテスト `shouldToggleTerminal ignores keys typed into inputs`
3. **不正・未知のハッシュ** — `#/nope` や `#/projects/does-not-exist` で開いてもエラーにならず、机または一覧が表示される。→ Task 2 のテスト `parseHash falls back...`、Task 5 のテスト `unknown hash shows desk`
4. **アニメーションを減らす設定** — 物の持ち上がりやパネルのスライドが止まり、すぐ表示される。→ Task 8 のテスト `reduced motion disables transitions`
5. **キーボードだけでの操作** — Tab で机の物すべてに届き、Enter で開き、Esc で閉じるとフォーカスが元の物に戻る。→ Task 5 のテスト `keyboard: tab, enter, escape returns focus`

---

## File Structure

```
portfolio/
  index.html                 エントリ。<noscript> に最低限のプロフィールと連絡先
  package.json / tsconfig.json / vite.config.ts / playwright.config.ts
  src/
    main.ts                  全体の結線（ルーター ↔ 机 ↔ パネル ↔ ターミナル）
    content/types.ts         コンテンツの型
    content/profile.ts       プロフィール・スキル（作者が記入）
    content/projects.ts      制作実績（作者が記入）
    content/stories.ts       やらかし帳（作者が記入）
    content/index.ts         content: Content をまとめて export
    content/lint.ts          禁止フレーズの検出
    router.ts                ハッシュ ↔ Route の変換
    desk/objects.ts          机の上の物の定義（位置・角度・SVG パス）
    desk/scene.ts            机の描画とクリック処理
    panel/render.ts          Route と Content からパネルの HTML を作る
    panel/panel.ts           パネルの開閉・フォーカス管理
    terminal/commands.ts     コマンドの解釈（純粋関数）
    terminal/terminal.ts     ターミナルの UI
    game/bughunt.ts          バグ探しの状態遷移（純粋関数）
    game/puzzles.ts          バグ探しの問題（作者が記入）
    game/view.ts             バグ探しの UI
    effects/konami.ts        コナミコマンドの検出
    effects/nightmode.ts     夜モード（デスクライト）
    util/escape.ts           HTML エスケープ
    util/motion.ts           prefers-reduced-motion の判定
    styles/base.css desk.css panel.css terminal.css game.css night.css
  public/art/                手描き SVG・写真（作者が用意）
  tests/unit/*.test.ts
  tests/e2e/*.spec.ts
  scripts/check-content.mjs  プレースホルダーが残っていないか確認（公開時のみ）
  scripts/check-bundle.mjs   JS サイズの上限確認
.github/workflows/portfolio.yml
```

---

### Task 1: 雛形・コンテンツの型・禁止フレーズの検出

**Files:**
- Create: `portfolio/package.json`, `portfolio/tsconfig.json`, `portfolio/vite.config.ts`, `portfolio/index.html`, `portfolio/src/main.ts`（空の起動処理）
- Create: `portfolio/src/content/types.ts`, `profile.ts`, `projects.ts`, `stories.ts`, `index.ts`, `lint.ts`
- Create: `portfolio/scripts/check-content.mjs`
- Test: `portfolio/tests/unit/lint.test.ts`, `portfolio/tests/unit/content.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // content/types.ts
  export type Link = { label: string; url: string };
  export type Profile = { name: string; tagline: string; about: string; workStyle: string[]; email: string; links: Link[] };
  export type SkillGroup = { label: string; items: string[] };
  export type Project = { id: string; title: string; period: string; role: string; summary: string; numbers: string[]; stack: string[]; image?: string; url?: string };
  export type Story = { id: string; title: string; whatHappened: string; whatILearned: string };
  export type Content = { profile: Profile; skills: SkillGroup[]; projects: Project[]; stories: Story[] };
  // content/index.ts
  export const content: Content;
  // content/lint.ts
  export const BANNED_PHRASES: readonly string[];          // Global Constraints の一覧そのまま
  export function findAiTells(text: string): string[];     // 見つかった禁止フレーズ。絵文字は "emoji" として返す
  export function collectText(c: Content): string[];       // Content 内の全文字列
  ```

- [ ] **Step 1: `npm create vite@5 portfolio -- --template vanilla-ts` で作り、不要なサンプルを削除。Vitest と @playwright/test を devDependencies に追加し、scripts に `"test": "vitest run"`, `"e2e": "playwright test"`, `"check:content": "node scripts/check-content.mjs"` を追加。`vite.config.ts` は `base: './'`**

- [ ] **Step 2: 失敗するテストを書く**

```ts
// tests/unit/lint.test.ts
test('detects banned phrases', () => {
  expect(findAiTells('情熱を持って最先端の開発をしています')).toEqual(['情熱', '最先端']);
});
test('detects English phrases case-insensitively', () => {
  expect(findAiTells('We Leverage robust tools')).toEqual(['leverage', 'robust']);
});
test('detects emoji', () => {
  expect(findAiTells('よろしくお願いします🚀')).toEqual(['emoji']);
});
test('clean text passes', () => {
  expect(findAiTells('3か月で決済画面の離脱率を 42% から 18% に下げた')).toEqual([]);
});

// tests/unit/content.test.ts
test('content contains no AI tells', () => {
  const hits = collectText(content).flatMap(t => findAiTells(t).map(h => `${h}: ${t.slice(0, 30)}`));
  expect(hits).toEqual([]);
});
test('project ids are unique and url-safe', () => {
  const ids = content.projects.map(p => p.id);
  expect(new Set(ids).size).toBe(ids.length);
  ids.forEach(id => expect(id).toMatch(/^[a-z0-9-]+$/));
});
test('every project has at least one number', () => {
  content.projects.forEach(p => expect(p.numbers.length).toBeGreaterThan(0));
});
```

- [ ] **Step 3: `npm test` で失敗を確認**（`findAiTells` が未定義）

- [ ] **Step 4: `lint.ts` と各コンテンツファイルを実装**。コンテンツは仮の内容で、すべての文字列の先頭に `【仮】` を付ける（作者が後で置き換える）。プロジェクトは仮で 3 件、ストーリーは 2 件。

- [ ] **Step 5: `scripts/check-content.mjs` を実装**。`src/content/*.ts` と `src/game/puzzles.ts` に `【仮】` が残っていれば、ファイル名と行番号を出して exit 1。

- [ ] **Step 6: `npm test` で全件 PASS を確認**

- [ ] **Step 7: Commit** — `feat(portfolio): scaffold, content types and copy linter`

---

### Task 2: ルーター

**Files:**
- Create: `portfolio/src/router.ts`
- Test: `portfolio/tests/unit/router.test.ts`

**Interfaces:**
- Consumes: `Content`（Task 1）
- Produces:
  ```ts
  export type PanelId = 'projects' | 'about' | 'skills' | 'stories' | 'contact' | 'bughunt';
  export type Route = { kind: 'desk' } | { kind: 'panel'; panel: PanelId; itemId?: string };
  export function parseHash(hash: string, c: Content): Route;
  export function toHash(route: Route): string;   // desk → '#/'、panel → '#/projects' または '#/projects/<id>'
  ```

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('empty and root hash are desk', () => {
  expect(parseHash('', content)).toEqual({ kind: 'desk' });
  expect(parseHash('#/', content)).toEqual({ kind: 'desk' });
});
test('panel hash', () => {
  expect(parseHash('#/skills', content)).toEqual({ kind: 'panel', panel: 'skills' });
});
test('project detail hash', () => {
  const id = content.projects[0].id;
  expect(parseHash(`#/projects/${id}`, content)).toEqual({ kind: 'panel', panel: 'projects', itemId: id });
});
test('parseHash falls back to desk for unknown panel', () => {
  expect(parseHash('#/nope', content)).toEqual({ kind: 'desk' });
  expect(parseHash('#%%%', content)).toEqual({ kind: 'desk' });
});
test('parseHash falls back to project list for unknown project id', () => {
  expect(parseHash('#/projects/does-not-exist', content)).toEqual({ kind: 'panel', panel: 'projects' });
});
test('toHash round-trips', () => {
  const r: Route = { kind: 'panel', panel: 'projects', itemId: content.projects[0].id };
  expect(parseHash(toHash(r), content)).toEqual(r);
});
```

- [ ] **Step 2: `npm test -- router` で失敗を確認**
- [ ] **Step 3: `router.ts` を実装**。`itemId` が付けられるのは `projects` と `stories` だけで、それ以外のパネルでは無視する。
- [ ] **Step 4: `npm test -- router` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): hash router`

---

### Task 3: 机の描画

**Files:**
- Create: `portfolio/src/desk/objects.ts`, `portfolio/src/desk/scene.ts`, `portfolio/src/styles/base.css`, `portfolio/src/styles/desk.css`
- Create: `portfolio/public/art/*.svg`（仮素材：単色の線画。作者の手描き素材に差し替える前提で、ファイル名は `notebook.svg` `mug.svg` `toolbox.svg` `sticky-notes.svg` `phone.svg` `magnifier.svg` で固定）
- Test: `portfolio/tests/unit/desk.test.ts`（jsdom 環境）

**Interfaces:**
- Consumes: `PanelId`（Task 2）
- Produces:
  ```ts
  export type DeskObject = { id: PanelId; label: string; art: string; x: number; y: number; rotate: number; width: number };
  // x, y, width は机の幅に対する %。rotate は deg
  export const DESK_OBJECTS: readonly DeskObject[];
  export function mountDesk(root: HTMLElement, objects: readonly DeskObject[], onOpen: (id: PanelId, trigger: HTMLElement) => void): void;
  ```

DESK_OBJECTS の値（物の配置。ここが机の「らしさ」になるので固定する）：

| id | label | x | y | rotate | width |
|---|---|---|---|---|---|
| projects | 制作実績ノート | 18 | 22 | -6 | 26 |
| about | マグカップ（自己紹介） | 62 | 14 | 0 | 12 |
| skills | 工具箱（スキル） | 70 | 55 | 4 | 22 |
| stories | やらかし帳 | 40 | 62 | -12 | 16 |
| contact | スマホ（連絡先） | 12 | 66 | 9 | 11 |
| bughunt | 虫眼鏡（バグ探し） | 47 | 30 | 22 | 12 |

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('renders one button per object with accessible label', () => {
  const root = document.createElement('div');
  mountDesk(root, DESK_OBJECTS, () => {});
  const buttons = root.querySelectorAll('button.desk-object');
  expect(buttons).toHaveLength(6);
  expect(buttons[0].getAttribute('aria-label')).toBe('制作実績ノート');
});
test('click calls onOpen with id and trigger', () => {
  const root = document.createElement('div');
  const onOpen = vi.fn();
  mountDesk(root, DESK_OBJECTS, onOpen);
  const btn = root.querySelector<HTMLElement>('[data-panel="skills"]')!;
  btn.click();
  expect(onOpen).toHaveBeenCalledWith('skills', btn);
});
```

- [ ] **Step 2: `npm test -- desk` で失敗を確認**
- [ ] **Step 3: `scene.ts` を実装**。各物は `<button class="desk-object" data-panel>` の中に `<img src="art/...svg" alt="">` を置き、位置は CSS 変数 `--x --y --r --w` で渡す。机の天板は `--wood` の木目（CSS の repeating-linear-gradient を 2 枚重ねる程度。画像は使わない）。ホバー・フォーカス時は `translateY(-6px)` と影を濃くする（0.15s）。
- [ ] **Step 4: `npm test -- desk` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): desk scene`

---

### Task 4: パネルの中身と開閉

**Files:**
- Create: `portfolio/src/util/escape.ts`, `portfolio/src/panel/render.ts`, `portfolio/src/panel/panel.ts`, `portfolio/src/styles/panel.css`
- Test: `portfolio/tests/unit/render.test.ts`, `portfolio/tests/unit/panel.test.ts`

**Interfaces:**
- Consumes: `Content`（Task 1）、`Route` `PanelId` `toHash`（Task 2）
- Produces:
  ```ts
  export function escapeHtml(s: string): string;
  export function renderPanel(route: Extract<Route, { kind: 'panel' }>, c: Content): { title: string; html: string };
  export type PanelController = { open(title: string, html: string, trigger?: HTMLElement): void; close(): void; isOpen(): boolean; onClose(cb: () => void): void };
  export function createPanel(root: HTMLElement): PanelController;
  ```

パネルごとの表示内容：
- `projects`：一覧（タイトル・期間・担当）。各行は `#/projects/<id>` へのリンク。詳細は summary・numbers（箇条書き、`--pencil-red` の手書き風下線）・stack・画像・外部リンク。
- `about`：tagline・about・workStyle。
- `skills`：SkillGroup ごとの見出しと項目。
- `stories`：title、「何が起きたか」「何を学んだか」の 2 段。
- `contact`：email（mailto リンク）と links。
- `bughunt`：空の `<div id="bughunt-root"></div>` だけを返す（Task 7 で中身を入れる）。

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('escapes content', () => {
  const c = structuredClone(content);
  c.profile.about = '<img src=x onerror=alert(1)>';
  const { html } = renderPanel({ kind: 'panel', panel: 'about' }, c);
  expect(html).not.toContain('<img src=x');
  expect(html).toContain('&lt;img');
});
test('project list links to detail hashes', () => {
  const { html } = renderPanel({ kind: 'panel', panel: 'projects' }, content);
  content.projects.forEach(p => expect(html).toContain(`href="#/projects/${p.id}"`));
});
test('contact has mailto', () => {
  const { html } = renderPanel({ kind: 'panel', panel: 'contact' }, content);
  expect(html).toContain(`href="mailto:${content.profile.email}"`);
});
// panel.test.ts
test('open moves focus into panel, close returns focus to trigger', () => {
  const root = document.createElement('div'); document.body.append(root);
  const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus();
  const p = createPanel(root);
  p.open('t', '<p>x</p>', trigger);
  expect(root.contains(document.activeElement)).toBe(true);
  p.close();
  expect(document.activeElement).toBe(trigger);
});
test('Escape closes', () => {
  const root = document.createElement('div'); document.body.append(root);
  const p = createPanel(root); p.open('t', '<p>x</p>');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(p.isOpen()).toBe(false);
});
```

- [ ] **Step 2: `npm test -- render panel` で失敗を確認**
- [ ] **Step 3: 実装**。パネルは `role="dialog" aria-modal="true" aria-labelledby` を持ち、右から紙がスライドしてくる見た目（`--paper` 背景、端を少し破れた形にする SVG マスク）。閉じるボタンは「×」ではなく手書き風の「机に戻る」。Tab は パネル内でループさせる。
- [ ] **Step 4: `npm test` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): panels`

---

### Task 5: 全体の結線と E2E

**Files:**
- Modify: `portfolio/src/main.ts`
- Create: `portfolio/playwright.config.ts`（`webServer: npm run build && npm run preview -- --port 4173`、baseURL `http://localhost:4173`）
- Test: `portfolio/tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `content`、`parseHash` `toHash`、`DESK_OBJECTS` `mountDesk`、`renderPanel` `createPanel`
- Produces: `#app` 内に `#desk` と `#panel-root` を描画。`hashchange` で Route に従いパネルを開閉。パネルを閉じたら `location.hash = '#/'`。

- [ ] **Step 1: 失敗する E2E を書く**

```ts
test('clicking notebook opens projects and updates hash', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '制作実績ノート' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/#\/projects$/);
});
test('deep link opens panel, back button returns to desk', async ({ page }) => {
  await page.goto('/');
  await page.goto('/#/skills');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toBeHidden();
});
test('unknown hash shows desk', async ({ page }) => {
  await page.goto('/#/nope');
  await expect(page.getByRole('button', { name: '制作実績ノート' })).toBeVisible();
  await expect(page.getByRole('dialog')).toBeHidden();
});
test('keyboard: tab, enter, escape returns focus', async ({ page }) => {
  await page.goto('/');
  const labels = ['制作実績ノート','マグカップ（自己紹介）','工具箱（スキル）','やらかし帳','スマホ（連絡先）','虫眼鏡（バグ探し）'];
  for (const name of labels) {
    await page.getByRole('button', { name }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name })).toBeFocused();
  }
});
```
（Tab の到達性は、各ボタンが `tabindex` を潰していないことを `desk.test.ts` に追加で確認：`expect(btn.tabIndex).toBe(0)`）

- [ ] **Step 2: `npm run e2e -- --trace off` で失敗を確認**
- [ ] **Step 3: `main.ts` を実装**
- [ ] **Step 4: `npm test && npm run e2e -- --trace off` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): wire router, desk and panels`

---

### Task 6: 隠しターミナル

**Files:**
- Create: `portfolio/src/terminal/commands.ts`, `portfolio/src/terminal/terminal.ts`, `portfolio/src/styles/terminal.css`
- Modify: `portfolio/src/main.ts`（ターミナルの起動、action の処理）
- Test: `portfolio/tests/unit/commands.test.ts`, `portfolio/tests/e2e/terminal.spec.ts`

**Interfaces:**
- Consumes: `Content`、`Route` `PanelId`
- Produces:
  ```ts
  export type CommandAction = { kind: 'navigate'; route: Route } | { kind: 'mailto'; href: string } | { kind: 'clear' } | { kind: 'close' } | { kind: 'toggleNight' };
  export type CommandResult = { lines: string[]; action?: CommandAction };
  export function runCommand(input: string, c: Content): CommandResult;
  export function shouldToggleTerminal(e: { key: string; target: EventTarget | null }): boolean;
  export type TerminalController = { toggle(): void; isOpen(): boolean };
  export function mountTerminal(root: HTMLElement, c: Content, onAction: (a: CommandAction) => void): TerminalController;
  ```

コマンド一覧（出力の文言は作者の口調で書き直してよいが、コマンド名と action は固定）：

| 入力 | 出力 / action |
|---|---|
| `help` | コマンド一覧 |
| `whoami` | `profile.name` と `profile.tagline` |
| `ls` | 机の上の物の名前一覧（`projects about skills stories contact bughunt`） |
| `ls projects` | プロジェクトの id 一覧 |
| `open <PanelId>` | navigate（そのパネル） |
| `open <projectId>` | navigate（プロジェクト詳細） |
| `hire` | mailto（`mailto:<email>?subject=` に `お仕事のご相談` を URL エンコード） |
| `sudo hire` | 「権限は不要です。普通に `hire` で大丈夫です。」＋ hire と同じ mailto |
| `coffee` | ASCII のマグカップと一言 |
| `lights` | toggleNight（夜モードの切り替え。Task 8 で結線） |
| `clear` | clear |
| `exit` | close |
| 空文字 | lines は空、action なし |
| その他 | `command not found: <入力>`＋「`help` で一覧が出ます」 |

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('open panel navigates', () => {
  expect(runCommand('open skills', content).action).toEqual({ kind: 'navigate', route: { kind: 'panel', panel: 'skills' } });
});
test('open project id navigates to detail', () => {
  const id = content.projects[0].id;
  expect(runCommand(`open ${id}`, content).action).toEqual({ kind: 'navigate', route: { kind: 'panel', panel: 'projects', itemId: id } });
});
test('hire builds mailto with encoded subject', () => {
  const r = runCommand('hire', content);
  expect(r.action).toEqual({ kind: 'mailto', href: `mailto:${content.profile.email}?subject=${encodeURIComponent('お仕事のご相談')}` });
});
test('input is trimmed and case-insensitive for command names', () => {
  expect(runCommand('  HELP  ', content).lines.length).toBeGreaterThan(0);
});
test('unknown command', () => {
  expect(runCommand('rm -rf /', content).lines[0]).toBe('command not found: rm -rf /');
});
test('empty input does nothing', () => {
  expect(runCommand('   ', content)).toEqual({ lines: [] });
});
test('shouldToggleTerminal ignores keys typed into inputs', () => {
  const input = document.createElement('input');
  const ta = document.createElement('textarea');
  const editable = document.createElement('div'); editable.contentEditable = 'true';
  expect(shouldToggleTerminal({ key: '`', target: input })).toBe(false);
  expect(shouldToggleTerminal({ key: '`', target: ta })).toBe(false);
  expect(shouldToggleTerminal({ key: '`', target: editable })).toBe(false);
  expect(shouldToggleTerminal({ key: '`', target: document.body })).toBe(true);
  expect(shouldToggleTerminal({ key: 'a', target: document.body })).toBe(false);
});
```

E2E：

```ts
test('backquote opens terminal and open command navigates', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Backquote');
  const input = page.getByRole('textbox', { name: 'terminal' });
  await expect(input).toBeFocused();
  await input.fill('open stories');
  await input.press('Enter');
  await expect(page).toHaveURL(/#\/stories$/);
});
```

- [ ] **Step 2: `npm test -- commands` で失敗を確認**
- [ ] **Step 3: 実装**。ターミナルは画面下からせり上がる黒い板（`--ink` 背景、文字は `--paper`、`JetBrains Mono`）。入力欄の `aria-label="terminal"`。↑↓ で履歴。ターミナルの中では `` ` `` で閉じず、Esc で閉じる（`shouldToggleTerminal` が input を除外するため）。画面の隅に小さく「`` ` `` を押すと…」と鉛筆書き風のヒントを置く。スマホでは机の下に「ターミナルを開く」ボタンを出す。
- [ ] **Step 4: `npm test && npm run e2e -- --trace off` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): hidden terminal`

---

### Task 7: ミニゲーム「バグ探し」

**Files:**
- Create: `portfolio/src/game/bughunt.ts`, `portfolio/src/game/puzzles.ts`, `portfolio/src/game/view.ts`, `portfolio/src/styles/game.css`
- Modify: `portfolio/src/main.ts`（`bughunt` パネルが開いたら `#bughunt-root` に `mountBugHunt`）
- Test: `portfolio/tests/unit/bughunt.test.ts`, `portfolio/tests/e2e/bughunt.spec.ts`

**Interfaces:**
- Consumes: `PanelController`（Task 4）
- Produces:
  ```ts
  export type Puzzle = { id: string; language: string; lines: string[]; bugLine: number; hint: string; realStory: string }; // bugLine は 0 始まり
  export type BugHuntState = { index: number; misses: number[]; lastResult: 'hit' | 'miss' | null; finished: boolean };
  // misses[i] は i 問目で外した回数
  export const PUZZLES: readonly Puzzle[];   // ちょうど 3 問
  export function createBugHunt(puzzles: readonly Puzzle[]): BugHuntState;
  export function guess(s: BugHuntState, puzzles: readonly Puzzle[], line: number): BugHuntState;
  export function advance(s: BugHuntState, puzzles: readonly Puzzle[]): BugHuntState;
  export function rank(s: BugHuntState): string;
  export function mountBugHunt(root: HTMLElement, puzzles: readonly Puzzle[], onContact: () => void): void;
  ```

rank の判定（合計 miss 数）：0 →「一緒にレビューしてほしいレベル」、1〜2 →「現場ならもう直せてます」、3〜5 →「いい線いってます」、6 以上 →「バグは手強い。だから仕事になる」

- [ ] **Step 1: 失敗するテストを書く**

```ts
const P = PUZZLES;
test('miss increments current puzzle misses', () => {
  const s = guess(createBugHunt(P), P, (P[0].bugLine + 1) % P[0].lines.length);
  expect(s.misses[0]).toBe(1);
  expect(s.lastResult).toBe('miss');
  expect(s.index).toBe(0);
});
test('hit sets lastResult and does not advance until advance()', () => {
  const s = guess(createBugHunt(P), P, P[0].bugLine);
  expect(s.lastResult).toBe('hit');
  expect(s.index).toBe(0);
  expect(advance(s, P).index).toBe(1);
});
test('guess after hit is ignored', () => {
  const s = guess(createBugHunt(P), P, P[0].bugLine);
  expect(guess(s, P, 0)).toEqual(s);
});
test('out-of-range line is ignored', () => {
  const s0 = createBugHunt(P);
  expect(guess(s0, P, -1)).toEqual(s0);
  expect(guess(s0, P, 999)).toEqual(s0);
});
test('finishing all puzzles', () => {
  let s = createBugHunt(P);
  for (const p of P) { s = advance(guess(s, P, p.bugLine), P); }
  expect(s.finished).toBe(true);
  expect(rank(s)).toBe('一緒にレビューしてほしいレベル');
});
test('puzzles are valid', () => {
  expect(P).toHaveLength(3);
  P.forEach(p => { expect(p.bugLine).toBeGreaterThanOrEqual(0); expect(p.bugLine).toBeLessThan(p.lines.length); });
});
```

E2E：

```ts
test('play through bug hunt and reach contact', async ({ page }) => {
  await page.goto('/#/bughunt');
  for (let i = 0; i < 3; i++) {
    await page.locator('[data-bug="true"]').click();   // テスト用に正解行へ data-bug を付ける
    await page.getByRole('button', { name: /次へ|結果を見る/ }).click();
  }
  await page.getByRole('button', { name: '相談してみる' }).click();
  await expect(page).toHaveURL(/#\/contact$/);
});
```

- [ ] **Step 2: `npm test -- bughunt` で失敗を確認**
- [ ] **Step 3: 実装**。コードは行番号付きで表示し、各行が `<button>`。外したら行が小さく横に揺れ（reduced motion では揺れず赤い下線だけ）、`hint` を出す。当てたら赤鉛筆で丸を付けるアニメーション（SVG の stroke-dashoffset）と `realStory`。最後に `rank` と「相談してみる」ボタン（`onContact`）。`puzzles.ts` は仮の 3 問を `【仮】` 付きで入れる。
- [ ] **Step 4: `npm test && npm run e2e -- --trace off` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): bug hunt mini game`

---

### Task 8: 夜モードとアニメーション設定への配慮

**Files:**
- Create: `portfolio/src/effects/konami.ts`, `portfolio/src/effects/nightmode.ts`, `portfolio/src/util/motion.ts`, `portfolio/src/styles/night.css`
- Modify: `portfolio/src/main.ts`, `portfolio/src/styles/base.css`
- Test: `portfolio/tests/unit/konami.test.ts`, `portfolio/tests/e2e/effects.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export const KONAMI: readonly string[]; // ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
  export function createKonamiDetector(onMatch: () => void): (key: string) => void;
  export function setNightMode(on: boolean): void;   // <html data-night="true|false">。main.ts で、Task 6 の `toggleNight` action からも呼ぶ
  export function prefersReducedMotion(): boolean;
  ```

- [ ] **Step 1: 失敗するテストを書く**

```ts
test('fires on full sequence', () => {
  const fn = vi.fn(); const feed = createKonamiDetector(fn);
  KONAMI.forEach(feed);
  expect(fn).toHaveBeenCalledTimes(1);
});
test('wrong key resets but a fresh start still matches', () => {
  const fn = vi.fn(); const feed = createKonamiDetector(fn);
  ['ArrowUp','ArrowUp','x', ...KONAMI].forEach(feed);
  expect(fn).toHaveBeenCalledTimes(1);
});
test('repeated ArrowUp prefix still matches', () => {
  const fn = vi.fn(); const feed = createKonamiDetector(fn);
  ['ArrowUp', ...KONAMI].forEach(feed);
  expect(fn).toHaveBeenCalledTimes(1);
});
```

E2E：

```ts
test('konami toggles night mode', async ({ page }) => {
  await page.goto('/');
  for (const k of ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']) await page.keyboard.press(k);
  await expect(page.locator('html')).toHaveAttribute('data-night', 'true');
});
test('reduced motion disables transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const d = await page.getByRole('button', { name: '制作実績ノート' }).evaluate(el => getComputedStyle(el).transitionDuration);
  expect(d).toBe('0s');
  await page.getByRole('button', { name: '制作実績ノート' }).click();
  const pd = await page.getByRole('dialog').evaluate(el => getComputedStyle(el).transitionDuration);
  expect(pd).toBe('0s');
});
```

- [ ] **Step 2: `npm test -- konami` で失敗を確認**
- [ ] **Step 3: 実装**。夜モードは机全体を `rgba(10,10,20,.88)` で覆い、カーソル位置（`--lx --ly`）を中心に半径 180px の暖色の円で切り抜く（`radial-gradient` マスク）。タッチ端末ではタップした位置にライトが移る。もう一度コナミコマンド、またはターミナルの `lights` で解除。`base.css` に `@media (prefers-reduced-motion: reduce){ *,*::before,*::after{ transition-duration:0s !important; animation-duration:0s !important; animation-iteration-count:1 !important } }`。
- [ ] **Step 4: `npm test && npm run e2e -- --trace off` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): night mode and reduced motion`

---

### Task 9: スマホ対応・相談の付箋・noscript

**Files:**
- Modify: `portfolio/src/styles/desk.css`, `portfolio/src/styles/panel.css`, `portfolio/index.html`, `portfolio/src/main.ts`
- Test: `portfolio/tests/e2e/mobile.spec.ts`, `portfolio/tests/e2e/cta.spec.ts`

**Interfaces:**
- Consumes: `DESK_OBJECTS`、`toHash`
- Produces: 画面右下に固定の `<a class="hire-note" href="#/contact">仕事の相談はこちら →</a>`（`Klee One`、黄色い付箋、-3deg）。

- [ ] **Step 1: 失敗する E2E を書く**

```ts
test.use({ viewport: { width: 360, height: 740 }, hasTouch: true });
test('mobile: all desk objects tappable without horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sw).toBeLessThanOrEqual(360);
  for (const name of ['制作実績ノート','マグカップ（自己紹介）','工具箱（スキル）','やらかし帳','スマホ（連絡先）','虫眼鏡（バグ探し）']) {
    await page.getByRole('button', { name }).tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '机に戻る' }).tap();
  }
});
// cta.spec.ts
test('hire note opens contact from any panel', async ({ page }) => {
  await page.goto('/#/skills');
  await page.getByRole('link', { name: /仕事の相談/ }).click();
  await expect(page).toHaveURL(/#\/contact$/);
});
test('noscript fallback contains email', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByRole('link', { name: /@/ })).toBeVisible();
});
```

- [ ] **Step 2: `npm run e2e -- --trace off` で失敗を確認**
- [ ] **Step 3: 実装**。幅 640px 未満では机を縦長（縦横比 3:5）にし、物の `x y width` を `objects.ts` に `mobile: { x, y, width }` として別に持たせる（Interfaces の `DeskObject` に任意項目 `mobile?: { x: number; y: number; width: number }` を追加）。パネルは全画面のシートになる。タップ領域は最低 44px 四方。`<noscript>` には名前・tagline・メールのリンク・「JavaScript を有効にすると机で遊べます」を書く（Vite のビルド時に `profile.ts` から差し込む小さなプラグインを `vite.config.ts` に書く）。
- [ ] **Step 4: `npm test && npm run e2e -- --trace off` で PASS を確認**
- [ ] **Step 5: Commit** — `feat(portfolio): mobile layout, hire note, noscript`

---

### Task 10: サイズ上限の確認と GitHub Pages への公開

**Files:**
- Create: `portfolio/scripts/check-bundle.mjs`, `.github/workflows/portfolio.yml`
- Modify: `portfolio/package.json`（`"check:bundle": "node scripts/check-bundle.mjs"`）

**Interfaces:**
- Consumes: `npm run build` の出力 `portfolio/dist/`

- [ ] **Step 1: `check-bundle.mjs` を実装**。`dist/assets/*.js` を zlib で gzip 圧縮した合計が 100KB（102400 bytes）を超えたらサイズを表示して exit 1。
- [ ] **Step 2: `npm run build && npm run check:bundle` で PASS を確認**
- [ ] **Step 3: ワークフローを書く**。トリガーは `main` への push で、`portfolio/**` が変わったときのみ。手順：`npm ci` → `npm test` → `npx playwright install --with-deps chromium` → `npm run e2e -- --trace off` → `npm run check:content` → `npm run build` → `npm run check:bundle` → `actions/upload-pages-artifact`（`portfolio/dist`）→ `actions/deploy-pages`。`check:content` があるので、作者がコンテンツを書き終えるまで公開は失敗する（意図どおり）。
- [ ] **Step 4: Commit** — `ci(portfolio): test and deploy to GitHub Pages`

---

## 作者の作業（コードではなく本人がやること）

この計画で「AIが作ったと思われない」を最終的に決めるのはここです。実装と並行して進めてください。

- [ ] `profile.ts`：自分の言葉で書く。tagline は「何をする人か」を一文で（例：「決済まわりの、地味だけど落ちたら困る所を作っています」）。
- [ ] `projects.ts`：3〜5 件。各件に数字（期間・人数・改善幅など）と、自分の担当範囲を明記。
- [ ] `stories.ts`：やらかし話を 2〜3 件。恥ずかしいくらいが一番効く。
- [ ] `puzzles.ts`：実際に遭遇したバグを、守秘に触れない形に書き換えて 3 問。`realStory` は 1〜2 行。
- [ ] `public/art/`：6 つの物を紙に手描き → スキャン → SVG 化（Inkscape のトレースで可）。きれいすぎない方がいい。
- [ ] 写真 1 枚（実際の机か、作業中の手元）を about パネル用に。
- [ ] `npm run check:content` が通ったら公開。
