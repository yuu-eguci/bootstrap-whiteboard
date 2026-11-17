bootstrap-whiteboard
===

Bootstrap 4.5.1 の挙動を GitHub Pages 上で試すための静的ページ集です。
過去の検証を残すため、 Bootstrap のバージョンは固定しています。

- Docker: 対応!
- Node.js: 26.13.1 (LTS) / npm 11.20.0
- TypeScript: 6.0.3 (ビルドは esbuild 0.28.2)
- Linter: ESLint 10.15.0
- Test: node:test / Playwright 1.65.1
- Bootstrap: 4.5.1

## パッと実行してみたい

Docker (Compose を含みます) だけで、ページのビルド・起動とテストができます。 Node.js は不要です。
イメージのビルドにはネットワークが必要です。

```bash
# src/*.ts をビルドしてページを起動します。 http://127.0.0.1:8080/ を開いてください。
docker compose up --build -d --wait web

# lint 、型チェック、単体テスト、ブラウザテストを実行します。
docker compose run --rm --build test

# 起動中の web に対してブラウザテストを実行します。
docker compose run --rm e2e

# 停止して、コンテナとネットワークを削除します。
docker compose --profile test down
```

- ポートを変えるときは `WEB_PORT=8081 docker compose up --build -d --wait web` のように指定します。
- web コンテナは GitHub Pages で公開するファイル (`*.html` 、 `css/` 、 `js/`) だけを配信します。
- ページは Bootstrap などを CDN から読み込むため、ブラウザで開くときはインターネット接続が必要です。
- テスト用のコンテナはインターネットに出られないネットワーク (`internal`) だけにつなぎます。 CDN へのリクエストは、 devDependencies の同じバージョンのパッケージのファイルで応答します (下記「開発」を参照してください) 。
- Compose を使わずに、 `docker build -t bootstrap-whiteboard-test .` と `docker run --rm --network none bootstrap-whiteboard-test` でテストだけ実行することもできます。

## GitHub Pages

- https://yuu-eguci.github.io/bootstrap-whiteboard/
- `master` ブランチのルートを Jekyll で公開しています。
- 開発用のファイル (テスト、設定、 Dockerfile 、 `compose.yaml` など) は `_config.yml` の `exclude` で公開対象から外しています。

## ページ一覧

| ページ | 内容 |
| --- | --- |
| `index.html` | 各ページへのリンク |
| `4.5.1.html` | Safari で collapse を動かすための検証 (`cursor: pointer`) |
| `4.5.1-selectbox.html` | 標準 select による年月日・時刻入力 |
| `4.5.1-selmodal.html` | selmodal による年月日・時刻入力 (#1) |

## selmodal 日付入力の仕様

- 年の候補は「今年の3年前〜3年後」と「入力済みの年」です。
- 未選択の select を最初にクリックすると、現在日時を入れます。
- その後に空欄を選んだ場合は、再クリックしても空欄のままです。
- 日を選んだ後に月を変えて日が存在しなくなった場合、その月の末日に丸めます。
- 入力欄が disabled のとき、選択ボタンも disabled にします。
- select の name 属性は、ページ内で重複しない連番で自動付与します。

## 外部依存

CDN から読み込み、すべてに SRI (`integrity`) を付けています。

| ライブラリ | バージョン | 取得元 |
| --- | --- | --- |
| Bootstrap | 4.5.1 | cdn.jsdelivr.net |
| jQuery | 3.5.1 | code.jquery.com |
| Popper.js | 1.16.1 | cdn.jsdelivr.net |
| Font Awesome Free | 5.14.0 | cdn.jsdelivr.net |

- Bootstrap 4 はサポートが終了しています。検証用としてバージョンを固定しています。
- devDependencies の同名パッケージも、 CDN と同じバージョンに固定しています (下記「開発」を参照してください) 。
- `js/Jquery.selmodal.js` と `css/selmodal.css` は、取得元とライセンスの記録がリポジトリ内にありません。
- `js/Jquery.selmodal.js` には、 HTML 文字列連結をやめる修正を加えています。
- `js/Jquery.selmodal.js` は外部由来のため TypeScript へ移行せず、 JavaScript のままにしています。型は `src/types/globals.d.ts` で宣言しています。

## 開発

### ソースと生成物

ページが読み込む自作の JavaScript は、 `src/*.ts` から `npm run build` (esbuild) で生成します。
GitHub Pages はビルドせずに公開するため、生成した `js/*.js` もコミットします。

| ソース | 生成物 | 読み込むページ |
| --- | --- | --- |
| `src/auto-fill-date.ts` | `js/auto-fill-date.js` (グローバル変数 `AutoFillDate`) | `4.5.1-selmodal.html` |
| `src/selmodal-page.ts` | `js/selmodal-page.js` | `4.5.1-selmodal.html` |
| `src/selectbox-page.ts` | `js/selectbox-page.js` | `4.5.1-selectbox.html` |

- `src/` を変更したら `npm run build` を実行し、 `js/` の変更もコミットします。生成物が古いと単体テストが失敗します。
- テスト、 Playwright 設定、開発用スクリプトも TypeScript です。 Node.js が型注釈を取り除いて直接実行します。
- `eslint.config.mjs` は JavaScript のままです。 ESLint で TypeScript の設定ファイルを読むには jiti が別途必要なためです。

### 環境とテスト

- Node.js 26.13.1 (LTS) と、同梱の npm を使います。バージョンは `.nvmrc` にあります。
- `.nvmrc` 、 `package.json` の `engines` 、 Dockerfile のベースイメージは、単体テストで一致を確認しています。
- ブラウザテストは CDN へ接続しません。 CDN の URL に、 devDependencies に入れた同じバージョンのパッケージのファイルで応答します。
- そのファイルは CDN と同じバイト列なので、ブラウザによる SRI 検証もテスト中に行われます。
- 実際の CDN で確認するときは `LIVE_CDN=1 npm run test:e2e` を実行します。
- パッケージのファイルはテストでだけ使い、リポジトリには含めません。

```bash
npm ci
npx playwright install --with-deps chromium
npm run lint
npm run typecheck
npm test
```

| コマンド | 内容 |
| --- | --- |
| `npm run build` | `src/*.ts` から `js/*.js` を生成 |
| `npm run lint` | ESLint (TypeScript と `js/Jquery.selmodal.js`) |
| `npm run typecheck` | `tsc` による型チェック (Node.js 用の `tsconfig.json` と、ブラウザ用の `src/tsconfig.json`) |
| `npm run test:unit` | `node --test` による単体テスト (日付計算、 SRI とパッケージのファイルの一致、 Node.js のバージョン指定、生成物と `src/` の一致、静的ファイルサーバ) |
| `npm run serve` | `scripts/serve.ts` でリポジトリ直下を http://127.0.0.1:4173/ に配信 (`HOST` 、 `PORT` 、 `SITE_DIR` で変更できます) |
| `npm run test:e2e` | Playwright (Chromium) によるブラウザテスト (`BASE_URL` を指定すると起動中のサーバが対象) |
| `npm test` | 単体テストとブラウザテスト |

## CI

- `.github/workflows/ci.yml` が `master` への push と pull request で lint 、型チェック、単体テスト、ブラウザテストを実行します。
- Docker ジョブでは、 Compose でのテスト、 web の起動、 HTTP 応答の確認、起動中の web に対するブラウザテストを実行します。
- GitHub Pages への公開は CI と連動していません。
