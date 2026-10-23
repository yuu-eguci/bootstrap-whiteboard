import js from '@eslint/js';
import html from 'eslint-plugin-html';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'test-results/', 'playwright-report/', '_site/'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.browser, jQuery: 'readonly', module: 'writable' },
    },
  },
  {
    // HTML 内のインライン script です。各ページは jQuery と js/ 配下のスクリプトを読み込みます。
    files: ['**/*.html'],
    plugins: { html },
    languageOptions: {
      sourceType: 'script',
      globals: { ...globals.browser, $: 'readonly', jQuery: 'readonly', AutoFillDate: 'readonly' },
    },
  },
  {
    files: ['tests/**/*.js', 'playwright.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { sourceType: 'module', globals: globals.node },
  },
];
