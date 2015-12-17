module.exports = function wallabyConfig() {
  return {
    files: [
      'src/bin/*.js',
      'src/lib/**/*.js',
    ],
    tests: [
      'src/spec/helpers/**/*.js',
      '!src/spec/helpers/**/runtime.js',
      'src/spec/**/*[sS]pec.js',
    ],
    preprocessors: {
      '**/*.js': file => require('babel-core').transform(file.content, {
        sourceMap: true,
        plugins: ['transform-runtime'],
        presets: ['es2015', 'stage-2'],
      }),
    },
    env: {
      type: 'node',
      runner: 'node',
      params: {
        runner: '--harmony',
      },
    },
    testFramework: 'jasmine',
  };
};
