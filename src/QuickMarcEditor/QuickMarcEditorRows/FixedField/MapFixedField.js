import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [1, 2, 2, 3, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        disabled: true,
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'ELvl',
        type: SUBFIELD_TYPES.BYTE,
      },
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
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Lang',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
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
    ],
    [
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
        type: SUBFIELD_TYPES.BYTE,
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
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
    ],
  ],
};

const MapFixedField = ({ name }) => {
  return (
    <FixedField
      name={name}
      config={config}
    />
  );
};

MapFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

MapFixedField.displayName = 'MapFixedField';

export default MapFixedField;
