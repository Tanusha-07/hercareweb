/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: false },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.cjs'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      // Server code and tests run in Node.
      files: ['server/**/*.ts', 'tests/**/*.ts', 'vite.config.ts'],
      env: { node: true, browser: false },
      rules: { 'no-console': 'off' },
    },
    {
      // Tests legitimately use `any` for storage/provider mocks and polyfills.
      files: ['tests/**/*.ts'],
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
  ],
};
