module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['standard-with-typescript', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.eslint.json',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'no-new': 'off',
  },
};

