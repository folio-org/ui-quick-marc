import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      name: 'AcqStatus',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'AcqMethod',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'AcqEndDate',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Gen ret',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Spec ret',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 3,
    },
    {
      name: 'Compl',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Copies',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Lend',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Repro',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Lang',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Sep/comp',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Rept date',
      type: SUBFIELD_TYPES.STRING,
    },
  ],
};

const HoldingsFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

HoldingsFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

HoldingsFixedField.displayName = 'HoldingsFixedField';
HoldingsFixedField.configFields = config.fields;

export default HoldingsFixedField;
