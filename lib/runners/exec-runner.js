'use strict';

var childProcess = require('child_process');
var logger = require('../log')('[exec-runner]');
var colors = require('colors');

module.exports = {
  run(options) {
    logger.debug('run: ', JSON.stringify(options));
    return function (tasks, callback) {
      logger.debug('inner run: ', options.command, tasks);
      var command;
      if (Array.isArray(tasks)) {
        command = options.command.replace('$TASKS', tasks.join(options.separator));
      } else {
        command = options.command.replace('$TASKS', tasks);
      }

      logger.debug('running command: ', command);
      childProcess.exec(command, function (error, result) {
        if (error) {
          logger.error('command error: '.gray, colors.red(error));
        } else {
          logger.info('command result: '.gray, colors.green(result));
        }
        callback(error, result);
      });
    }
  }
};