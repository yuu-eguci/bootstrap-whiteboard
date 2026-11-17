// 4.5.1-selmodal.html の日付・時刻入力です。
// ビルドすると js/selmodal-page.js になります。 jQuery 、 js/Jquery.selmodal.js 、 js/auto-fill-date.js の後に読み込みます。

// 入力欄や select の値を文字列で返します。値がない (null や undefined) ときは空文字です。
const fieldValue = function (field: JQuery): string {
  return String(field.val() ?? '');
};

const setNameAttributesForSelmodal = function () {
  console.info('selmodal 用の name 属性を自動付与します。');
  // selmodal 利用のための name 属性を設定します。
  const nextName = AutoFillDate.createNameGenerator('selmodal-');
  const foo = function (identifier: HTMLElement) {
    // すでに name 属性があればスキップします。既存の name を消す必要はありません。
    if ($(identifier).prop('name')) {
      return;
    }
    // NOTE: ページ内で重複しないよう連番です。
    $(identifier).prop('name', nextName());
  };
  $('.auto-fill-year select').each(function () { foo(this); });
  $('.auto-fill-month select').each(function () { foo(this); });
  $('.auto-fill-date select').each(function () { foo(this); });
  $('.auto-fill-hour select').each(function () { foo(this); });
  $('.auto-fill-minute select').each(function () { foo(this); });
};

const zeroPadding2 = AutoFillDate.zeroPadding2;

const _initializeSelectbox = function (
  selectIdentifier: JQuery,
  optionValues: string[],
  optionTexts: string[],
  defaultValue?: string,
) {
  console.info('Selectbox 初期化します。');
  if (!defaultValue) {
    defaultValue = '';
  }
  // 何度も呼び出される可能性を考慮し、 empty() します。
  $(selectIdentifier).empty();
  // 先頭の option は空欄にしています。
  $(selectIdentifier).append($('<option>').val(''));
  for (let i = 0; i < optionValues.length; i++) {
    $(selectIdentifier).append($('<option>').text(optionTexts[i]).val(optionValues[i]));
  }
  // NOTE: 下記2点の機能をセレクトボックスに与えるため、用意した data 属性です。
  // - セレクトボックス未選択時、最初のクリックでは現在日時をセットしたい。
  // - その後に未選択を選択することも可能にしたい。
  // この data 属性なしでは、空欄を意図的に選択することができません。
  $(selectIdentifier).data('is-clicked-after-loaded', true);
  // defaultValue を select の value 値に設定します。
  $(selectIdentifier).val(defaultValue);
  // Selmodal 化します。
  $(selectIdentifier).selModal();
};

const initializeAutoFillYear = function (defaultValue?: string) {
  console.info('AutoFillYear 初期化します。');
  // NOTE: 年の候補は3年前～3年後と、入力済みの年です。
  const prefilledYears = $('.auto-fill-date-only input, .auto-fill-month-only input').map(function () {
    return fieldValue($(this)).slice(0, 4);
  }).get();
  const optionValues = AutoFillDate.buildYearOptions(new Date().getFullYear(), prefilledYears).map(String);
  _initializeSelectbox($('.auto-fill-year select'), optionValues, optionValues, defaultValue);
};

const initializeAutoFillMonth = function (defaultValue?: string) {
  console.info('AutoFillMonth 初期化します。');
  const optionValues = [...Array(12).keys()].map(i => zeroPadding2(i + 1));
  _initializeSelectbox($('.auto-fill-month select'), optionValues, optionValues, defaultValue);
};

const initializeAutoFillDate = function (defaultValue?: string) {
  console.info('AutoFillDate 初期化します。');
  // NOTE: date の options は年月の選択後に初期化します。年月によって変化するためです。
  _initializeSelectbox($('.auto-fill-date select'), [], [], defaultValue);
};

const initializeAutoFillDateWithDayOfTheWeek = function (yyyy: string, mm: string, selectDate: JQuery, defaultValue?: string) {
  console.info('AutoFillDate 曜日つきで初期化します。');
  if (yyyy && mm) {
    // OK. 曜日取得が可能なので続行します。
  } else {
    // 年月が選択されていないときは曜日を表示しようがありません。
    return;
  }
  const options = AutoFillDate.buildDateOptions(yyyy, mm);
  _initializeSelectbox(selectDate, options.values, options.texts, defaultValue);
};

const initializeAutoFillHour = function (defaultValue?: string) {
  console.info('AutoFillHour 初期化します。');
  const optionValues = [...Array(24).keys()].map(i => zeroPadding2(i));
  _initializeSelectbox($('.auto-fill-hour select'), optionValues, optionValues, defaultValue);
};

