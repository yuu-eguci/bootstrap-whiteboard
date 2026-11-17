// CDN へのリクエストを node_modules のファイルで応答し、ネットワークなしでテストできるようにします。
// 応答するファイルは CDN と同じバイト列なので、ブラウザによる SRI 検証もそのまま行われます。
// LIVE_CDN=1 のときは実際の CDN を使います。
import { test as base, type Route } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { resolveCdnUrl, localPath } from '../cdn-map.ts';

const types: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const fulfillFromNodeModules = async function (route: Route) {
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

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    if (!process.env.LIVE_CDN) {
      // テスト対象のサーバ (baseURL) 以外へのリクエストはすべてここで処理します。
      const origin = new URL(baseURL ?? '').origin;
      await context.route((url) => url.origin !== origin, fulfillFromNodeModules);
    }
    await use(context);
  },
});
export { expect, type Locator, type Page } from '@playwright/test';
