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
      type: SUBFIELD_TYPES.STRING,
      name: 'Comp',
    },
    {
      name: 'FMus',
      type: SUBFIELD_TYPES.BYTE,
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
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
    },
    {
      type: SUBFIELD_TYPES.BYTES,
      bytes: 6,
      name: 'AccM',
    },
    {
      bytes: 2,
      name: 'LTxt',
      type: SUBFIELD_TYPES.BYTES,
    },
    {
      name: 'TrAr',
      type: SUBFIELD_TYPES.BYTE,
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
