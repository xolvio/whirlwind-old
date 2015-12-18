#!/usr/bin/env node

const fs = require('fs');
const nodeController = require('./../lib/node-controller');

const config = JSON.parse(fs.readFileSync('whirlwind.json', 'utf8'));
nodeController.run(config);
