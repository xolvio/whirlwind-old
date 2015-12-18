const _ = require('lodash');
const async = require('async');
const logger = require('./log')('[process-controller]');
const processor = require('./processor');
const colors = require('colors');
function _initializeProcessors(processors) {
  /* eslint no-param-reassign: 0 */
  processors = [].concat(processors || []);
  _.each(processors, function initializeProcessor(processOptions, index) {
    processors[index] = processor.createRunner(processOptions);
  });
  return processors;
}

module.exports = {
  run(options, onComplete) {
    logger.debug(`run: ${JSON.stringify(options)}`);
    const processors = [].concat(
       _initializeProcessors(options.preProcessors, options),
       processor.createRunner(options.processor),
       _initializeProcessors(options.postProcessors, options)
    );
    async.series(
      processors,
      (error) => {
        if (error) {
          // logger.error(colors.red(error));
          logger.error(colors.red('=> Summary: A runner failed.'));
          onComplete(error, 1);
        } else {
          logger.info(colors.green('=> Summary: All runners passed.'));
          onComplete(null, 0);
        }
      }
    );
  },
};
