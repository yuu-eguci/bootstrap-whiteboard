bootstrap-whiteboard
===

Bootstrap 4.5.1 の挙動を GitHub Pages 上で試すための静的ページ集。
過去の検証を残すため、 Bootstrap のバージョンは固定している。

- Docker: 対応!
- Node.js: 24.22.1 (LTS)
- Linter: ESLint 10.13.0
- Test: node:test / Playwright 1.64.1
- Bootstrap: 4.5.1

## パッと実行してみたい

Docker で lint とテストを実行できる。
イメージのビルドにはネットワークが必要。テストの実行には不要。

```bash
docker build -t bootstrap-whiteboard-test .
docker run --rm --network none bootstrap-whiteboard-test
```

## GitHub Pages

- https://yuu-eguci.github.io/bootstrap-whiteboard/
- `master` ブランチのルートを Jekyll で公開している。
- 開発用のファイル (テスト、設定、 Dockerfile など) は `_config.yml` の `exclude` で公開対象から外している。

## ページ一覧

| ページ | 内容 |
| --- | --- |
| `index.html` | 各ページへのリンク |
| `4.5.1.html` | Safari で collapse を動かすための検証 (`cursor: pointer`) |
| `4.5.1-selectbox.html` | 標準 select による年月日・時刻入力 |
| `4.5.1-selmodal.html` | selmodal による年月日・時刻入力 (#1) |

## selmodal 日付入力の仕様

- 年の候補は「今年の3年前〜3年後」と「入力済みの年」。
- 未選択の select を最初にクリックすると、現在日時を入れる。
- その後に空欄を選んだ場合は、再クリックしても空欄のまま。
- 日を選んだ後に月を変えて日が存在しなくなった場合、その月の末日に丸める。
- 入力欄が disabled のとき、選択ボタンも disabled にする。
- select の name 属性は、ページ内で重複しない連番で自動付与する。

## 外部依存

CDN から読み込み、すべてに SRI (`integrity`) を付けている。

| ライブラリ | バージョン | 取得元 |
| --- | --- | --- |
| Bootstrap | 4.5.1 | cdn.jsdelivr.net |
| jQuery | 3.5.1 | code.jquery.com |
| Popper.js | 1.16.1 | cdn.jsdelivr.net |
| Font Awesome Free | 5.14.0 | cdn.jsdelivr.net |

- Bootstrap 4 はサポート終了済み。検証用としてバージョンを固定している。
- `js/Jquery.selmodal.js` と `css/selmodal.css` は、取得元とライセンスの記録がリポジトリ内にない。
- `js/Jquery.selmodal.js` には、 HTML 文字列連結をやめる修正を加えている。

## 開発

- Node.js 24.22.1 (LTS) を使う。バージョンは `.nvmrc` にある。
- ブラウザテストは CDN へ接続しない。 CDN の URL を、 devDependencies に入れた同じバージョンのパッケージのファイルで応答する。
- そのファイルは CDN と同じバイト列なので、ブラウザによる SRI 検証もテスト中に行われる。
- 実際の CDN で確認するときは `LIVE_CDN=1 npm run test:e2e` を実行する。
- パッケージのファイルはテストでだけ使い、リポジトリには含めない。

```bash
npm ci
npx playwright install --with-deps chromium
npm run lint
npm test
```

| コマンド | 内容 |
| --- | --- |
| `npm run lint` | ESLint (HTML 内のインライン script も対象) |
| `npm run test:unit` | `node --test` による単体テスト (日付計算、 SRI とパッケージのファイルの一致) |
| `npm run test:e2e` | Playwright (Chromium) によるブラウザテスト |
| `npm test` | 単体テストとブラウザテスト |

## CI

- `.github/workflows/ci.yml` が `master` への push と pull request で lint、単体テスト、ブラウザテスト、 Docker テストを実行する。
- GitHub Pages への公開は CI と連動していない。
