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
    },
    {
      name: 'Form',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.STRING,
      name: 'Comp',
    },
    {
      bytes: 6,
      name: 'AccM',
      type: SUBFIELD_TYPES.BYTES,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'MRec',
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
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
      type: SUBFIELD_TYPES.BYTE,
      name: 'FMus',
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
    },
    {
      type: SUBFIELD_TYPES.STRING,
      name: 'Date2',
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
