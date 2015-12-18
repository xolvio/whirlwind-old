const processController = require('../lib/process-controller');
const async = require('async');

describe('ProcessController', function () {
  describe('run', function () {
    it('creates pre and post processes', function () {
      spyOn(async, 'series');
      processController.run({
        preProcessors: [{
          mode: 'batch',
          module: 'noop-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1,
        }],
        processor: {
          mode: 'batch',
          module: 'noop-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1,
        },
        postProcessors: [{
          mode: 'batch',
          module: 'noop-runner',
          tasks: [{command: 'echo'}, {command: 'echo'}],
          concurrency: 1,
        }],
      });

      expect(async.series).toHaveBeenCalledWith(
        [jasmine.any(Function), jasmine.any(Function), jasmine.any(Function)],
        jasmine.any(Function));
    });
    it('returns exitCode 0 when async series has no errors', function (done) {
      processController.run(
        {processor: {module: 'noop-runner'}},
        function onComplete(error, exitCode) {
          expect(exitCode).toBe(0);
          done();
        }
      );
    });
    it('returns exitCode 1 when async series has errors', function (done) {
      processController.run(
        {processor: {module: 'failing-runner'}},
        function onComplete(error, exitCode) {
          expect(exitCode).toBe(1);
          done();
        }
      );
    });
  });
});
