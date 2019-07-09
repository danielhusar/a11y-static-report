const { spawnSync } = require('child_process');
const a11yStaticReport = require('../index');

jest.mock('chalk', () => ({
  green: string => string,
  red: string => string,
  yellow: string => string,
  blue: string => string,
}));
jest.setTimeout(30000);

describe('a11y-static-report', () => {
  test('with defaults', async () => {
    const logger = jest.fn();
    try {
      await a11yStaticReport({
        folder: 'fixtures',
        reporter: 'simple',
        logger,
      });
    } catch (e) {}

    expect(logger).toHaveBeenNthCalledWith(1, 'http://localhost:9001/default.html');
    expect(logger).toHaveBeenNthCalledWith(
      2,
      '  WARN: Ensures the document has only one main landmark and each iframe in the page has at most one main landmark'
    );
    expect(logger).toHaveBeenNthCalledWith(3, '  WARN: Ensures all page content is contained by landmarks');
    expect(logger).toHaveBeenNthCalledWith(4, '  FAIL: Ensures every HTML document has a lang attribute');
    expect(logger).toHaveBeenLastCalledWith('1 failures, 2 warnings, 9 passed, 12 total');
  });

  test('excluding files', async () => {
    const logger = jest.fn();
    await a11yStaticReport({
      folder: 'fixtures',
      excludeFiles: ['default.html'],
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 0 warnings, 0 passed, 0 total');
  });

  test('forwarding options to a11y-reporter', async () => {
    const logger = jest.fn();
    await a11yStaticReport({
      folder: 'fixtures',
      ignoreViolations: ['Ensures every HTML document has a lang attribute'],
      reporter: 'simple',
      logger,
    });
    expect(logger).toHaveBeenLastCalledWith('0 failures, 2 warnings, 9 passed, 11 total');
  });

  test('cli', () => {
    const args = ['--folder', 'fixtures'];
    const { stdout, status } = spawnSync('./cli.js', args);
    const summary = stdout.toString().match('1 failures, 2 warnings, 9 passed, 12 total');
    expect(summary).toBeTruthy();
    expect(status).toEqual(1);
  });
});
