// このファイルは src/selectbox-page.ts から npm run build で生成しています。直接編集しないでください。
"use strict";
(() => {
  // src/selectbox-page.ts
  var fieldValue = function(field) {
    return String(field.val() ?? "");
  };
  var _initializeSelectbox = function(selectIdentifier, optionValues, optionTexts, defaultValue) {
    if (!defaultValue) {
      defaultValue = "";
    }
    $(selectIdentifier).empty();
    $(selectIdentifier).append($(`<option${defaultValue === "" ? " selected" : ""}>`).val(""));
    for (let i = 0; i < optionValues.length; i++) {
      $(selectIdentifier).append($(`<option${defaultValue === optionValues[i] ? " selected" : ""}>`).text(optionTexts[i]).val(optionValues[i]));
    }
    $(selectIdentifier).data("is-clicked-after-loaded", true);
    $(selectIdentifier).val(defaultValue).change();
  };
  var dateNow = /* @__PURE__ */ new Date();
  var zeroPadding2 = function(obj) {
    return obj.toString().padStart(2, "0");
  };
  var initializeAutoFillYear = function(selectIdentifier, defaultValue) {
    let threeYearsAgoYear = dateNow.getFullYear() - 4;
    const optionValues = [...Array(7).keys()].map(() => ++threeYearsAgoYear);
    _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillMonth = function(selectIdentifier, defaultValue) {
    const optionValues = [...Array(12).keys()].map((i) => zeroPadding2(i + 1));
    _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillDate = function(selectIdentifier, defaultValue) {
    const optionValues = [...Array(31).keys()].map((i) => zeroPadding2(i + 1));
    _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillDateWithDayOfTheWeek = function(clickedSelectbox, defaultValue) {
    const p = $(clickedSelectbox).closest(".auto-fill-date-only");
    const yyyy = fieldValue(p.find(".auto-fill-year"));
    const mm = fieldValue(p.find(".auto-fill-month"));
    if (yyyy && mm) {
    } else {
      return;
    }
    if ($(clickedSelectbox).data("year") + $(clickedSelectbox).data("month") === yyyy + mm) {
      return;
    }
    const optionValues = [];
    const optionTextsWithDayOfTheWeek = [];
    const dateOfSpecificYearMonth = new Date(Number(yyyy), Number(mm) - 1, 1);
    for (let i = 1; i < 32; i++) {
      const optionValue = zeroPadding2(i);
      dateOfSpecificYearMonth.setDate(Number(optionValue));
      if (dateOfSpecificYearMonth.getMonth() + 1 !== Number(mm)) {
        break;
      }
      optionValues.push(optionValue);
      optionTextsWithDayOfTheWeek.push(`${optionValue} (${"日月火水木金土"[dateOfSpecificYearMonth.getDay()]})`);
    }
    $(clickedSelectbox).data("year", yyyy);
    $(clickedSelectbox).data("month", mm);
    _initializeSelectbox(clickedSelectbox, optionValues, optionTextsWithDayOfTheWeek, defaultValue);
  };
  var initializeAutoFillHour = function(selectIdentifier, defaultValue) {
    const optionValues = [...Array(24).keys()].map((i) => zeroPadding2(i));
    _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillMinute = function(selectIdentifier, defaultValue) {
    const optionValues = [...Array(60).keys()].map((i) => zeroPadding2(i));
    _initializeSelectbox(selectIdentifier, optionValues, optionValues, defaultValue);
  };
  var initializeSelectboxesForDateTime = function() {
    initializeAutoFillYear($(".auto-fill-year"));
    initializeAutoFillMonth($(".auto-fill-month"));
    initializeAutoFillDate($(".auto-fill-date"));
    initializeAutoFillHour($(".auto-fill-hour"));
    initializeAutoFillMinute($(".auto-fill-minute"));
    const _isFirstClick = function(clickedElement) {
      const ret = $(clickedElement).data("is-clicked-after-loaded") && $(clickedElement).val() === "";
      $(clickedElement).data("is-clicked-after-loaded", false);
      return ret;
    };
    $(".auto-fill-year").on("click", function() {
      if (_isFirstClick(this)) {
        const value = zeroPadding2(dateNow.getFullYear());
        initializeAutoFillYear($(this), value);
      }
    });
    $(".auto-fill-month").on("click", function() {
      if (_isFirstClick(this)) {
        const value = zeroPadding2(dateNow.getMonth() + 1);
        initializeAutoFillMonth($(this), value);
      }
    });
    $(".auto-fill-date").on("click", function() {
      if (_isFirstClick(this)) {
        const value = zeroPadding2(dateNow.getDate());
        initializeAutoFillDateWithDayOfTheWeek($(this), value);
      } else {
        initializeAutoFillDateWithDayOfTheWeek($(this));
      }
    });
    $(".auto-fill-hour").on("click", function() {
      if (_isFirstClick(this)) {
        const value = zeroPadding2(dateNow.getHours());
        initializeAutoFillHour($(this), value);
      }
    });
    $(".auto-fill-minute").on("click", function() {
      if (_isFirstClick(this)) {
        const value = zeroPadding2(dateNow.getMinutes());
        initializeAutoFillMinute($(this), value);
      }
    });
  };
  $(function() {
    initializeSelectboxesForDateTime();
  });
})();
