import { expect, test } from '@playwright/test';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

test('konami toggles night mode on and off', async ({ page }) => {
  await page.goto('/');
  for (const k of KONAMI) await page.keyboard.press(k);
  await expect(page.locator('html')).toHaveAttribute('data-night', 'true');
  for (const k of KONAMI) await page.keyboard.press(k);
  await expect(page.locator('html')).toHaveAttribute('data-night', 'false');
});

test('terminal lights command toggles night mode', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Backquote');
  const input = page.getByRole('textbox', { name: 'terminal' });
  await input.fill('lights');
  await input.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-night', 'true');
});

test('night light follows the pointer', async ({ page }) => {
  await page.goto('/');
  for (const k of KONAMI) await page.keyboard.press(k);
  await page.mouse.move(120, 200);
  const lx = await page.locator('html').evaluate((el) => el.style.getPropertyValue('--lx'));
  expect(lx).toBe('120px');
});

test('reduced motion disables transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const d = await page.getByRole('button', { name: '制作実績ノート' }).evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(d).toBe('0s');
  await page.getByRole('button', { name: '制作実績ノート' }).click();
  const pd = await page.getByRole('dialog').evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(pd).toBe('0s');
  const ad = await page.getByRole('dialog').evaluate((el) => getComputedStyle(el).animationDuration);
  expect(ad).toBe('0s');
});

test('without the preference, motion is still on', async ({ page }) => {
  await page.goto('/');
  const d = await page.getByRole('button', { name: '制作実績ノート' }).evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(d).not.toBe('0s');
});
