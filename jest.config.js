const commonCofig = require('@folio/stripes-acq-components/jest.config');

module.exports = {
  ...commonCofig,
  coverageDirectory: './artifacts/coverage/',
};
