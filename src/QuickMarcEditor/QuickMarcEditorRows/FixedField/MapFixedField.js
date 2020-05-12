import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { MAP_CONFIG } from './constants';

const MapFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-map-fixed-field
      name={name}
      config={MAP_CONFIG}
    />
  );
};

MapFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

MapFixedField.displayName = 'MapFixedField';

export default MapFixedField;