const initializeAutoFillMinute = function (defaultValue?: string) {
  console.info('AutoFillMinute 初期化します。');
  const optionValues = [...Array(60).keys()].map(i => zeroPadding2(i));
  _initializeSelectbox($('.auto-fill-minute select'), optionValues, optionValues, defaultValue);
};

const reflectHiddenInputToSelectboxesForAutoFillSelectboxes = function () {
  console.info('input の状態を selectbox へ反映させます。');
  const _getNeighborButton = function (identifier: JQuery) {
    return $(identifier).parent().find('button.selModalButton');
  };
  for (const p of $('.auto-fill-date-only')) {
    const selectboxYear = $(p).find('.auto-fill-year select');
    const selectboxMonth = $(p).find('.auto-fill-month select');
    const selectboxDate = $(p).find('.auto-fill-date select');
    const input = $(p).find('input');
    // Disabled 状態を同期します。
    $(_getNeighborButton(selectboxYear)).prop('disabled', $(input).prop('disabled'));
    $(_getNeighborButton(selectboxMonth)).prop('disabled', $(input).prop('disabled'));
    $(_getNeighborButton(selectboxDate)).prop('disabled', $(input).prop('disabled'));
    if (!fieldValue(input)) {
      continue;
    }
    // 値がある -> Selectbox でその値を select
    const yyyy = fieldValue(input).slice(0, 4);
    const mm = fieldValue(input).slice(5, 7);
    const dd = fieldValue(input).slice(8);
    selectboxYear.selModalSetValue(yyyy);
    selectboxMonth.selModalSetValue(mm);
    // ↑年月を選択したので、曜日が取得できます。ここでボタンが再生性されるため disabled をつけなおす必要があります。
    initializeAutoFillDateWithDayOfTheWeek(yyyy, mm, selectboxDate, dd);
    $(_getNeighborButton(selectboxDate)).prop('disabled', $(input).prop('disabled'));
    // ↓以下も同様の処理です。
  }
  for (const p of $('.auto-fill-month-only')) {
    const selectboxYear = $(p).find('.auto-fill-year select');
    const selectboxMonth = $(p).find('.auto-fill-month select');
    const input = $(p).find('input');
    $(_getNeighborButton(selectboxYear)).prop('disabled', $(input).prop('disabled'));
    $(_getNeighborButton(selectboxMonth)).prop('disabled', $(input).prop('disabled'));
    if (!fieldValue(input)) {
      continue;
    }
    selectboxYear.selModalSetValue(fieldValue(input).slice(0, 4));
    selectboxMonth.selModalSetValue(fieldValue(input).slice(5));
  }
  for (const p of $('.auto-fill-time-only')) {
    const selectboxHour = $(p).find('.auto-fill-hour select');
    const selectboxMinute = $(p).find('.auto-fill-minute select');
    const input = $(p).find('input');
    $(_getNeighborButton(selectboxHour)).prop('disabled', $(input).prop('disabled'));
    $(_getNeighborButton(selectboxMinute)).prop('disabled', $(input).prop('disabled'));
    if (!fieldValue(input)) {
      continue;
    }
    selectboxHour.selModalSetValue(fieldValue(input).slice(0, 2));
    selectboxMinute.selModalSetValue(fieldValue(input).slice(3));
  }
};

const registerOnClickEventsForAutoFillSelectboxes = function () {
  console.info('onclick イベントを登録します。');
  const _getNeighborSelect = function (identifier: HTMLElement) {
    return $(identifier).parent().find('select');
  };
  const _isFirstClick = function (clickedButton: HTMLElement) {
    const neighborSelect = _getNeighborSelect(clickedButton);
    const ret = $(neighborSelect).data('is-clicked-after-loaded') && $(neighborSelect).val() === '';
    $(neighborSelect).data('is-clicked-after-loaded', false);
    return ret;
  };
  $(document).on('click', '.auto-fill-year button.selModalButton', function () {
    console.info('on click year');
    if (_isFirstClick(this)) {
      $(_getNeighborSelect(this)).selModalSetValue(new Date().getFullYear().toString());
      $(_getNeighborSelect(this)).change();
    }
  });
  $(document).on('click', '.auto-fill-month button.selModalButton', function () {
    console.info('on click month');
    if (_isFirstClick(this)) {
      $(_getNeighborSelect(this)).selModalSetValue(zeroPadding2(new Date().getMonth() + 1));
      $(_getNeighborSelect(this)).change();
    }
  });
  $(document).on('click', '.auto-fill-hour button.selModalButton', function () {
    console.info('on click hour');
    if (_isFirstClick(this)) {
      $(_getNeighborSelect(this)).selModalSetValue(zeroPadding2(new Date().getHours()));
      $(_getNeighborSelect(this)).change();
    }
  });
  $(document).on('click', '.auto-fill-minute button.selModalButton', function () {
    console.info('on click minute');
    if (_isFirstClick(this)) {
      $(_getNeighborSelect(this)).selModalSetValue(zeroPadding2(new Date().getMinutes()));
      $(_getNeighborSelect(this)).change();
    }
  });
};

