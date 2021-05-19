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
      name: 'Time',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 3,
    },
    {
      name: 'Audn',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'GPub',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'TMat',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Tech',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const VisualMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

VisualMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

VisualMaterialCharsField.displayName = 'VisualMaterialCharsField';

export default VisualMaterialCharsField;
