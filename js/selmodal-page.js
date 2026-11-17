// このファイルは src/selmodal-page.ts から npm run build で生成しています。直接編集しないでください。
"use strict";
(() => {
  // src/selmodal-page.ts
  var fieldValue = function(field) {
    return String(field.val() ?? "");
  };
  var setNameAttributesForSelmodal = function() {
    console.info("selmodal 用の name 属性を自動付与します。");
    const nextName = AutoFillDate.createNameGenerator("selmodal-");
    const foo = function(identifier) {
      if ($(identifier).prop("name")) {
        return;
      }
      $(identifier).prop("name", nextName());
    };
    $(".auto-fill-year select").each(function() {
      foo(this);
    });
    $(".auto-fill-month select").each(function() {
      foo(this);
    });
    $(".auto-fill-date select").each(function() {
      foo(this);
    });
    $(".auto-fill-hour select").each(function() {
      foo(this);
    });
    $(".auto-fill-minute select").each(function() {
      foo(this);
    });
  };
  var zeroPadding2 = AutoFillDate.zeroPadding2;
  var _initializeSelectbox = function(selectIdentifier, optionValues, optionTexts, defaultValue) {
    console.info("Selectbox 初期化します。");
    if (!defaultValue) {
      defaultValue = "";
    }
    $(selectIdentifier).empty();
    $(selectIdentifier).append($("<option>").val(""));
    for (let i = 0; i < optionValues.length; i++) {
      $(selectIdentifier).append($("<option>").text(optionTexts[i]).val(optionValues[i]));
    }
    $(selectIdentifier).data("is-clicked-after-loaded", true);
    $(selectIdentifier).val(defaultValue);
    $(selectIdentifier).selModal();
  };
  var initializeAutoFillYear = function(defaultValue) {
    console.info("AutoFillYear 初期化します。");
    const prefilledYears = $(".auto-fill-date-only input, .auto-fill-month-only input").map(function() {
      return fieldValue($(this)).slice(0, 4);
    }).get();
    const optionValues = AutoFillDate.buildYearOptions((/* @__PURE__ */ new Date()).getFullYear(), prefilledYears).map(String);
    _initializeSelectbox($(".auto-fill-year select"), optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillMonth = function(defaultValue) {
    console.info("AutoFillMonth 初期化します。");
    const optionValues = [...Array(12).keys()].map((i) => zeroPadding2(i + 1));
    _initializeSelectbox($(".auto-fill-month select"), optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillDate = function(defaultValue) {
    console.info("AutoFillDate 初期化します。");
    _initializeSelectbox($(".auto-fill-date select"), [], [], defaultValue);
  };
  var initializeAutoFillDateWithDayOfTheWeek = function(yyyy, mm, selectDate, defaultValue) {
    console.info("AutoFillDate 曜日つきで初期化します。");
    if (yyyy && mm) {
    } else {
      return;
    }
    const options = AutoFillDate.buildDateOptions(yyyy, mm);
    _initializeSelectbox(selectDate, options.values, options.texts, defaultValue);
  };
  var initializeAutoFillHour = function(defaultValue) {
    console.info("AutoFillHour 初期化します。");
    const optionValues = [...Array(24).keys()].map((i) => zeroPadding2(i));
    _initializeSelectbox($(".auto-fill-hour select"), optionValues, optionValues, defaultValue);
  };
  var initializeAutoFillMinute = function(defaultValue) {
    console.info("AutoFillMinute 初期化します。");
    const optionValues = [...Array(60).keys()].map((i) => zeroPadding2(i));
    _initializeSelectbox($(".auto-fill-minute select"), optionValues, optionValues, defaultValue);
  };
  var reflectHiddenInputToSelectboxesForAutoFillSelectboxes = function() {
    console.info("input の状態を selectbox へ反映させます。");
    const _getNeighborButton = function(identifier) {
      return $(identifier).parent().find("button.selModalButton");
    };
    for (const p of $(".auto-fill-date-only")) {
      const selectboxYear = $(p).find(".auto-fill-year select");
      const selectboxMonth = $(p).find(".auto-fill-month select");
      const selectboxDate = $(p).find(".auto-fill-date select");
      const input = $(p).find("input");
      $(_getNeighborButton(selectboxYear)).prop("disabled", $(input).prop("disabled"));
      $(_getNeighborButton(selectboxMonth)).prop("disabled", $(input).prop("disabled"));
      $(_getNeighborButton(selectboxDate)).prop("disabled", $(input).prop("disabled"));
      if (!fieldValue(input)) {
        continue;
      }
      const yyyy = fieldValue(input).slice(0, 4);
      const mm = fieldValue(input).slice(5, 7);
      const dd = fieldValue(input).slice(8);
      selectboxYear.selModalSetValue(yyyy);
      selectboxMonth.selModalSetValue(mm);
      initializeAutoFillDateWithDayOfTheWeek(yyyy, mm, selectboxDate, dd);
      $(_getNeighborButton(selectboxDate)).prop("disabled", $(input).prop("disabled"));
    }
    for (const p of $(".auto-fill-month-only")) {
      const selectboxYear = $(p).find(".auto-fill-year select");
      const selectboxMonth = $(p).find(".auto-fill-month select");
      const input = $(p).find("input");
      $(_getNeighborButton(selectboxYear)).prop("disabled", $(input).prop("disabled"));
      $(_getNeighborButton(selectboxMonth)).prop("disabled", $(input).prop("disabled"));
      if (!fieldValue(input)) {
        continue;
      }
      selectboxYear.selModalSetValue(fieldValue(input).slice(0, 4));
      selectboxMonth.selModalSetValue(fieldValue(input).slice(5));
    }
    for (const p of $(".auto-fill-time-only")) {
      const selectboxHour = $(p).find(".auto-fill-hour select");
      const selectboxMinute = $(p).find(".auto-fill-minute select");
      const input = $(p).find("input");
      $(_getNeighborButton(selectboxHour)).prop("disabled", $(input).prop("disabled"));
      $(_getNeighborButton(selectboxMinute)).prop("disabled", $(input).prop("disabled"));
      if (!fieldValue(input)) {
        continue;
      }
      selectboxHour.selModalSetValue(fieldValue(input).slice(0, 2));
      selectboxMinute.selModalSetValue(fieldValue(input).slice(3));
    }
  };
  var registerOnClickEventsForAutoFillSelectboxes = function() {
    console.info("onclick イベントを登録します。");
    const _getNeighborSelect = function(identifier) {
      return $(identifier).parent().find("select");
    };
    const _isFirstClick = function(clickedButton) {
      const neighborSelect = _getNeighborSelect(clickedButton);
      const ret = $(neighborSelect).data("is-clicked-after-loaded") && $(neighborSelect).val() === "";
      $(neighborSelect).data("is-clicked-after-loaded", false);
      return ret;
    };
    $(document).on("click", ".auto-fill-year button.selModalButton", function() {
      console.info("on click year");
      if (_isFirstClick(this)) {
        $(_getNeighborSelect(this)).selModalSetValue((/* @__PURE__ */ new Date()).getFullYear().toString());
        $(_getNeighborSelect(this)).change();
      }
    });
    $(document).on("click", ".auto-fill-month button.selModalButton", function() {
      console.info("on click month");
      if (_isFirstClick(this)) {
        $(_getNeighborSelect(this)).selModalSetValue(zeroPadding2((/* @__PURE__ */ new Date()).getMonth() + 1));
        $(_getNeighborSelect(this)).change();
      }
    });
    $(document).on("click", ".auto-fill-hour button.selModalButton", function() {
      console.info("on click hour");
      if (_isFirstClick(this)) {
        $(_getNeighborSelect(this)).selModalSetValue(zeroPadding2((/* @__PURE__ */ new Date()).getHours()));
        $(_getNeighborSelect(this)).change();
      }
    });
    $(document).on("click", ".auto-fill-minute button.selModalButton", function() {
      console.info("on click minute");
      if (_isFirstClick(this)) {
        $(_getNeighborSelect(this)).selModalSetValue(zeroPadding2((/* @__PURE__ */ new Date()).getMinutes()));
        $(_getNeighborSelect(this)).change();
      }
    });
  };
  var registerOnChangeEventsForAutoFillSelectboxes = function() {
    console.info("onchange イベントを登録します。");
    $(document).on("change", ".auto-fill-date-only select", function() {
      console.info("on change date-only");
      const p = $(this).closest(".auto-fill-date-only");
      const selectYear = p.find(".auto-fill-year select");
      const selectMonth = p.find(".auto-fill-month select");
      const selectDate = p.find(".auto-fill-date select");
      const input = p.find("input");
      if (fieldValue($(this))) {
        const now = /* @__PURE__ */ new Date();
        const yyyy = fieldValue(selectYear) || now.getFullYear().toString();
        const mm = fieldValue(selectMonth) || zeroPadding2(now.getMonth() + 1);
        const dd = AutoFillDate.clampDate(yyyy, mm, fieldValue(selectDate) || now.getDate());
        selectYear.selModalSetValue(yyyy);
        selectMonth.selModalSetValue(mm);
        initializeAutoFillDateWithDayOfTheWeek(yyyy, mm, selectDate, dd);
        input.val(`${yyyy}/${mm}/${dd}`).change();
        return;
      }
      selectYear.selModalSetValue("");
      selectMonth.selModalSetValue("");
      selectDate.selModalSetValue("");
      input.val("").change();
    });
    $(document).on("change", ".auto-fill-month-only select", function() {
      console.info("on change month-only");
      const p = $(this).closest(".auto-fill-month-only");
      const selectYear = p.find(".auto-fill-year select");
      const selectMonth = p.find(".auto-fill-month select");
      const input = p.find("input");
      if (fieldValue($(this))) {
        const now = /* @__PURE__ */ new Date();
        const yyyy = fieldValue(selectYear) || now.getFullYear().toString();
        const mm = fieldValue(selectMonth) || zeroPadding2(now.getMonth() + 1);
        selectYear.selModalSetValue(yyyy);
        selectMonth.selModalSetValue(mm);
        input.val(`${yyyy}/${mm}`).change();
        return;
      }
      selectYear.selModalSetValue("");
      selectMonth.selModalSetValue("");
      input.val("").change();
    });
    $(document).on("change", ".auto-fill-time-only select", function() {
      console.info("on change time-only");
      const p = $(this).closest(".auto-fill-time-only");
      const selectHour = p.find(".auto-fill-hour select");
      const selectMinute = p.find(".auto-fill-minute select");
      const input = p.find("input");
      if (fieldValue($(this))) {
        const now = /* @__PURE__ */ new Date();
        const hh = fieldValue(selectHour) || zeroPadding2(now.getHours());
        const mm = fieldValue(selectMinute) || zeroPadding2(now.getMinutes());
        selectHour.selModalSetValue(hh);
        selectMinute.selModalSetValue(mm);
        input.val(`${hh}:${mm}`).change();
        return;
      }
      selectHour.selModalSetValue("");
      selectMinute.selModalSetValue("");
      input.val("").change();
    });
  };
  $(function() {
    setNameAttributesForSelmodal();
    initializeAutoFillYear();
    initializeAutoFillMonth();
    initializeAutoFillDate();
    initializeAutoFillHour();
    initializeAutoFillMinute();
    reflectHiddenInputToSelectboxesForAutoFillSelectboxes();
    registerOnClickEventsForAutoFillSelectboxes();
    registerOnChangeEventsForAutoFillSelectboxes();
  });
})();
