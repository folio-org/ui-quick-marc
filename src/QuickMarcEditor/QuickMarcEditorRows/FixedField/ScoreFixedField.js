import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [1, 1, 2, 4, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        name: 'Srce',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Audn',
      },
      {
        name: 'Ctrl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Form',
      },
      {
        name: 'Comp',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        type: SUBFIELD_TYPES.BYTES,
        name: 'AccM',
        bytes: 6,
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
      undefined,
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Part',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'TrAr',
      },
    ],
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Desc',
      },
      {
        name: 'FMus',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'LTxT',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'DtSt',
      },
      {
        name: 'Date1',
        type: SUBFIELD_TYPES.STRING,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Date2',
      },
    ],
  ],
};

const ScoreFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-score-fixed-field
      name={name}
      config={config}
    />
  );
};

ScoreFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ScoreFixedField.displayName = 'ScoreFixedField';

export default ScoreFixedField;
