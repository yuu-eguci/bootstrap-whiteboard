'use strict';
const { test, expect } = require('./fixtures.js');

// 2026-10-23 (金) 10:15 に固定します。
const NOW = new Date('2026-10-23T10:15:00+09:00');

const group = (page, label) => page.locator('.form-group').filter({ has: page.getByText(label, { exact: true }) });
const optionValues = (select) => select.locator('option').evaluateAll((els) => els.map((el) => el.value));

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await page.goto('/4.5.1-selectbox.html');
});

test('各 select に空欄と候補が入ります', async ({ page }) => {
  const g = group(page, '年月日');
  expect(await optionValues(g.locator('select.auto-fill-year'))).toEqual(['', '2023', '2024', '2025', '2026', '2027', '2028', '2029']);
  expect(await optionValues(g.locator('select.auto-fill-month'))).toHaveLength(13);
  expect(await optionValues(g.locator('select.auto-fill-date'))).toHaveLength(32);
  const t = group(page, '時刻');
  expect(await optionValues(t.locator('select.auto-fill-hour'))).toHaveLength(25);
  expect(await optionValues(t.locator('select.auto-fill-minute'))).toHaveLength(61);
});

test('未選択の select を最初にクリックすると現在日時が入ります', async ({ page }) => {
  const g = group(page, '年月日');
  await g.locator('select.auto-fill-year').click();
  await expect(g.locator('select.auto-fill-year')).toHaveValue('2026');
  await g.locator('select.auto-fill-month').click();
  await expect(g.locator('select.auto-fill-month')).toHaveValue('10');

  const t = group(page, '時刻');
  await t.locator('select.auto-fill-hour').click();
  await expect(t.locator('select.auto-fill-hour')).toHaveValue('10');
  await t.locator('select.auto-fill-minute').click();
  await expect(t.locator('select.auto-fill-minute')).toHaveValue('15');
});

test('年月を選んだ後に日をクリックすると、その月の日数と曜日で候補を作ります', async ({ page }) => {
  const g = group(page, '年月日');
  await g.locator('select.auto-fill-year').selectOption('2026');
  await g.locator('select.auto-fill-month').selectOption('02');
  const date = g.locator('select.auto-fill-date');
  await date.click();
  await expect(date).toHaveValue('23');
  expect(await optionValues(date)).toHaveLength(29);
  await expect(date.locator('option:checked')).toHaveText('23 (月)');
});
