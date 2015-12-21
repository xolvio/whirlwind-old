const childProcess = require('child_process');
const logger = require('../log')('[exec-runner]');
const colors = require('colors');
const _ = require('lodash');

module.exports = {
  createRunner(options) {
    logger.debug('run: ', JSON.stringify(options));
    return function execRunner(tasks, onFinish) {
      const callback = _.once(onFinish || _.noop);
      logger.debug('inner run: ', options.command, tasks);
      let command;
      if (Array.isArray(tasks)) {
        command = options.command.replace('$TASKS', tasks.join(options.separator));
      } else {
        command = options.command.replace('$TASKS', tasks);
      }

      if (options.copyEnvironment) {
        options.options.env = _.extend({}, process.env, options.options.env);
      }

      logger.debug('running command: ', command);
      const proc = childProcess.exec(command, options.options, (error, stdout) => {
        if (error) {
          logger.error('command error: '.gray, colors.red(error));
        }
        callback(error, stdout);
      });
      if (options.pipe) {
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
      }
      if (options.background) {
        callback(null, 'Running as a background task');
      }
    };
  },
};
