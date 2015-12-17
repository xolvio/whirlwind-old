#! /usr/bin/env node
"use strict";

var fs = require('fs');
var whirlwind = require('../lib/index');
var nodeController = require('./../lib/node-controller');

var config = JSON.parse(fs.readFileSync('whirlwind.json', 'utf8'));
nodeController.run(config);
