import React from 'react';

import { Pluggable } from '@folio/stripes/core';

const PluginHarness = () => (
  <Pluggable
    aria-haspopup="true"
    type="quick-marc"
    baseRoute="/dummy"
  >
    <span data-test-no-plugin-available>No plugin available!</span>
  </Pluggable>
);

export default PluginHarness;
