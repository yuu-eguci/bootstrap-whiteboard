// 静的ファイルサーバ (scripts/serve.ts) を起動し、 HTTP の応答を確認します。
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

// HOST と PORT を指定してサーバを起動し、待ち受けを始めたら URL を返します。
const startServer = async function (t: test.TestContext, env: Record<string, string>): Promise<string> {
  const child = spawn(process.execPath, ['scripts/serve.ts'], { cwd: root, env: { ...process.env, ...env } });
  t.after(() => child.kill());
  const [line] = await once(child.stdout, 'data');
  return String(line).trim();
};

test('HOST と PORT で待ち受けるアドレスを指定できます', async (t) => {
  // Docker では 0.0.0.0 で待ち受け、コンテナの外から接続できるようにします。
  const url = await startServer(t, { HOST: '0.0.0.0', PORT: '4181' });
  assert.equal(url, 'http://0.0.0.0:4181/');
  assert.equal((await fetch('http://127.0.0.1:4181/')).status, 200);
});

test('ページを返し、ドットファイルとルート外へのアクセスを拒否します', async (t) => {
  const url = await startServer(t, { HOST: '127.0.0.1', PORT: '4182' });
  const index = await fetch(url);
  assert.equal(index.status, 200);
  assert.match(index.headers.get('content-type') ?? '', /^text\/html/);
  assert.equal((await fetch(new URL('js/auto-fill-date.js', url))).status, 200);
  assert.equal((await fetch(new URL('.nvmrc', url))).status, 403);
  assert.equal((await fetch(new URL('..%2F..%2Fetc%2Fpasswd', url))).status, 403);
  assert.equal((await fetch(new URL('missing.html', url))).status, 404);
});

test('SITE_DIR を指定すると、そのディレクトリだけを配信します', async (t) => {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-test-'));
  t.after(() => fs.rmSync(siteDir, { recursive: true }));
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<title>site</title>');
  const url = await startServer(t, { HOST: '127.0.0.1', PORT: '4183', SITE_DIR: siteDir });
  assert.equal(await (await fetch(url)).text(), '<title>site</title>');
  assert.equal((await fetch(new URL('scripts/serve.ts', url))).status, 404);
});
