'use strict';
const { test, expect } = require('./fixtures.js');

for (const path of ['/', '/4.5.1.html', '/4.5.1-selectbox.html', '/4.5.1-selmodal.html']) {
  test(`${path} は JavaScript エラーなく表示されます`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('selmodal ページのタイトルはページ内容と一致します', async ({ page }) => {
  await page.goto('/4.5.1-selmodal.html');
  await expect(page).toHaveTitle('Bootstrap 4.5.1 - selmodal');
});

test('4.5.1.html のカードヘッダーで collapse を開閉できます', async ({ page }) => {
  await page.goto('/4.5.1.html');
  const target = page.locator('#collapse-target');
  await expect(target).toBeHidden();
  await page.locator('.card-header').click();
  await expect(target).toBeVisible();
});
