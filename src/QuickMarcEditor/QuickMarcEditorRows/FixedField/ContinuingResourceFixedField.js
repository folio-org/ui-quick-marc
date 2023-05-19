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
      name: 'Srce',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'GPub',
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
      length: 3,
    },
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
      length: 4,
    },
    {
      name: 'Date2',
      type: SUBFIELD_TYPES.STRING,
      length: 4,
    },
  ],
};

const ContinuingResourceFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ContinuingResourceFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ContinuingResourceFixedField.displayName = 'ContinuingResourceFixedField';
ContinuingResourceFixedField.configFields = config.fields;

export default ContinuingResourceFixedField;
