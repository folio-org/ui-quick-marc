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
      name: 'Type',
      disabled: true,
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
    {
      disabled: true,
      name: 'BLvl',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'GPub',
    },
    {
      name: 'MRec',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      name: 'Desc',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'File',
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
};

const ComputerFileFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

ComputerFileFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

ComputerFileFixedField.displayName = 'ComputerFileFixedField';
ComputerFileFixedField.configFields = config.fields;

export default ComputerFileFixedField;
