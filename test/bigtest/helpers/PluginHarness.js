import React from 'react';

import { Pluggable } from '@folio/stripes/core';

const PluginHarness = () => (
  <Pluggable
    type="quick-marc"
    basePath="/dummy"
    onClose={() => {}}
  >
    <span data-test-no-plugin-available>No plugin available!</span>
  </Pluggable>
);

export default PluginHarness;
