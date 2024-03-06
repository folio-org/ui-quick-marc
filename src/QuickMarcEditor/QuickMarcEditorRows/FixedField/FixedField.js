import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
} from '../BytesField';

const FixedField = ({ name, config }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

FixedField.propTypes = {
  name: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};

export default FixedField;
