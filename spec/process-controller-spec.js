var processController = require('../lib/process-controller');
var async = require('async');

describe('ProcessController', function () {
  describe('run', function () {
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

  });
});