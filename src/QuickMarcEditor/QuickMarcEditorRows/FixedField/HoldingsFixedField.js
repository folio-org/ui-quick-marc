import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
} from '../BytesField';

const HoldingsFixedField = ({ name, config }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

HoldingsFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};

HoldingsFixedField.displayName = 'HoldingsFixedField';

export default HoldingsFixedField;
