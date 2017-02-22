const _ = require('lodash');
const async = require('async');
const logger = require('./log')('[processor]');

module.exports = {
  run(options) {
    logger.debug(`run: ${JSON.stringify(options)}`);
    const self = this;
    return function runner(callback) {
      async.mapLimit(
         self._batchTasks(options),
         options.concurrency || 1,
         self._getRunner(options),
         function runTask(error, results) {
           let err = error || results.map(el => el.error).filter(el => el);
           let res = results.map(el => el.result).filter(el => el);

           if (!err || !err.length) err = null;
           if (!results.length) res = null;

           if (err) {
             logger.debug('errors: ', err);
           } else {
             logger.debug('results: ', res);
           }

           callback(err, res);
         }
      );
    };
  },
  _getRunner(options) {
    const runnerImpl = require('./runners/' + options.module);
    return runnerImpl.run(options.moduleOptions);
  },
  _batchTasks(options) {
    if (!options.tasks) {
      return [''];
    }
    if (options.mode === 'single') {
      return [].concat(options.tasks);
    }
    const numberOfBatches = options.tasks.length / options.concurrency;
    return _.chain(options.tasks).groupBy(
      (element, index) => Math.floor(index / numberOfBatches)
    ).toArray().value();
  },
};
