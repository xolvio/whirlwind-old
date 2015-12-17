const _ = require('lodash');

module.exports = {
  createDistribution(items, numberOfSegments) {
    const distribution = [];
    _.times(numberOfSegments, function addQueue() {
      distribution.push([]);
    });
    _.forEach(items, (item, index) => {
      distribution[index % distribution.length].push(item);
    });
    return distribution;
  },

  getDistributionForSegment(items, numberOfSegments, segmentNumber) {
    return this.createDistribution(items, numberOfSegments)[segmentNumber];
  },
};
