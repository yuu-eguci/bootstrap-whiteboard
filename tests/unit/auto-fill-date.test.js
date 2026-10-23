'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const AutoFillDate = require('../../js/auto-fill-date.js');

test('zeroPadding2 は2桁にゼロ埋めします', () => {
  assert.equal(AutoFillDate.zeroPadding2(3), '03');
  assert.equal(AutoFillDate.zeroPadding2(12), '12');
});

test('buildYearOptions は3年前〜3年後を返します', () => {
  assert.deepEqual(AutoFillDate.buildYearOptions(2026, []), [2023, 2024, 2025, 2026, 2027, 2028, 2029]);
});

test('buildYearOptions は範囲外の入力済みの年も含めます', () => {
  assert.deepEqual(
    AutoFillDate.buildYearOptions(2026, ['2018', '2018', '', 'abcd']),
    [2018, 2023, 2024, 2025, 2026, 2027, 2028, 2029],
  );
});

test('buildDateOptions は月の日数と曜日を返します', () => {
  const feb2024 = AutoFillDate.buildDateOptions('2024', '02');
  assert.equal(feb2024.values.length, 29);
  assert.equal(AutoFillDate.buildDateOptions('2026', '02').values.length, 28);
  assert.equal(AutoFillDate.buildDateOptions('2026', '04').values.length, 30);
  const oct2026 = AutoFillDate.buildDateOptions('2026', '10');
  assert.equal(oct2026.values[22], '23');
  assert.equal(oct2026.texts[22], '23 (金)');
});

test('clampDate は存在しない日を月末に丸めます', () => {
  assert.equal(AutoFillDate.clampDate('2024', '02', '31'), '29');
  assert.equal(AutoFillDate.clampDate('2026', '02', '30'), '28');
  assert.equal(AutoFillDate.clampDate('2026', '04', '31'), '30');
  assert.equal(AutoFillDate.clampDate('2026', '03', '15'), '15');
});

test('createNameGenerator は重複しない name を返します', () => {
  const next = AutoFillDate.createNameGenerator('selmodal-');
  const names = Array.from({ length: 1000 }, () => next());
  assert.equal(new Set(names).size, 1000);
  assert.match(names[0], /^selmodal-/);
});
