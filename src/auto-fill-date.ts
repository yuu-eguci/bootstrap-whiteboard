// selmodal 日付入力で使う、 DOM に依存しない計算処理です。
// ビルドすると js/auto-fill-date.js になり、ブラウザではグローバル変数 AutoFillDate として公開します。

// ゼロ埋め2桁です。
export const zeroPadding2 = function (obj: number | string): string {
  return obj.toString().padStart(2, '0');
};

// 年の候補です。今年の3年前〜3年後に、入力済みの年を加えます。
export const buildYearOptions = function (currentYear: number, extraYears: Iterable<string>): number[] {
  const years = new Set([...Array(7).keys()].map((i) => currentYear - 3 + i));
  for (const y of extraYears) {
    if (/^\d{4}$/.test(y)) {
      years.add(Number(y));
    }
  }
  return [...years].sort((a, b) => a - b);
};

// 指定年月の日の候補です。表示用に曜日をつけます。
export const buildDateOptions = function (yyyy: string, mm: string): { values: string[]; texts: string[] } {
  const values: string[] = [];
  const texts: string[] = [];
  const lastDate = new Date(Number(yyyy), Number(mm), 0).getDate();
  for (let i = 1; i <= lastDate; i++) {
    // NOTE: Date において month は 0 スタートです。
    const day = new Date(Number(yyyy), Number(mm) - 1, i).getDay();
    values.push(zeroPadding2(i));
    texts.push(`${zeroPadding2(i)} (${'日月火水木金土'[day]})`);
  }
  return { values, texts };
};

// 指定年月に存在しない日を、その月の末日に丸めます。
export const clampDate = function (yyyy: string, mm: string, dd: string | number): string {
  const lastDate = new Date(Number(yyyy), Number(mm), 0).getDate();
  return zeroPadding2(Math.min(Number(dd), lastDate));
};

// ページ内で重複しない name を連番で返す関数を作ります。
export const createNameGenerator = function (prefix: string): () => string {
  let count = 0;
  return function () {
    count += 1;
    return prefix + count;
  };
};
