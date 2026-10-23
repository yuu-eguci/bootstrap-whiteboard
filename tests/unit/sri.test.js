'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));

// 外部から読み込む script と stylesheet のタグを抜き出します。
const externalTags = function (html) {
  const tags = html.match(/<(script|link)\b[^>]*>/gs) || [];
  return tags.filter((tag) => /\b(src|href)="https?:\/\//.test(tag) && (tag.startsWith('<script') || /rel="stylesheet"/.test(tag)));
};

for (const file of htmlFiles) {
  test(`${file} の外部リソースには SRI と crossorigin があります`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const tag of externalTags(html)) {
      assert.match(tag, /integrity="sha(256|384|512)-[A-Za-z0-9+/=]+"/, tag);
      assert.match(tag, /crossorigin="anonymous"/, tag);
    }
  });

  test(`${file} は旧 StackPath CDN を使いません`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(html, /stackpath\.bootstrapcdn\.com/);
  });
}

// CDN の各ファイルが node_modules の同バージョンと同じバイト列であることを確認します。
// ブラウザテストは CDN の代わりに node_modules のファイルを使うためです。
const crypto = require('node:crypto');
const { resolveCdnUrl, localPath } = require('../cdn-map.js');

for (const file of htmlFiles) {
  test(`${file} の SRI は node_modules の同バージョンのファイルと一致します`, () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const tag of externalTags(html)) {
      const url = tag.match(/\b(?:src|href)="([^"]+)"/)[1];
      const target = resolveCdnUrl(url);
      assert.ok(target, `対応表にない URL です: ${url}`);
      const local = localPath(target);
      const pkg = JSON.parse(fs.readFileSync(path.join(local.pkgDir, 'package.json'), 'utf8'));
      assert.equal(pkg.version, target.version, url);
      const [, algorithm, expected] = tag.match(/integrity="(sha\d+)-([^"]+)"/);
      const digest = crypto.createHash(algorithm).update(fs.readFileSync(local.file)).digest('base64');
      assert.equal(digest, expected, url);
    }
  });
}
