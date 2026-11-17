bootstrap-whiteboard
===

Bootstrap 4.5.1 の挙動を GitHub Pages 上で試すための静的ページ集です。
過去の検証を残すため、 Bootstrap のバージョンは固定しています。

- Docker: 対応!
- Node.js: 26.13.1 (LTS) / npm 11.20.0
- Linter: ESLint 10.15.0
- Test: node:test / Playwright 1.65.1
- Bootstrap: 4.5.1

## パッと実行してみたい

Docker で lint とテストを実行できます。
イメージのビルドにはネットワークが必要です。テストの実行には不要です。

```bash
docker build -t bootstrap-whiteboard-test .
docker run --rm --network none bootstrap-whiteboard-test
```

## GitHub Pages

- https://yuu-eguci.github.io/bootstrap-whiteboard/
- `master` ブランチのルートを Jekyll で公開しています。
- 開発用のファイル (テスト、設定、 Dockerfile など) は `_config.yml` の `exclude` で公開対象から外しています。

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

## 開発

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
npm test
```

| コマンド | 内容 |
| --- | --- |
| `npm run lint` | ESLint (HTML 内のインライン script も対象) |
| `npm run test:unit` | `node --test` による単体テスト (日付計算、 SRI とパッケージのファイルの一致、 Node.js のバージョン指定) |
| `npm run test:e2e` | Playwright (Chromium) によるブラウザテスト |
| `npm test` | 単体テストとブラウザテスト |

## CI

- `.github/workflows/ci.yml` が `master` への push と pull request で lint 、単体テスト、ブラウザテスト、 Docker テストを実行します。
- GitHub Pages への公開は CI と連動していません。
