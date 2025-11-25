import ashNazg from 'eslint-config-ash-nazg';

export default [
  {
    ignores: ['dist']
  },
  ...ashNazg(['sauron', 'browser']),
  {
    files: ['*.md/*.js'],
    rules: {
      'import/no-unresolved': 'off'
    }
  }
];
