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
      length: 3,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
    },
    {
      name: 'Comp',
      type: SUBFIELD_TYPES.STRING,
      length: 2,
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
      length: 3,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Part',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'TrAr',
    },
    {
      name: 'FMus',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTES,
      name: 'LTxt',
      bytes: 2,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'DtSt',
    },
    {
      name: 'Date1',
      type: SUBFIELD_TYPES.STRING,
      length: 4,
    },
    {
      name: 'Date2',
      type: SUBFIELD_TYPES.STRING,
      length: 4,
    },
  ],
};

const ScoreFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ScoreFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ScoreFixedField.displayName = 'ScoreFixedField';
ScoreFixedField.configFields = config.fields;

export default ScoreFixedField;
