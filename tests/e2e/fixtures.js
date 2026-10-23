'use strict';
// CDN へのリクエストを node_modules のファイルで応答し、ネットワークなしでテストできるようにします。
// 応答するファイルは CDN と同じバイト列なので、ブラウザによる SRI 検証もそのまま行われます。
// LIVE_CDN=1 のときは実際の CDN を使います。
const base = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const { resolveCdnUrl, localPath } = require('../cdn-map.js');

const types = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

const fulfillFromNodeModules = async function (route) {
  const target = resolveCdnUrl(route.request().url());
  if (!target) {
    return route.abort('blockedbyclient');
  }
  const local = localPath(target);
  // バージョン違いや存在しないファイルは 404 にして、テストを失敗させます。
  if (!local || !fs.existsSync(local.file)
    || JSON.parse(fs.readFileSync(path.join(local.pkgDir, 'package.json'), 'utf8')).version !== target.version) {
    return route.fulfill({ status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
  return route.fulfill({
    status: 200,
    body: fs.readFileSync(local.file),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': types[path.extname(local.file)] || 'application/octet-stream',
    },
  });
};

exports.test = base.test.extend({
  context: async ({ context }, use) => {
    if (!process.env.LIVE_CDN) {
      // ローカルサーバ以外へのリクエストはすべてここで処理します。
      await context.route((url) => url.hostname !== '127.0.0.1', fulfillFromNodeModules);
    }
    await use(context);
  },
});
exports.expect = base.expect;
