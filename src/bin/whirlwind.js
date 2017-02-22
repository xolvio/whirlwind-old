#!/usr/bin/env node

const fs = require('fs');
const nodeController = require('./../lib/node-controller');

const filename = process.argv.length > 2 ? process.argv[process.argv.length - 1] : 'whirlwind.json';
const config = JSON.parse(fs.readFileSync(filename, 'utf8'));
nodeController.run(config);
