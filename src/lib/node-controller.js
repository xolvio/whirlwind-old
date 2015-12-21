const _ = require('lodash');
const logger = require('./log')('[node-controller]');
const distributor = require('./distributor');
const processController = require('./process-controller');
const async = require('async');

function _distributeTasksAcrossProcesses(processes) {
  _.each(processes, function distributeTasksOfProcess(process) {
    const tasksForProcess = _getTasksForProcess(process);
    process.taskDistributions = distributor.createDistribution(tasksForProcess, process.parallelism);
  });
}

function _createProcess(options) {
  const newProcess = _.clone(options.process, true);
  delete newProcess.taskDistributions;
  newProcess.processor.tasks = options.tasks;
  return newProcess;
}

function _expandProcesses(processes) {
  logger.debug(`_expandProcesses: ${JSON.stringify(processes)}`);
  _distributeTasksAcrossProcesses(processes);
  const expandedProcesses = [];
  _.each(processes, function expandProcess(process) {
    _.times(process.parallelism, function createProcess(processId) {
      expandedProcesses.push(_createProcess({
        process,
        id: processId,
        tasks: process.taskDistributions.pop(),
        nodeId: expandedProcesses.length,
      }));
    });
  });
  return expandedProcesses;
}

function _getTasksForProcess(process) {
  logger.debug(`_getTasksForProcess: ${JSON.stringify(process)}`);
  const sourceStrategyType = Object.keys(process.processor.source)[0];
  const sourceStrategy = require('./source-strategies/' + sourceStrategyType);
  return sourceStrategy.parse(process.processor.source);
}

function _getProcessesForNode(options) {
  logger.debug(`_getProcessesForNode: ${JSON.stringify(options)}`);
  const expandedProcesses = _expandProcesses(options.processes);
  if (expandedProcesses.length <= options.nodeId) {
    logger.error('Oops! Make sure the nodeId is less than the total number of nodes (the sum of parallelism).'.red);
  }
  logger.debug(`_getProcessForNode expandedProcesses: ${JSON.stringify(expandedProcesses)}`);
  const processDistributionForNode = distributor.getDistributionForSegment(expandedProcesses, options.totalNodes, options.nodeId);
  logger.debug(`_getProcessForNode processDistributionForNode: ${JSON.stringify(processDistributionForNode)}`);
  return processDistributionForNode;
}

function _resolveEnvironmentVariables(options) {
  logger.debug(`_resolveEnvironmentVariables: checking nodeId:${options.nodeId} totalNodes:${options.totalNodes}`);
  if (options.nodeId.toString().charAt(0) === '$') {
    options.nodeId = parseInt(process.env[options.nodeId.substring(1)], 10);
  }
  options.nodeId = parseInt(options.nodeId, 10);
  if (options.totalNodes.toString().charAt(0) === '$') {
    options.totalNodes = process.env[options.totalNodes.substring(1)];
  }
  options.totalNodes = parseInt(options.totalNodes, 10);
  if (!Number.isInteger(options.nodeId) || !Number.isInteger(options.totalNodes)) {
    logger.error('Oops! Make sure to provide either a number or an environment variable that contains a number for nodeId and totalNodes');
  }
  logger.debug(`_resolveEnvironmentVariables: resolved to nodeId:${options.nodeId} totalNodes:${options.totalNodes}`);
}

module.exports = {
  run(options, onComplete) {
    _resolveEnvironmentVariables(options);
    logger.debug(`run: ${JSON.stringify(options)}`);
    const processes = _getProcessesForNode(options);
    async.mapLimit(
      processes,
      1,
      (process, callback) => {
        processController.run(process, callback);
      },
      (error, results) => {
        if (_.isFunction(onComplete)) {
          onComplete(error, results);
        }
      }
    );
  },
};
