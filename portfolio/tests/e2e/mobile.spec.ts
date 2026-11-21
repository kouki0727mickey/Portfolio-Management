import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 360, height: 740 }, hasTouch: true });

test('mobile: all desk objects tappable without horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.body.scrollWidth]);
  widths.forEach((w) => expect(w).toBeLessThanOrEqual(360));
  for (const name of ['制作実績ノート', 'マグカップ（自己紹介）', '工具箱（スキル）', 'やらかし帳', 'スマホ（連絡先）', '虫眼鏡（バグ探し）']) {
    await page.getByRole('button', { name }).tap();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '机に戻る' }).tap();
    await expect(page.getByRole('dialog')).toBeHidden();
  }
});

test('mobile: panel fills the screen without horizontal scroll', async ({ page }) => {
  await page.goto('/#/projects');
  const box = await page.getByRole('dialog').boundingBox();
  expect(box!.width).toBeGreaterThanOrEqual(359);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('mobile: every desk object is at least 44px square', async ({ page }) => {
  await page.goto('/');
  const boxes = await page.locator('button.desk-object').evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect()).map((r) => [r.width, r.height]),
  );
  boxes.forEach(([w, h]) => {
    expect(w).toBeGreaterThanOrEqual(44);
    expect(h).toBeGreaterThanOrEqual(44);
  });
});

test('mobile: hire note and terminal button do not overlap', async ({ page }) => {
  await page.goto('/');
  const a = await page.locator('.hire-note').boundingBox();
  const b = await page.locator('.terminal-open').boundingBox();
  expect(a!.x).toBeGreaterThanOrEqual(b!.x + b!.width);
});
