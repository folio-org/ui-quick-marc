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
      name: 'Audn',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Ctrl',
    },
    {
      name: 'Lang',
      type: SUBFIELD_TYPES.STRING,
      length: 3,
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Comp',
      type: SUBFIELD_TYPES.STRING,
      length: 2,
    },
    {
      name: 'AccM',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 6,
    },
    {
      name: 'MRec',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
      length: 3,
    },
    {
      name: 'Part',
      type: SUBFIELD_TYPES.BYTE,
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
      name: 'LTxt',
      type: SUBFIELD_TYPES.BYTES,
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

const SoundRecordingFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

SoundRecordingFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

SoundRecordingFixedField.displayName = 'SoundRecordingFixedField';
SoundRecordingFixedField.configFields = config.fields;

export default SoundRecordingFixedField;
