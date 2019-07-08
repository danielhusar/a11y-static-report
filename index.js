const fs = require('fs');
const a11yReport = require('@daniel.husar/a11y-report');
const express = require('express');
const glob = require('glob');
const axe = require.resolve('axe-core');
const { publicFolder, port, excludeFiles, ...restConfig } = require('./config');

module.exports = () => {
  fs.copyFileSync(axe, `${publicFolder}/axe.js`);
  const files = glob
    .sync(`${publicFolder}/**/*.html`)
    .map(file => file.replace(publicFolder, '').replace(/\/?index\.html$/, '/') || '/')
    .sort();

  const app = express();
  app.use(express.static(publicFolder, { redirect: false }));
  const server = app.listen(port, async () => {
    const reportConfig = {
      ...restConfig,
      urls: files.map(file => `http://localhost:${port}${file}`),
      axeUrl: '/axe.js',
    };

    const { failures } = await a11yReport(reportConfig);
    server.close(() => process.exit(failures ? 1 : 0));
  });
};
