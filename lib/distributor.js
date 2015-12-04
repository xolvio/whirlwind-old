"use strict";

var _ = require('lodash');

function _addQueue(distribution) {
  return function () {
    distribution.push([]);
  }
}

function _distribute(distribution) {
  return function (item, index) {
    distribution[index % distribution.length].push(item);
  }
}

module.exports = {
  createDistribution(items, numberOfSegments) {
    const distribution = [];
    _.times(numberOfSegments, _addQueue(distribution));
    _.forEach(items, _distribute(distribution));
    return distribution;
  },
  getDistributionForSegment: function (items, numberOfSegments, segmentNumber) {
    return this.createDistribution(items, numberOfSegments)[segmentNumber];
  }
};