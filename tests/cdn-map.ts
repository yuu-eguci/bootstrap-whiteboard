// CDN の URL と node_modules 内のファイルの対応です。テストで CDN の代わりに使います。
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');

export type CdnTarget = { name: string; version: string; file: string };

// CDN の URL を { name, version, file } に変換します。対応しない URL は null です。
export const resolveCdnUrl = function (url: string): CdnTarget | null {
  if (url === 'https://code.jquery.com/jquery-3.5.1.min.js') {
    return { name: 'jquery', version: '3.5.1', file: 'dist/jquery.min.js' };
  }
  const m = url.match(/^https:\/\/cdn\.jsdelivr\.net\/npm\/((?:@[^/]+\/)?[^@/]+)@([^/]+)\/([^?#]+)$/);
  return m ? { name: m[1], version: m[2], file: m[3] } : null;
};

// 対応するパッケージ内のファイルパスです。パッケージ外を指す場合は null です。
export const localPath = function (target: CdnTarget): { pkgDir: string; file: string } | null {
  const pkgDir = path.join(root, 'node_modules', target.name);
  const file = path.normalize(path.join(pkgDir, target.file));
  return file.startsWith(pkgDir + path.sep) ? { pkgDir, file } : null;
};
