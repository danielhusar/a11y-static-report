#!/usr/bin/env node

const { existsSync } = require('fs');
const { argv } = require('yargs');

const a11yrc = existsSync('.a11yrc') ? require('.a11yrc') : {};

const config = {
  ...a11yrc,
  ...argv,
};

require('./index.js')(config);
