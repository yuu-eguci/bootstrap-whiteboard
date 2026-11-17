// src/*.ts から、 HTML が読み込む js/*.js を生成します。
// GitHub Pages はビルドせずに公開するため、生成したファイルもリポジトリに含めます。
import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');

// globalName があるものは、 export をそのグローバル変数として公開します。
const entries = [
  { source: 'src/auto-fill-date.ts', output: 'js/auto-fill-date.js', globalName: 'AutoFillDate' },
  { source: 'src/selmodal-page.ts', output: 'js/selmodal-page.js' },
  { source: 'src/selectbox-page.ts', output: 'js/selectbox-page.js' },
];

// 生成するファイルのパス (リポジトリ直下からの相対パス) と内容を返します。書き込みはしません。
export const generate = async function (): Promise<{ output: string; text: string }[]> {
  return Promise.all(entries.map(async ({ source, output, globalName }) => {
    const result = await build({
      absWorkingDir: root,
      entryPoints: [source],
      bundle: true,
      format: 'iife',
      globalName,
      target: 'es2020',
      charset: 'utf8',
      banner: { js: `// このファイルは ${source} から npm run build で生成しています。直接編集しないでください。` },
      write: false,
      logLevel: 'silent',
    });
    return { output, text: result.outputFiles[0].text };
  }));
};

if (import.meta.main) {
  for (const { output, text } of await generate()) {
    await writeFile(join(root, output), text);
    console.log(output);
  }
}
