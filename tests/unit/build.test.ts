// ブラウザが読み込む js/*.js が、 src/*.ts から生成したものと一致することを確認します。
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { generate } from '../../scripts/build.ts';

const root = path.join(import.meta.dirname, '..', '..');
const outputs = await generate();

for (const { output, text } of outputs) {
  test(`${output} は src から生成した内容と一致します (npm run build で更新してください)`, () => {
    assert.equal(fs.readFileSync(path.join(root, output), 'utf8'), text);
  });
}

test('js/auto-fill-date.js はグローバル変数 AutoFillDate を公開します', () => {
  const built = outputs.find((o) => o.output === 'js/auto-fill-date.js');
  assert.ok(built);
  const context: { AutoFillDate?: { clampDate: (yyyy: string, mm: string, dd: string) => string } } = {};
  vm.runInNewContext(built.text, context);
  assert.equal(context.AutoFillDate?.clampDate('2024', '02', '31'), '29');
});
