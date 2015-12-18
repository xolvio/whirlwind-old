#!/usr/bin/env node

const fs = require('fs');
const nodeController = require('./../lib/node-controller');
const exit = require('exit');

const config = JSON.parse(fs.readFileSync('whirlwind.json', 'utf8'));
nodeController.run(config, function onFinish(exitCode) {
  exit(exitCode);
});
