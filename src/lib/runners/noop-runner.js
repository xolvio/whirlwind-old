const logger = require('../log')('[noop-runner]');

module.exports = {
  createRunner(options) {
    logger.debug('run: ', JSON.stringify(options));
    return function noopRunner(tasks, callback) {
      callback(null, null);
    };
  },
};
