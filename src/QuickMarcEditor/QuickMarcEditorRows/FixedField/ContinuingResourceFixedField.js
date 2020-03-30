import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [2, 2, 2, 2, 2, 2],
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
        name: 'GPub',
        type: SUBFIELD_TYPES.BYTE,
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
        name: 'Conf',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Freq',
        type: SUBFIELD_TYPES.BYTE,
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
        name: 'S/L',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Orig',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'EntW',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Regl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Alph',
        type: SUBFIELD_TYPES.BYTE,
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'SrTp',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Cont',
        type: SUBFIELD_TYPES.BYTES,
        bytes: 3,
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
  ],
};

const ContinuingResourceFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-counting-resource-fixed-field
      name={name}
      config={config}
    />
  );
};

ContinuingResourceFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ContinuingResourceFixedField.displayName = 'ContinuingResourceFixedField';

export default ContinuingResourceFixedField;
