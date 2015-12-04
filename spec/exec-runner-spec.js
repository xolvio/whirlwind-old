'use strict';

var execRunner = require('../lib/runners/exec-runner');
var childProcess = require('child_process');

describe('Exec Runner', function () {
  describe('run', function () {
    it('flattens task arrays into the command line using a comma separator by default', function () {
      spyOn(childProcess, 'exec');
      execRunner.run({
        command: 'command $TASKS'
      })(['task-one', 'task-two']);
      expect(childProcess.exec).toHaveBeenCalledWith('command task-one,task-two', jasmine.any(Function));
    });
    it('flattens task arrays into the command line using a the provided separator', function () {
      spyOn(childProcess, 'exec');
      execRunner.run({
        command: 'command $TASKS',
        separator: '#'
      })(['task-one', 'task-two', 'task-three']);
      expect(childProcess.exec).toHaveBeenCalledWith('command task-one#task-two#task-three', jasmine.any(Function));
    });
    it('creates a command from a single string', function () {
      spyOn(childProcess, 'exec');
      execRunner.run({
        command: 'command $TASKS'
      })('single-task');
      expect(childProcess.exec).toHaveBeenCalledWith('command single-task', jasmine.any(Function));
    });
    it('delegates errors and results up the callbacks chain', function () {
      spyOn(childProcess, 'exec');
      var callbackChain = jasmine.createSpy();
      execRunner.run({command: 'command'})(null, callbackChain);
      var execCallback = childProcess.exec.calls.argsFor(0)[1];

      execCallback('error', null);
      execCallback(null, 'results');

      expect(callbackChain).toHaveBeenCalledWith('error', null);
      expect(callbackChain).toHaveBeenCalledWith(null, 'results');
    });
  });
});