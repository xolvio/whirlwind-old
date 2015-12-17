#! /usr/bin/env node
"use strict";

var fs = require('fs');
var minimist = require('minimist');
var nodeController = require('./../lib/node-controller');

var argv = minimist(process.argv.slice(2), {
  'default': {
    'debug': false
  },
  'boolean': true
});

if (argv.debug) {
  global.LOG_LEVEL = 'DEBUG';
}

var config = JSON.parse(fs.readFileSync(argv._[0] || 'whirlwind.json', 'utf8'));
nodeController.run(config);
