const path = require('path');
const commonConfig = require('@folio/stripes-acq-components/jest.config');

module.exports = {
  ...commonConfig,
  coverageDirectory: './artifacts/coverage-jest/',
  collectCoverageFrom: [
    ...commonConfig.collectCoverageFrom,
    './src/*.{js,jsx}',
  ],
  setupFiles: [...commonConfig.setupFiles, path.join(__dirname, './test/jest/setup-tests.js')],
};
