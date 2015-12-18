const _ = require('lodash');
const async = require('async');
const logger = require('./log')('[process-controller]');
const processor = require('./processor');
const colors = require('colors');
const exit = require('exit');

function _initializeProcessors(processors) {
  /* eslint no-param-reassign: 0 */
  processors = [].concat(processors || []);
  _.each(processors, function initializeProcessor(processOptions, index) {
    processors[index] = processor.run(processOptions);
  });
  return processors;
}

module.exports = {
  run(options) {
    logger.debug(`run: ${JSON.stringify(options)}`);
    const self = this;
    const processors = [].concat(
       _initializeProcessors(options.preProcessors, options),
       processor.run(options.processor),
       _initializeProcessors(options.postProcessors, options)
    );
    async.series(processors, function runProcessor(error) {
      if (error) {
        // logger.error(colors.red(error));
        logger.error(colors.red('=> Summary: Some runners failed.'));
      } else {
        logger.info(colors.green('=> Summary: All runners passed.'));
      }
      self._exit(error ? 1 : 0);
    });
  },
  _exit() {
    return exit.apply(this, arguments);
  },
};
