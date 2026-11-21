import { expect, test } from '@playwright/test';
import { PUZZLES } from '../../src/game/puzzles';

test('play through bug hunt and reach contact', async ({ page }) => {
  await page.goto('/#/bughunt');
  for (let i = 0; i < PUZZLES.length; i++) {
    await page.locator(`[data-line="${PUZZLES[i].bugLine}"]`).click();
    await page.getByRole('button', { name: /次へ|結果を見る/ }).click();
  }
  await expect(page.locator('.bughunt-rank')).toContainText('一緒にレビューしてほしいレベル');
  await page.getByRole('button', { name: '相談してみる' }).click();
  await expect(page).toHaveURL(/#\/contact$/);
});

test('a wrong guess shows the hint and lets you try again', async ({ page }) => {
  await page.goto('/#/bughunt');
  const wrong = (PUZZLES[0].bugLine + 1) % PUZZLES[0].lines.length;
  await page.locator(`[data-line="${wrong}"]`).click();
  await expect(page.locator('.bughunt-hint')).toContainText(PUZZLES[0].hint);
  await page.locator(`[data-line="${PUZZLES[0].bugLine}"]`).click();
  await expect(page.locator('.bughunt-story')).toContainText(PUZZLES[0].realStory);
});

test('the correct line is not marked in the DOM before guessing', async ({ page }) => {
  await page.goto('/#/bughunt');
  await expect(page.locator('[data-bug]')).toHaveCount(0);
});
