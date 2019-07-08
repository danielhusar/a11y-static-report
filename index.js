const { copyFileSync } = require('fs');
const path = require('path');
const a11yReport = require('@daniel.husar/a11y-report');
const express = require('express');
const glob = require('glob');
const axe = require.resolve('axe-core');

const baseConfig = {
  port: 9001,
  folder: 'public',
  exitProcess: true,
  excludeFiles: [],
};

module.exports = userConfig =>
  new Promise((resolve, reject) => {
    const config = {
      ...baseConfig,
      ...userConfig,
    };

    copyFileSync(axe, path.join(config.folder, '/axe.js'));
    const files = glob
      .sync(`${config.folder}/**/*.html`)
      .filter(file => !config.excludeFiles.includes(file.replace(`${config.folder}/`, '')))
      .map(file => file.replace(config.folder, '').replace(/\/?index\.html$/, '/') || '/')
      .sort();

    const app = express();
    app.use(express.static(config.folder, { redirect: false }));
    const server = app.listen(config.port, async () => {
      const reportConfig = {
        ...userConfig,
        urls: files.map(file => `http://localhost:${config.port}${file}`),
        axeUrl: '/axe.js',
      };

      const { failures } = await a11yReport(reportConfig);
      server.close(() => {
        if (config.exitProcess) process.exit(failures ? 1 : 0);
        else return failures ? reject(failures) : resolve();
      });
    });
  });
