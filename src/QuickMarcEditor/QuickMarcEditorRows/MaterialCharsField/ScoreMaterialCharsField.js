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
      name: 'Type',
      disabled: true,
    },
    {
      name: 'Comp',
      type: SUBFIELD_TYPES.STRING,
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
      type: SUBFIELD_TYPES.BYTE,
      name: 'Audn',
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'AccM',
      bytes: 6,
      type: SUBFIELD_TYPES.BYTES,
    },
    {
      bytes: 2,
      type: SUBFIELD_TYPES.BYTES,
      name: 'LTxt',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'TrAr',
    },
  ],
};

const ScoreMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ScoreMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

ScoreMaterialCharsField.displayName = 'ScoreMaterialCharsField';

export default ScoreMaterialCharsField;
