export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.venv/**',
      'python/**/venv/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {},
  },
];
