import React, {
  useCallback,
} from 'react';

import {
  TextField,
} from '@folio/stripes/components';

import { INDICATOR_FIELD_MAX_LENGTH } from '../../../common/constants';

export const IndicatorField = (props) => {
  const selectContent = useCallback(({ target }) => {
    target.select();
  }, []);

  return (
    <TextField
      {...props}
      onFocus={selectContent}
      maxLength={INDICATOR_FIELD_MAX_LENGTH}
      data-testid="indicator-field"
    />
  );
};
