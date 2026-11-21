import { expect, test } from '@playwright/test';

const LABELS = ['制作実績ノート', 'マグカップ（自己紹介）', '工具箱（スキル）', 'やらかし帳', 'スマホ（連絡先）', '虫眼鏡（バグ探し）'];

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
  for (const name of LABELS) {
    await page.getByRole('button', { name }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByRole('button', { name })).toBeFocused();
  }
});

test('close button returns to desk hash', async ({ page }) => {
  await page.goto('/#/about');
  await page.getByRole('button', { name: '机に戻る' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('project list link opens detail', async ({ page }) => {
  await page.goto('/#/projects');
  await page.locator('.panel .index a').first().click();
  await expect(page).toHaveURL(/#\/projects\/[a-z0-9-]+$/);
  await expect(page.getByRole('dialog')).toBeVisible();
});
