import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      name: 'Freq',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Regl',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'SrTp',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Orig',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
    },
    {
      name: 'EntW',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Cont',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 3,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'GPub',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Conf',
    },
    {
      name: 'Alph',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'S/L',
      type: SUBFIELD_TYPES.BYTE,
    },
  ],
};

const ContinuingMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ContinuingMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

ContinuingMaterialCharsField.displayName = 'ContinuingMaterialCharsField';

export default ContinuingMaterialCharsField;