const registerOnChangeEventsForAutoFillSelectboxes = function () {
  console.info('onchange イベントを登録します。');
  $(document).on('change', '.auto-fill-date-only select', function () {
    console.info('on change date-only');
    // 親 form-row です。この中に年月日が含まれます。
    const p = $(this).closest('.auto-fill-date-only');
    const selectYear = p.find('.auto-fill-year select');
    const selectMonth = p.find('.auto-fill-month select');
    const selectDate = p.find('.auto-fill-date select');
    const input = p.find('input');
    if (fieldValue($(this))) {
      // 各値です。 NOTE: 日付の境界をまたがないよう、現在日時は1回だけ取得します。
      const now = new Date();
      const yyyy = fieldValue(selectYear) || now.getFullYear().toString();
      const mm = fieldValue(selectMonth) || zeroPadding2(now.getMonth() + 1);
      // NOTE: 月を変えて日が存在しなくなった場合、月末に丸めます。
      const dd = AutoFillDate.clampDate(yyyy, mm, fieldValue(selectDate) || now.getDate());
      selectYear.selModalSetValue(yyyy);
      selectMonth.selModalSetValue(mm);
      initializeAutoFillDateWithDayOfTheWeek(yyyy, mm, selectDate, dd);
      // hidden input を埋めます。
      input.val(`${yyyy}/${mm}/${dd}`).change();
      return;
    }
    // 空値が選ばれたときは hidden input も空欄にしたいと判断します。
    selectYear.selModalSetValue('');
    selectMonth.selModalSetValue('');
    selectDate.selModalSetValue('');
    input.val('').change();
  });
  $(document).on('change', '.auto-fill-month-only select', function () {
    console.info('on change month-only');
    const p = $(this).closest('.auto-fill-month-only');
    const selectYear = p.find('.auto-fill-year select');
    const selectMonth = p.find('.auto-fill-month select');
    const input = p.find('input');
    if (fieldValue($(this))) {
      // 各値です。
      const now = new Date();
      const yyyy = fieldValue(selectYear) || now.getFullYear().toString();
      const mm = fieldValue(selectMonth) || zeroPadding2(now.getMonth() + 1);
      selectYear.selModalSetValue(yyyy);
      selectMonth.selModalSetValue(mm);
      // hidden input を埋めます。
      input.val(`${yyyy}/${mm}`).change();
      return;
    }
    // 空値が選ばれたときは hidden input も空欄にしたいと判断します。
    selectYear.selModalSetValue('');
    selectMonth.selModalSetValue('');
    input.val('').change();
  });
  $(document).on('change', '.auto-fill-time-only select', function () {
    console.info('on change time-only');
    const p = $(this).closest('.auto-fill-time-only');
    const selectHour = p.find('.auto-fill-hour select');
    const selectMinute = p.find('.auto-fill-minute select');
    const input = p.find('input');
    if (fieldValue($(this))) {
      // 各値です。
      const now = new Date();
      const hh = fieldValue(selectHour) || zeroPadding2(now.getHours());
      const mm = fieldValue(selectMinute) || zeroPadding2(now.getMinutes());
      selectHour.selModalSetValue(hh);
      selectMinute.selModalSetValue(mm);
      // hidden input を埋めます。
      input.val(`${hh}:${mm}`).change();
      return;
    }
    // 空値が選ばれたときは hidden input も空欄にしたいと判断します。
    selectHour.selModalSetValue('');
    selectMinute.selModalSetValue('');
    input.val('').change();
  });
};

$(function () {
  // selmodal 用の name 属性を自動付与します。
  setNameAttributesForSelmodal();

  // select.auto-fill-year, -month, -date, -hour, -minute を初期化します。
  initializeAutoFillYear();
  initializeAutoFillMonth();
  initializeAutoFillDate();
  initializeAutoFillHour();
  initializeAutoFillMinute();

  // input の状態を selectbox へ反映させます。
  reflectHiddenInputToSelectboxesForAutoFillSelectboxes();

  // select.auto-fill-year, -month, -date, -hour, -minute に onclick イベントを登録します。
  registerOnClickEventsForAutoFillSelectboxes();

  // select.auto-fill-year, -month, -date, -hour, -minute に onchange イベントを登録します。
  registerOnChangeEventsForAutoFillSelectboxes();
});
