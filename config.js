const { resolve } = require('path');

const config = {
  port: 9001,
  publicFolder: resolve(__dirname, 'public'),
  excludeFiles: [],
};

module.exports = config;
