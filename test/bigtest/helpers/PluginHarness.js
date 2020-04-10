import React, { useState } from 'react';

import { Pluggable } from '@folio/stripes/core';

const PluginHarness = () => {
  const [isOpened, setIsOpened] = useState(true);

  if (!isOpened) return null;

  return (
    <Pluggable
      type="quick-marc"
      basePath="/dummy"
      onClose={() => setIsOpened(false)}
    >
      <span data-test-no-plugin-available>No plugin available!</span>
    </Pluggable>
  );
};

export default PluginHarness;
