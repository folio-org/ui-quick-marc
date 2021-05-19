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
      name: 'Relf',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 4,
    },
    {
      name: 'Proj',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'CrTp',
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
      name: 'Indx',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'SpFm',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 2,
    },
  ],
};

const MapMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MapMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

MapMaterialCharsField.displayName = 'MapMaterialCharsField';

export default MapMaterialCharsField;
