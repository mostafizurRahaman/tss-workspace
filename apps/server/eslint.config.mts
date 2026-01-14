import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-config-prettier'
export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      eqeqeq: 'off',
      'no-unused-expressions': 'error',
      'no-unused-vars': 'error',
      'prefer-const': [
        'error',
        {
          ignoreReadBeforeAssign: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'warn',
      'no-undef': 'error',
    },
  },
  {
    ignores: ['./node_modules/*'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
])
