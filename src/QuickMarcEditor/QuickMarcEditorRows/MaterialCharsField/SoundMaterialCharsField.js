import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      type: SUBFIELD_TYPES.STRING,
      name: 'Comp',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'FMus',
    },
    {
      name: 'Part',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Audn',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      bytes: 6,
      name: 'AccM',
      type: SUBFIELD_TYPES.BYTES,
    },
    {
      bytes: 2,
      name: 'LTxt',
      type: SUBFIELD_TYPES.BYTES,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'TrAr',
    },
  ],
};

const SoundMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

SoundMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

SoundMaterialCharsField.displayName = 'SoundMaterialCharsField';

export default SoundMaterialCharsField;
