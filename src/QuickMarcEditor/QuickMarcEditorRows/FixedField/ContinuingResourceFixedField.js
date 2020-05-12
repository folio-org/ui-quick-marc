import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { CONTINUING_RESOURCE } from './constants';

const ContinuingResourceFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-counting-resource-fixed-field
      name={name}
      config={CONTINUING_RESOURCE}
    />
  );
};

ContinuingResourceFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ContinuingResourceFixedField.displayName = 'ContinuingResourceFixedField';

export default ContinuingResourceFixedField;
