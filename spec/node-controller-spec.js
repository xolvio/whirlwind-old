var nodeController = require('../lib/node-controller');
var processController = require('../lib/process-controller');
var path = require('path');
var async = require('async');

describe('NodeController', function () {
  beforeEach(function () {
    spyOn(nodeController, '_exit');
    spyOn(async, 'series');
    var baseDir = global.wallaby ? global.wallaby.localProjectDir : path.resolve(process.cwd());
    this.processors = [
      {
        name: 'cucumber',
        parallelism: 2,
        processor: {
          source: {
            directory: path.resolve(baseDir, 'spec', 'test-files'),
            'pattern': '**/*.*'
          }
        }
      },
      {
        name: 'package-tests',
        parallelism: 3,
        processor: {
          source: {
            list: ['a', 'b', 'c', 'd', 'e', 'f', 'g']
          }
        }
      },
      {
        name: 'mocha',
        parallelism: 1,
        processor: {
          source: {
            list: ['h', 'i', 'j', 'k', 'l', 'm', 'n']
          }
        }
      }
    ];
  });
  describe('_nodeIdToProcessMapper', function () {

    it('returns the process name based on the current node id', function () {
      spyOn(processController, 'run');

      nodeController.run({processes: this.processors, nodeId: 0, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[0].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 1, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[0].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 2, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[1].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 3, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[1].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 4, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[1].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 5, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[2].name);
    });
    it('provides the tasks based on the source strategy, the node id and the parallelism', function () {
      spyOn(processController, 'run');
      nodeController.run({processes: this.processors, nodeId: 0, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['four-spec.js', 'six-spec.js', 'two-spec.js']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 1, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['five-spec.js', 'one-spec.js', 'three-spec.js']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 2, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['c', 'f']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 3, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['b', 'e']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 4, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['a', 'd', 'g']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 5, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['h', 'i', 'j', 'k', 'l', 'm', 'n']);
    });
    it('resolves environment variables for nodeId and totalNodes', function () {
      spyOn(processController, 'run');
      process.env.TOTAL_NODES = '6';
      process.env.NODE_ID = '2';
      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: '$NODE_ID', totalNodes: '$TOTAL_NODES'});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['c', 'f']);
    });
  });
  describe('run', function() {
    it('exits with 0 when none of the processes had no errors', function () {
      spyOn(processController, 'run');
      nodeController.run({processes: this.processors, nodeId: 0, totalNodes: 1});
      var asyncCallback = async.series.calls.argsFor(0)[1];
      asyncCallback();
      expect(nodeController._exit).toHaveBeenCalledWith(0);
    });
    it('exits with 1 when one of the processes has errors', function () {
      //nodeController.run();
      //var asyncCallback = async.series.calls.argsFor(0)[1];
      //asyncCallback('error');
      //expect(nodeController._exit).toHaveBeenCalledWith(1);
    });
  })
});
