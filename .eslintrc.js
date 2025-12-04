module.exports = {
  root: true,
  extends: [
    'universe/native',
    'universe/shared/react',
    'universe/shared/typescript-analysis',
    'prettier',
  ],
  env: {
    jest: true,
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'import/order': 'off',
  },
};
