'use strict';
const { test, expect } = require('./fixtures.js');

// 2026-10-23 (金) 10:15 に固定します。
const NOW = new Date('2026-10-23T10:15:00+09:00');

const group = (page, label) => page.locator('.form-group').filter({ has: page.getByText(label, { exact: true }) });
const button = (g, part) => g.locator(`.auto-fill-${part} button.selModalButton`);
const openModal = (page) => page.locator('.selModal').filter({ visible: true });
const chooseOption = (page, text) => openModal(page).locator('li').filter({ hasText: new RegExp(`^${text}$`) }).click();

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  await page.goto('/4.5.1-selmodal.html');
});

test('最初のクリックで現在日時が入り、空欄を選んだ後の再クリックでは空欄のままです', async ({ page }) => {
  const g = group(page, '年月日');
  await button(g, 'year').click();
  await expect(g.locator('input')).toHaveValue('2026/10/23');
  await expect(button(g, 'date')).toHaveText('23 (金)');

  await openModal(page).locator('li').first().click();
  await expect(g.locator('input')).toHaveValue('');

  await button(g, 'year').click();
  await expect(openModal(page)).toBeVisible();
  await expect(g.locator('input')).toHaveValue('');
  await expect(button(g, 'year')).toHaveText('');
});

test('範囲外の年が入力済みでも、その年を表示します', async ({ page }) => {
  const g = group(page, '最初から値が入っている年月日');
  await expect(button(g, 'year')).toHaveText('2018');
  await expect(button(g, 'month')).toHaveText('03');
  await expect(button(g, 'date')).toHaveText('01 (木)');

  const m = group(page, '最初から値が入っている年月');
  await expect(button(m, 'year')).toHaveText('2018');
  await expect(button(m, 'month')).toHaveText('05');
});

test('月を変えて日が存在しなくなった場合、月末に丸めます', async ({ page }) => {
  const g = group(page, '年月日');
  await button(g, 'year').click();
  await chooseOption(page, '2026');
  await button(g, 'date').click();
  await chooseOption(page, '31 \\(土\\)');
  await expect(g.locator('input')).toHaveValue('2026/10/31');

  await button(g, 'month').click();
  await chooseOption(page, '02');
  await expect(g.locator('input')).toHaveValue('2026/02/28');
  await expect(button(g, 'date')).toHaveText('28 (土)');
});

test('select の name とモーダルは重複しません', async ({ page }) => {
  const names = await page.locator('select').evaluateAll((els) => els.map((el) => el.name));
  expect(names).toHaveLength(21);
  expect(new Set(names).size).toBe(21);
  await expect(page.locator('.selModal')).toHaveCount(21);
});

test('disabled の入力欄に対応するボタンは disabled です', async ({ page }) => {
  for (const label of ['Disabled 年月日', 'Disabled 年月', 'Disabled 時刻']) {
    const buttons = group(page, label).locator('button.selModalButton');
    expect(await buttons.count()).toBeGreaterThan(0);
    for (const b of await buttons.all()) {
      await expect(b).toBeDisabled();
    }
  }
});

test.describe('selModal プラグイン', () => {
  const addSelect = (page, name, value, text) => page.evaluate(([n, v, t]) => {
    const select = document.createElement('select');
    select.name = n;
    select.append(new Option('', ''), new Option(t, v));
    document.body.append(select);
    window.jQuery(select).selModal();
  }, [name, value, text]);

  test('option の文字列を HTML として解釈しません', async ({ page }) => {
    const payload = '<img src=x onerror="window.__xss=1">';
    await addSelect(page, 'xss-test', `"><img src=x onerror="window.__xss=2">`, payload);
    const modal = page.locator('.selModal[data-selmodal="xss-test"]');
    await expect(modal.locator('img')).toHaveCount(0);
    await expect(modal.locator('li').nth(1)).toHaveText(payload);
    expect(await page.evaluate(() => window.__xss)).toBeUndefined();
  });

  test('name に引用符を含んでも動作します', async ({ page }) => {
    await addSelect(page, 'quote"name', 'v1', 'Value 1');
    const btn = page.locator('button.selModalButton').last();
    await btn.click();
    await chooseOption(page, 'Value 1');
    await expect(btn).toHaveText('Value 1');
    expect(await page.evaluate(() => document.querySelector('select[name="quote\\"name"]').value)).toBe('v1');
  });
});
