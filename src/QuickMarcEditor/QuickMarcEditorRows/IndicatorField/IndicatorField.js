import React, { useCallback } from 'react';

import {
  TextField,
} from '@folio/stripes/components';

export const IndicatorField = (props) => {
  const selectContent = useCallback(({ target }) => {
    target.select();
  }, []);

  return (
    <TextField
      {...props}
      onFocus={selectContent}
    />
  );
};
