// このファイルは src/auto-fill-date.ts から npm run build で生成しています。直接編集しないでください。
"use strict";
var AutoFillDate = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/auto-fill-date.ts
  var auto_fill_date_exports = {};
  __export(auto_fill_date_exports, {
    buildDateOptions: () => buildDateOptions,
    buildYearOptions: () => buildYearOptions,
    clampDate: () => clampDate,
    createNameGenerator: () => createNameGenerator,
    zeroPadding2: () => zeroPadding2
  });
  var zeroPadding2 = function(obj) {
    return obj.toString().padStart(2, "0");
  };
  var buildYearOptions = function(currentYear, extraYears) {
    const years = new Set([...Array(7).keys()].map((i) => currentYear - 3 + i));
    for (const y of extraYears) {
      if (/^\d{4}$/.test(y)) {
        years.add(Number(y));
      }
    }
    return [...years].sort((a, b) => a - b);
  };
  var buildDateOptions = function(yyyy, mm) {
    const values = [];
    const texts = [];
    const lastDate = new Date(Number(yyyy), Number(mm), 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      const day = new Date(Number(yyyy), Number(mm) - 1, i).getDay();
      values.push(zeroPadding2(i));
      texts.push(`${zeroPadding2(i)} (${"日月火水木金土"[day]})`);
    }
    return { values, texts };
  };
  var clampDate = function(yyyy, mm, dd) {
    const lastDate = new Date(Number(yyyy), Number(mm), 0).getDate();
    return zeroPadding2(Math.min(Number(dd), lastDate));
  };
  var createNameGenerator = function(prefix) {
    let count = 0;
    return function() {
      count += 1;
      return prefix + count;
    };
  };
  return __toCommonJS(auto_fill_date_exports);
})();
