module.exports = function () {
  return {
    files: [
      'bin/*.js',
      'lib/**/*.js'
    ],
    tests: [
      'spec/*.js'
    ],
    env: {
      type: 'node',
      runner: 'node',
      params: {
        runner: '--harmony'
      }
    },
    testFramework: 'jasmine'
  };
};