import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import { readFileSync } from 'node:fs'

const autoImportGlobals = (() => {
  try {
    const raw = readFileSync(new URL('./.eslintrc-auto-import.json', import.meta.url), 'utf-8')
    const json = JSON.parse(raw)
    return json?.globals ?? {}
  } catch {
    return {}
  }
})()

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.eslintrc.*',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },
  // Vue SFC
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      globals: {
        window: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        ...autoImportGlobals,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // 让 <script setup lang="ts"> 等内容交给 TS parser
        parser: tsParser,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      vue,
    },
    rules: {
      // 基础 JS 规则
      ...js.configs.recommended.rules,
      // Vue 推荐规则（eslint-plugin-vue v10 / flat config）
      ...(vue.configs['flat/essential']?.rules ?? {}),
      // TypeScript 推荐规则（非严格版，避免噪音过大）
      ...tseslint.configs.recommended.rules,

      // 项目常用风格微调
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

      // 允许在 <script setup> 顶层使用未声明的 defineProps/defineEmits 等由 Vue 注入的宏
      'no-undef': 'off',
      // 业务里允许快速用 any（后续再逐步收紧）
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许以 _ 开头的占位变量（常见于事件回调占位）
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Plain TS/JS
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      globals: {
        window: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        ...autoImportGlobals,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Node-side config files
  {
    files: ['vite.config.ts', 'env.*.ts', 'eslint.config.mjs'],
    languageOptions: {
      parser: tsParser,
      globals: {
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
