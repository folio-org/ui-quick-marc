import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [1, 1, 2, 4, 2, 2],
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
    ],
    [
      {
        disabled: true,
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
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
    ],
    [
      undefined,
      {
        name: 'Part',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'TrAr',
      },
    ],
    [
      {
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'FMus',
      },
      {
        name: 'LTxt',
        type: SUBFIELD_TYPES.BYTE,
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

const SoundRecordingFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-sound-fixed-field
      name={name}
      config={config}
    />
  );
};

SoundRecordingFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

SoundRecordingFixedField.displayName = 'SoundRecordingFixedField';

export default SoundRecordingFixedField;
