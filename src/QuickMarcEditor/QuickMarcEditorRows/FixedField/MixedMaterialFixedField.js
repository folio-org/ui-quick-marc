import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { MIXED_MATERIAL } from './constants';

const MixedMaterialFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-mixed-fixed-field
      name={name}
      config={MIXED_MATERIAL}
    />
  );
};

MixedMaterialFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

MixedMaterialFixedField.displayName = 'MixedMaterialFixedField';

export default MixedMaterialFixedField;
