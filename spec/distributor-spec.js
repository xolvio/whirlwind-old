var Distributor = require('../lib/distributor');

describe('Distributor', function () {
  describe('create', function () {
    it('creates a distribution', function () {


      var distribution;
      var items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
      var numberOfSegments = 4;

      distribution = Distributor.getDistributionForSegment(items, numberOfSegments, 0);
      expect(distribution.length).toBe(4);
      expect(distribution[0]).toBe('a');
      expect(distribution[1]).toBe('e');
      expect(distribution[2]).toBe('i');
      expect(distribution[3]).toBe('m');

      distribution = Distributor.getDistributionForSegment(items, numberOfSegments, 1);
      expect(distribution.length).toBe(3);
      expect(distribution[0]).toBe('b');
      expect(distribution[1]).toBe('f');
      expect(distribution[2]).toBe('j');

      distribution = Distributor.getDistributionForSegment(items, numberOfSegments, 2);
      expect(distribution.length).toBe(3);
      expect(distribution[0]).toBe('c');
      expect(distribution[1]).toBe('g');
      expect(distribution[2]).toBe('k');

      distribution = Distributor.getDistributionForSegment(items, numberOfSegments, 3);
      expect(distribution.length).toBe(3);
      expect(distribution[0]).toBe('d');
      expect(distribution[1]).toBe('h');
      expect(distribution[2]).toBe('l');

    });
  });
});