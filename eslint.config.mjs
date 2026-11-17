// ESLint で TypeScript の設定ファイルを読むには jiti が別途必要なため、この設定は JavaScript のままにしています。
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  // js/ のうち、 src/*.ts から生成するファイルは対象外です。
  globalIgnores(['node_modules/', 'test-results/', 'playwright-report/', '_site/',
    'js/auto-fill-date.js', 'js/selmodal-page.js', 'js/selectbox-page.js']),
  js.configs.recommended,
  {
    // 外部由来の jQuery プラグインです。 TypeScript へ移行せず、 JavaScript のまま lint します。
    files: ['js/Jquery.selmodal.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.browser, jQuery: 'readonly' } },
  },
  { files: ['**/*.ts'], extends: [tseslint.configs.recommended] },
  { files: ['src/**/*.ts'], languageOptions: { globals: globals.browser } },
  { files: ['tests/**/*.ts', 'scripts/**/*.ts', '*.config.ts', 'eslint.config.mjs'], languageOptions: { globals: globals.node } },
]);
