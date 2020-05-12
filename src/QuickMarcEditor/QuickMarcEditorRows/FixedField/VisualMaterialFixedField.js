import React from 'react';
import PropTypes from 'prop-types';

import FixedField from './FixedField';
import { VISUAL_MATERIAL_CONFIG } from './constants';

const VisualMaterialFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-visual-material-fixed-field
      name={name}
      config={VISUAL_MATERIAL_CONFIG}
    />
  );
};

VisualMaterialFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

VisualMaterialFixedField.displayName = 'VisualMaterialFixedField';

export default VisualMaterialFixedField;
