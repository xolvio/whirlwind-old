const childProcess = require('child_process');
const logger = require('../log')('[exec-runner]');
const colors = require('colors');

module.exports = {
  createRunner(options) {
    logger.debug('run: ', JSON.stringify(options));
    return function execRunner(tasks, callback) {
      logger.debug('inner run: ', options.command, tasks);
      let command;
      if (Array.isArray(tasks)) {
        command = options.command.replace('$TASKS', tasks.join(options.separator));
      } else {
        command = options.command.replace('$TASKS', tasks);
      }

      logger.debug('running command: ', command);
      childProcess.exec(command, function onFinish(error, result) {
        if (error) {
          logger.error('command error: '.gray, colors.red(error));
        } else {
          logger.info('command result: '.gray, colors.green(result));
        }
        callback(error, result);
      });
    };
  },
};
