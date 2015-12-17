"use strict";

var _ = require('lodash');
var async = require('async');
var logger = require('./log')('[process-controller]');
var processor = require('./processor');
var colors = require('colors');
var exit = require('exit');

function _initializeProcessors(processors, nodeOptions) {
  processors = [].concat(processors || []);
  _.each(processors, function (processOptions, index) {
    processors[index] = processor.run(processOptions);
  });
  return processors;
}

module.exports = {
  run(options) {
    logger.debug(`run: ${JSON.stringify(options)}`);
    var self = this;
    var processors = [].concat(
       _initializeProcessors(options.preProcessors, options),
       processor.run(options.processor),
       _initializeProcessors(options.postProcessors, options)
    );
    async.series(processors, function (error) {
      if (error) {
        //logger.error(colors.red(error));
        logger.error(colors.red('=> Summary: Some runners failed.'));
      } else {
        logger.info(colors.green('=> Summary: All runners passed.'));
      }
      self._exit(error ? 1 : 0);
    });
  },
  _exit() {
    return exit.apply(this, arguments);
  }
};
