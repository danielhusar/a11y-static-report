#!/usr/bin/env node

const path = require('path');
const { existsSync } = require('fs');
const { argv } = require('yargs');

const a11yrcLocation = path.join(process.cwd(), '.a11yrc');
const a11yrc = existsSync(a11yrcLocation) ? require(a11yrcLocation) : {};

const config = {
  ...a11yrc,
  ...argv,
};

require('./index.js')(config);
