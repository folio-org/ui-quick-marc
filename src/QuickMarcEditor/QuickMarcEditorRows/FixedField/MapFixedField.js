import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      name: 'Srce',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Relf',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 4,
    },
    {
      name: 'Lang',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'GPub',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'SpFm',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 2,
    },
    {
      name: 'MRec',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'CrTp',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Indx',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Proj',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 2,
    },
    {
      name: 'DtSt',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Date1',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Date2',
      type: SUBFIELD_TYPES.STRING,
    },
  ],
};

const MapFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MapFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

MapFixedField.displayName = 'MapFixedField';
MapFixedField.configFields = config.fields;

export default MapFixedField;
