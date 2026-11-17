// 4.5.1-selectbox.html の日付・時刻入力です。
// ビルドすると js/selectbox-page.js になります。 jQuery の後に読み込みます。

// 入力欄や select の値を文字列で返します。値がない (null や undefined) ときは空文字です。
const fieldValue = function (field: JQuery): string {
  return String(field.val() ?? '');
};

// Selectbox を初期化します。
// NOTE: 日付や時刻の auto fill のために用意した関数です。
const _initializeSelectbox = function (
  selectIdentifier: JQuery,
  optionValues: (string | number)[],
  optionTexts: (string | number)[],
  defaultValue?: string,
) {
  if (!defaultValue) {
    defaultValue = '';
  }
  // 何度も呼び出される可能性を考慮し、 empty() します。
  $(selectIdentifier).empty();
  // 先頭の option は空欄にしています。
  $(selectIdentifier).append($(`<option${defaultValue === '' ? ' selected' : ''}>`).val(''));
  for (let i = 0; i < optionValues.length; i++) {
    $(selectIdentifier).append($(`<option${defaultValue === optionValues[i] ? ' selected' : ''}>`).text(optionTexts[i]).val(optionValues[i]));
  }
  // NOTE: 下記2点の機能をセレクトボックスに与えるため、用意した data 属性です。
  // - セレクトボックス未選択時、最初のクリックでは現在日時をセットしたい。
  // - その後に未選択を選択することも可能にしたい。
  // この data 属性なしでは、空欄を意図的に選択することができません。
  $(selectIdentifier).data('is-clicked-after-loaded', true);
  // defaultValue を select の value 値に設定します。
  $(selectIdentifier).val(defaultValue).change();
};

// 何かと使う Date オブジェクトを初期化しておきます。
const dateNow = new Date();

// ゼロ埋め2桁です。
const zeroPadding2 = function (obj: number | string): string {
  return obj.toString().padStart(2, '0');
};

const initializeAutoFillYear = function (selectIdentifier: JQuery, defaultValue?: string) {
  // NOTE: 年の候補は3年前～3年後にしてみます。
  let threeYearsAgoYear = dateNow.getFullYear() - 4;
  const optionValues = [...Array(7).keys()].map(() => ++threeYearsAgoYear);
  _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
};

const initializeAutoFillMonth = function (selectIdentifier: JQuery, defaultValue?: string) {
  const optionValues = [...Array(12).keys()].map(i => zeroPadding2(i + 1));
  _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
};

const initializeAutoFillDate = function (selectIdentifier: JQuery, defaultValue?: string) {
  const optionValues = [...Array(31).keys()].map(i => zeroPadding2(i + 1));
  // NOTE: 年月が選択されていないときは曜日を表示しようがありません 。
  _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
};

// UX 向上のため、曜日も表示します。もちろん年月が選択されているときに限ります。
const initializeAutoFillDateWithDayOfTheWeek = function (clickedSelectbox: JQuery, defaultValue?: string) {
  const p = $(clickedSelectbox).closest('.auto-fill-date-only');
  const yyyy = fieldValue(p.find('.auto-fill-year'));
  const mm = fieldValue(p.find('.auto-fill-month'));
  if (yyyy && mm) {
    // OK.
  } else {
    // 年月選択のないときは何もしません。
    // NOTE: ここで何もしない場合、「年月が空なのに曜日が表示されている」という状況がありえます。
    // NOTE: 再び「年月を選択」->「日付セレクトボックスをクリック」すれば曜日が正しくなるので、それでよいことにします。
    return;
  }
  // すでにこの年月の options が作成されている場合、再度作成する必要はありません。
  // NOTE: このチェックがないと、「date 選択のためクリック」->「options 初期化」->「選択がリセット」されてしまいます。
  if ($(clickedSelectbox).data('year') + $(clickedSelectbox).data('month') === yyyy + mm) {
    return;
  }

  const optionValues: string[] = [];
  const optionTextsWithDayOfTheWeek: string[] = [];
  // NOTE: Date において month は 0 スタートです。
  const dateOfSpecificYearMonth = new Date(Number(yyyy), Number(mm) - 1, 1);
  for (let i = 1; i < 32; i++) {
    const optionValue = zeroPadding2(i);
    dateOfSpecificYearMonth.setDate(Number(optionValue));
    // NOTE: 月を跨いだら終了します。 30, 31日のない月への対応です。 2020/02 が閏月です。(確認用メモ)
    if (dateOfSpecificYearMonth.getMonth() + 1 !== Number(mm)) {
      break;
    }
    optionValues.push(optionValue);
    optionTextsWithDayOfTheWeek.push(`${optionValue} (${'日月火水木金土'[dateOfSpecificYearMonth.getDay()]})`);
  }
  // data-year, data-month を付与し、このセレクトボックスだけ見れば「何年何月の date 一覧なのか」わかるようにします。
  $(clickedSelectbox).data('year', yyyy);
  $(clickedSelectbox).data('month', mm);
  _initializeSelectbox(clickedSelectbox, optionValues, optionTextsWithDayOfTheWeek, defaultValue);
};

