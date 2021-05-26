import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useStandardFields from './useStandardFields';

const configFields = [
  {
    name: 'Comp',
    type: SUBFIELD_TYPES.STRING,
    bytes: 2,
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
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'AccM',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 6,
  },
  {
    name: 'LTxt',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
  {
    name: 'TrAr',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const SoundMaterialCharsField = ({ name }) => {
  const standardFields = useStandardFields();

  return (
    <BytesField
      name={name}
      config={{
        fields: [
          ...standardFields,
          ...configFields,
        ],
      }}
    />
  );
};

SoundMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

SoundMaterialCharsField.displayName = 'SoundMaterialCharsField';

export default SoundMaterialCharsField;
