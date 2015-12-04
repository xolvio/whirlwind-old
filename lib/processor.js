"use strict";

var _ = require('lodash');
var async = require('async');
var logger = require('./log')('[processor]');

module.exports = {
  run(options) {
    logger.debug(`run: ${JSON.stringify(options)}`);
    var self = this;
    return function (callback) {
      async.mapLimit(
         self._batchTasks(options),
         options.concurrency || 1,
         self._getRunner(options),
         function(error, results) {
           if (error) {
             logger.debug('error: ', error);
           } else {
             logger.debug('results: ', results);
           }
           callback(error, results)
         }
      );
    }
  },
  _getRunner(options) {
    var runnerImpl = require('./runners/' + options.module);
    return runnerImpl.run(options.moduleOptions);
  },
  _batchTasks(options) {
    if (!options.tasks) {
      return [''];
    }
    if (options.mode === 'single') {
      return [].concat(options.tasks);
    }
    var numberOfBatches = options.tasks.length / options.concurrency;
    return _.chain(options.tasks).groupBy(function (element, index) {
      return Math.floor(index / numberOfBatches);
    }).toArray().value();
  }
};
