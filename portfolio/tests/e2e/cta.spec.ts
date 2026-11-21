import { expect, test } from '@playwright/test';

test('hire note opens contact from the desk', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /仕事の相談/ }).click();
  await expect(page).toHaveURL(/#\/contact$/);
  await expect(page.getByRole('dialog')).toBeVisible();
});

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
  await ctx.close();
});
