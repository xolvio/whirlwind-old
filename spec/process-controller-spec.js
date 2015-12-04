var processController = require('../lib/process-controller');
var async = require('async');

describe('ProcessController', function () {
  describe('run', function () {
    beforeEach(function() {
      spyOn(processController, '_exit');
      spyOn(async, 'series');
    });
    it('creates processes', function () {
      processController.run({
        processor: {
          mode: 'batch',
          module: 'exec-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1
        }
      });
      expect(async.series).toHaveBeenCalledWith(
         [jasmine.any(Function)],
         jasmine.any(Function))
    });
    it('creates pre and post processes', function () {
      processController.run({
        preProcessors: [{
          mode: 'batch',
          module: 'exec-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1
        }],
        processor: {
          mode: 'batch',
          module: 'exec-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1
        },
        postProcessors: [{
          mode: 'batch',
          module: 'exec-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1
        }]
      });
      expect(async.series).toHaveBeenCalledWith(
         [jasmine.any(Function), jasmine.any(Function), jasmine.any(Function)],
         jasmine.any(Function))
    });
    it('exits with 0 when async series has no errors', function () {
      processController.run({processor: {module: 'exec-runner'}});
      var asyncCallback = async.series.calls.argsFor(0)[1];
      asyncCallback();
      expect(processController._exit).toHaveBeenCalledWith(0);
    });
    it('exits with 1 when async series has errors', function () {
      processController.run({processor: {module: 'exec-runner'}});
      var asyncCallback = async.series.calls.argsFor(0)[1];
      asyncCallback('error');
      expect(processController._exit).toHaveBeenCalledWith(1);
    });
  });
});