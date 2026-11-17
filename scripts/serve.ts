// 静的ファイルサーバです。テストと、 Docker の web イメージで使います。
// SITE_DIR (既定はリポジトリ直下) だけを配信します。
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.SITE_DIR ? join(resolve(process.env.SITE_DIR), sep) : fileURLToPath(new URL('..', import.meta.url));
// Docker では HOST=0.0.0.0 にして、コンテナの外から接続できるようにします。
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  const file = normalize(join(root, pathname.endsWith('/') ? `${pathname}index.html` : pathname));
  // ルート外へのアクセスと、ドットファイルへのアクセスを拒否します。
  if (!file.startsWith(root) || file.slice(root.length).split(sep).some((p) => p.startsWith('.'))) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(port, host, () => {
  console.log(`http://${host}:${port}/`);
});
