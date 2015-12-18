const logger = require('../log')('[noop-runner]');

module.exports = {
  createRunner(options) {
    logger.debug('run: ', JSON.stringify(options));
    return function failingRunner(tasks, callback) {
      callback(new Error('Failing runner failed'), null);
    };
  },
};
