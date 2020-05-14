import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [2, 2, 2, 2, 2, 2],
  fields: [
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
        name: 'Type',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'GPub',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Ctrl',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
        name: 'BLvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Form',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Conf',
      },
      {
        name: 'Freq',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'MRec',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Ctry',
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

const ContinuingResourceFixedField = ({ name, collapsed }) => {
  return (
    <FixedField
      data-test-counting-resource-fixed-field
      name={name}
      config={config}
      collapsed={collapsed}
    />
  );
};

ContinuingResourceFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

ContinuingResourceFixedField.displayName = 'ContinuingResourceFixedField';

export default ContinuingResourceFixedField;
