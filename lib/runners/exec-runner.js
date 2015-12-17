'use strict';

var childProcess = require('child_process');
var logger = require('../log')('[exec-runner]');
var colors = require('colors');
var _ = require('lodash');

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

      if (options.copyEnvironment) {
        options.options.env = _.extend({}, process.env, options.options.env);
      }

      logger.debug('running command: ', command, options);
      var proc = childProcess.exec(command, options.options, function (error, stdout) {
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
    }
  }
};