// HTML が読み込む JavaScript のうち、 src/ の外にあるもの・別ファイルのものの型です。

// js/auto-fill-date.js がグローバル変数として公開する API です。
declare const AutoFillDate: typeof import('../auto-fill-date.ts');

// js/Jquery.selmodal.js (外部由来の jQuery プラグイン) が追加するメソッドです。
interface JQuery {
  selModal(): void;
  selModalSetValue(value: string): void;
  openSelModal(): void;
}
