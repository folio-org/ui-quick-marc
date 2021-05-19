import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
      disabled: true,
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const MixedMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MixedMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

MixedMaterialCharsField.displayName = 'MixedMaterialCharsField';

export default MixedMaterialCharsField;
