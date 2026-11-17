'use strict';
// Node.js のバージョン指定が、ファイル間と実行環境でずれていないことを確認します。
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const nvmrc = read('.nvmrc').trim();
const major = nvmrc.split('.')[0];

test('.nvmrc は Node.js 26 LTS を指定します', () => {
  assert.match(nvmrc, /^26\.\d+\.\d+$/);
});

test('Dockerfile のベースイメージは .nvmrc と同じ Node.js です', () => {
  const tags = [...read('Dockerfile').matchAll(/^FROM node:([^-@\s]+)/gm)].map((m) => m[1]);
  assert.ok(tags.length > 0);
  for (const tag of tags) {
    assert.equal(tag, nvmrc);
  }
});

test('package.json の engines は .nvmrc のメジャーバージョンに限定します', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.engines.node, `>=${nvmrc} <${Number(major) + 1}`);
});

test('実行中の Node.js は .nvmrc と同じバージョンです', () => {
  assert.equal(process.versions.node, nvmrc);
});
