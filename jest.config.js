const commonCofig = require('@folio/stripes-acq-components/jest.config');

module.exports = {
  ...commonCofig,
  coverageDirectory: './artifacts/coverage-jest/',
  collectCoverageFrom: [
    ...commonCofig.collectCoverageFrom,
    './src/*.{js,jsx}',
  ],
};
