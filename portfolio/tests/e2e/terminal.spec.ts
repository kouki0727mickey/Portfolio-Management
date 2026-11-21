import { expect, test } from '@playwright/test';

test('backquote opens terminal and open command navigates', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Backquote');
  const input = page.getByRole('textbox', { name: 'terminal' });
  await expect(input).toBeFocused();
  await input.fill('open stories');
  await input.press('Enter');
  await expect(page).toHaveURL(/#\/stories$/);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('typing a backquote inside the terminal does not close it', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Backquote');
  const input = page.getByRole('textbox', { name: 'terminal' });
  await input.press('Backquote');
  await expect(input).toBeVisible();
});

test('help prints output and Escape closes the terminal only', async ({ page }) => {
  await page.goto('/#/about');
  await page.keyboard.press('Backquote');
  const input = page.getByRole('textbox', { name: 'terminal' });
  await input.fill('help');
  await input.press('Enter');
  await expect(page.locator('.terminal-output')).toContainText('open');
  await input.press('Escape');
  await expect(input).toBeHidden();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('arrow up recalls the previous command', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Backquote');
  const input = page.getByRole('textbox', { name: 'terminal' });
  await input.fill('whoami');
  await input.press('Enter');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('whoami');
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 360, height: 740 }, hasTouch: true });
  test('terminal button opens the terminal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ターミナルを開く' }).tap();
    await expect(page.getByRole('textbox', { name: 'terminal' })).toBeVisible();
  });
});
