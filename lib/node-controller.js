"use strict";

var _ = require('lodash');
var logger = require('./log')('[node-controller]');
var distributor = require('./distributor');
var processController = require('./process-controller');
var exit = require('exit');

function _distributeTasksAcrossProcesses(processes) {
  _.each(processes, function (process) {
    var tasksForProcess = _getTasksForProcess(process);
    process.taskDistributions = distributor.createDistribution(tasksForProcess, process.parallelism);
  });
}

function _createProcess(options) {
  var newProcess = _.clone(options.process, true);
  delete newProcess.taskDistributions;
  newProcess.processor.tasks = options.tasks;
  return newProcess;
}

function _expandProcessInto(expandedProcesses) {
  logger.debug(`_expandProcessInto: ${JSON.stringify(expandedProcesses)}`);
  return function (process) {
    _.times(process.parallelism, function (processId) {
      expandedProcesses.push(_createProcess({
        process,
        id: processId,
        tasks: process.taskDistributions.pop(),
        nodeId: expandedProcesses.length
      }));
    });
  }
}

function _expandProcesses(processes) {
  logger.debug(`_expandProcesses: ${JSON.stringify(processes)}`);
  _distributeTasksAcrossProcesses(processes);
  var expansion = [];
  _.each(processes, _expandProcessInto(expansion));
  return expansion;
}

function _getTasksForProcess(process) {
  logger.debug(`_getTasksForProcess: ${JSON.stringify(process)}`);
  var sourceStrategyType = Object.keys(process.processor.source)[0];
  var sourceStrategy = require('./source-strategies/' + sourceStrategyType);
  return sourceStrategy.parse(process.processor.source);
}

function _getProcessForNode(options) {
  logger.debug(`_getProcessForNode: ${JSON.stringify(options)}`);
  var expandedProcesses = _expandProcesses(options.processes);
  if (expandedProcesses.length <= options.nodeId) {
    logger.error('Oops! Make sure the nodeId is less than the total number of nodes (the sum of parallelism).'.red);
  }
  if (expandedProcesses.length !== options.totalNodes) {
    logger.error('Oops! Make sure the totalNodes is equal to the total number of nodes (the sum of parallelism).'.red);
  }
  logger.debug(`_getProcessForNode expandedProcesses: ${JSON.stringify(expandedProcesses)}`);
  var processDistributionForNode = distributor.getDistributionForSegment(expandedProcesses, expandedProcesses.length, options.nodeId);
  logger.debug(`_getProcessForNode processDistributionForNode: ${JSON.stringify(processDistributionForNode)}`);
  return processDistributionForNode[0];
}

function _resolveEnvironmentVariables(options) {
  logger.debug(`_resolveEnvironmentVariables: checking nodeId:${options.nodeId} totalNodes:${options.totalNodes}`);
  if (options.nodeId.toString().charAt(0) === '$') {
    options.nodeId = parseInt(process.env[options.nodeId.substring(1)]);
  }
  options.nodeId = parseInt(options.nodeId);
  if (options.totalNodes.toString().charAt(0) === '$') {
    options.totalNodes = process.env[options.totalNodes.substring(1)];
  }
  options.totalNodes = parseInt(options.totalNodes);
  if (!Number.isInteger(options.nodeId) || !Number.isInteger(options.totalNodes)) {
    logger.error('Oops! Make sure to provide either a number or an environment variable that contains a number for nodeId and totalNodes');
  }
  logger.debug(`_resolveEnvironmentVariables: resolved to nodeId:${options.nodeId} totalNodes:${options.totalNodes}`);
}

module.exports = {
  run: function (options) {
    _resolveEnvironmentVariables(options);
    logger.debug(`run: ${JSON.stringify(options)}`);
    var process = _getProcessForNode(options);
    processController.run(process);
  }
};
