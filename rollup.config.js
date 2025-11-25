export default [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.umd.js',
    format: 'umd',
    name: 'StickyNote'
  },
  plugins: []
}, {
  input: 'src/index.js',
  output: {
    file: 'dist/index.mjs',
    format: 'esm'
  },
  plugins: []
}];
