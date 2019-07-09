const { copyFileSync, existsSync } = require('fs');
const path = require('path');
const a11yReport = require('@daniel.husar/a11y-report');
const express = require('express');
const glob = require('glob');
const axe = require.resolve('axe-core');

const baseConfig = {
  port: 9001,
  folder: 'public',
  excludeFiles: [],
  debug: false,
};

module.exports = userConfig =>
  new Promise((resolve, reject) => {
    const config = {
      ...baseConfig,
      ...userConfig,
    };
    const folder = path.join(process.cwd(), config.folder);
    if (!existsSync(folder)) {
      return reject(new Error('Folder does not exists'));
    }

    if (config.debug) console.log('folder:', folder);

    copyFileSync(axe, path.join(folder, 'axe.js'));
    const urls = glob
      .sync(`${folder}/**/*.html`)
      .filter(file => !config.excludeFiles.includes(file.replace(`${folder}/`, '')))
      .map(file => {
        const path = file.replace(folder, '').replace(/\/?index\.html$/, '/') || '/';
        return `http://localhost:${config.port}${path}`;
      })
      .sort();

    const app = express();
    app.use(express.static(folder, { redirect: false }));
    const server = app.listen(config.port, async () => {
      const reportConfig = {
        ...userConfig,
        urls,
        axeUrl: '/axe.js',
      };

      if (config.debug) console.log('config:', reportConfig);

      const { failures } = await a11yReport(reportConfig);
      server.close(() => (failures ? reject() : resolve()));
    });
  });
