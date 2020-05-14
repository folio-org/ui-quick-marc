import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [2, 2, 2, 2, 2, 2],
  fields: [
    [
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
    ],
    [
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
      undefined,
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
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'File',
        type: SUBFIELD_TYPES.BYTE,
      },
      undefined,
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

const ComputerFileFixedField = ({ name, collapsed }) => {
  return (
    <FixedField
      data-test-computer-file-fixed-field
      name={name}
      config={config}
      collapsed={collapsed}
    />
  );
};

ComputerFileFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

ComputerFileFixedField.displayName = 'ComputerFileFixedField';

export default ComputerFileFixedField;
