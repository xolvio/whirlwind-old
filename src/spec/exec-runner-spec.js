const execRunner = require('../lib/runners/exec-runner');
const childProcess = require('child_process');

describe('Exec Runner', function () {
  describe('createRunner', function () {
    it('flattens task arrays into the command line using a comma separator by default', function () {
      spyOn(childProcess, 'exec');
      execRunner.createRunner({
        command: 'command $TASKS',
      })(['task-one', 'task-two']);
      expect(childProcess.exec).toHaveBeenCalledWith(
        'command task-one,task-two',
        undefined,
        jasmine.any(Function)
      );
    });
    it('flattens task arrays into the command line using a the provided separator', function () {
      spyOn(childProcess, 'exec');
      execRunner.createRunner({
        command: 'command $TASKS',
        separator: '#',
      })(['task-one', 'task-two', 'task-three']);
      expect(childProcess.exec).toHaveBeenCalledWith(
        'command task-one#task-two#task-three',
        undefined,
        jasmine.any(Function)
      );
    });
    it('creates a command from a single string', function () {
      spyOn(childProcess, 'exec');
      execRunner.createRunner({
        command: 'command $TASKS',
      })('single-task');
      expect(childProcess.exec).toHaveBeenCalledWith(
        'command single-task',
        undefined,
        jasmine.any(Function)
      );
    });
    it('delegates errors and results up the callbacks chain', function () {
      spyOn(childProcess, 'exec');
      const callbackChain = jasmine.createSpy();
      execRunner.createRunner({command: 'command'})(null, callbackChain);
      const execCallback = childProcess.exec.calls.argsFor(0)[2];

      execCallback('error', null);
      execCallback(null, 'results');

      expect(callbackChain).toHaveBeenCalledWith('error', null);
      expect(callbackChain).toHaveBeenCalledWith(null, 'results');
    });
  });
});