const initializeAutoFillHour = function (selectIdentifier: JQuery, defaultValue?: string) {
  const optionValues = [...Array(24).keys()].map(i => zeroPadding2(i));
  _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
};

const initializeAutoFillMinute = function (selectIdentifier: JQuery, defaultValue?: string) {
  const optionValues = [...Array(60).keys()].map(i => zeroPadding2(i));
  _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
};

const initializeSelectboxesForDateTime = function () {

  // select.auto-fill-year, -month, -date, -hour, -minute を初期化します。 Option 埋めと、 data 属性の付与です。
  initializeAutoFillYear($('.auto-fill-year'));
  initializeAutoFillMonth($('.auto-fill-month'));
  initializeAutoFillDate($('.auto-fill-date'));
  initializeAutoFillHour($('.auto-fill-hour'));
  initializeAutoFillMinute($('.auto-fill-minute'));

  // ↑これらの selectbox が最初に選択されるときは、現地時刻に合わせます。
  // 最初の選択かどうかは「画面が開かれてから最初のクリックである」「現在の値が空欄である」で判断します。
  const _isFirstClick = function (clickedElement: HTMLElement) {
    const ret = $(clickedElement).data('is-clicked-after-loaded') && $(clickedElement).val() === '';
    $(clickedElement).data('is-clicked-after-loaded', false);
    return ret;
  };
  $('.auto-fill-year').on('click', function () {
    if (_isFirstClick(this)) {
      const value = zeroPadding2(dateNow.getFullYear());
      initializeAutoFillYear($(this), value);
    }
  });
  $('.auto-fill-month').on('click', function () {
    if (_isFirstClick(this)) {
      const value = zeroPadding2(dateNow.getMonth() + 1);
      initializeAutoFillMonth($(this), value);
    }
  });
  $('.auto-fill-date').on('click', function () {
    if (_isFirstClick(this)) {
      const value = zeroPadding2(dateNow.getDate());
      initializeAutoFillDateWithDayOfTheWeek($(this), value);
    } else {
      // initializeAutoFillDate() によってすでに選択肢は埋まっているはずです。
      // ただし条件が揃っていれば曜日も表示したいので、クリック時に曜日付き選択肢を生成します。
      initializeAutoFillDateWithDayOfTheWeek($(this));
    }
  });
  $('.auto-fill-hour').on('click', function () {
    if (_isFirstClick(this)) {
      const value = zeroPadding2(dateNow.getHours());
      initializeAutoFillHour($(this), value);
    }
  });
  $('.auto-fill-minute').on('click', function () {
    if (_isFirstClick(this)) {
      const value = zeroPadding2(dateNow.getMinutes());
      initializeAutoFillMinute($(this), value);
    }
  });

};

$(function () {
  initializeSelectboxesForDateTime();
});
