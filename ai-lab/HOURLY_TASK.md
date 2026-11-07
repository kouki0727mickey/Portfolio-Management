# AI Lab: hourly job instructions

These are the instructions the hourly scheduled task follows. Edit this file to change what the job does.

## Steps

1. **Research**: Use WebSearch to find AI news from the last 24 to 48 hours (model releases, research, products, policy).
   - Read `ai-lab/apps.json` and skip topics that existing apps already cover.
   - Prefer primary sources (company blogs, papers). Write down the URLs you use.
2. **Choose a topic**: Pick one topic and come up with a small web app idea built around it. Examples:
   - A comparison table, a timeline, a quiz, a simulator, a calculator, a glossary, a visual explainer
3. **Build**: Create `ai-lab/apps/<YYYY-MM-DD-HHMM>-<slug>/index.html`.
   - Put everything in one HTML file (inline CSS and JS). Load external scripts only from cdnjs or jsDelivr, with pinned versions.
   - Write the UI in Japanese. It must work on a phone screen and support dark mode.
   - Do not call any API that needs an API key.
   - At the top, put a link back to `../../` (the AI Lab gallery).
   - At the bottom, list the source links. If a fact is not confirmed by a primary source, say so.
4. **Register**: Add one entry to the top of the `ai-lab/apps.json` array:
   `slug`, `title`, `description` (one line), `emoji`, `topic`, `created_at` (ISO 8601 UTC), `sources` (array of URLs)
   - `emoji` + `title` + `description` are posted to X as-is after the push, with the app URL. Keep `description` under 100 characters and write it like a tweet (what it does, why it is interesting).
5. **Check**: Open the page in Playwright and confirm the browser console shows no errors.
6. **Publish**: Commit and push to the `claude/ai-news-webapp-hourly-qhefm5` branch.
   - Run `git pull --rebase origin claude/ai-news-webapp-hourly-qhefm5` before pushing.
   - Commit message: `ai-lab: add <title>`
   - Do not create a pull request.

## Rules

- Never present an unverified rumor as fact.
- Do not change any existing app or the main page (`/index.html`).
- If there is no new news, build a new app around a different angle on a recent topic instead.
