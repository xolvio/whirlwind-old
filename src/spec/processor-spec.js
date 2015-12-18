const processor = require('../lib/processor');
const async = require('async');
const execRunner = require('../lib/runners/exec-runner');

describe('processor', function () {
  describe('run', function () {
    it('returns a function', function () {
      expect(processor.createRunner({})).toEqual(jasmine.any(Function));
    });
    it('runs a mapLimit using the processor items, concurrency and runner', function () {
      spyOn(async, 'mapLimit');
      spyOn(processor, '_getRunner').and.returnValue('runner');
      spyOn(processor, '_batchTasks').and.returnValue(['tasks']);

      processor.createRunner({concurrency: 3})();

      expect(async.mapLimit).toHaveBeenCalledWith(['tasks'], 3, 'runner', jasmine.any(Function));
    });
    it('delegates errors and results up the callbacks chain', function () {
      spyOn(async, 'mapLimit');
      spyOn(processor, '_getRunner').and.returnValue('runner');
      spyOn(processor, '_batchTasks').and.returnValue(['tasks']);
      const callbackChain = jasmine.createSpy();
      processor.createRunner({concurrency: 0})(callbackChain);
      const mapLimitCallback = async.mapLimit.calls.argsFor(0)[3];

      mapLimitCallback('error', null);
      mapLimitCallback(null, 'results');

      expect(callbackChain).toHaveBeenCalledWith('error', null);
      expect(callbackChain).toHaveBeenCalledWith(null, 'results');
    });
  });
  describe('_getRunner', function () {
    it('loads the module set in the options', function () {
      spyOn(execRunner, 'createRunner');

      processor._getRunner({module: 'exec-runner'});

      expect(execRunner.createRunner).toHaveBeenCalled();
    });
  });
  describe('_batchTasks', function () {
    it('batches tasks by default', function () {
      const tasks = processor._batchTasks({
        mode: '',
        concurrency: 2,
        tasks: ['1', '2', '3', '4', '5'],
      });
      expect(tasks).toEqual([['1', '2', '3'], ['4', '5']]);
    });
    it('does not batch in single mode', function () {
      const tasks = processor._batchTasks({
        mode: 'single',
        tasks: ['1', '2', '3', '4', '5'],
      });
      expect(tasks).toEqual(['1', '2', '3', '4', '5']);
    });
  });
});
