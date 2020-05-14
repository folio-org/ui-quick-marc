import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [1, 1, 2, 4, 2, 2],
  fields: [
    [
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Type',
        disabled: true,
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
        name: 'Audn',
        type: SUBFIELD_TYPES.BYTE,
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
        type: SUBFIELD_TYPES.BYTE,
        name: 'BLvl',
        disabled: true,
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
        type: SUBFIELD_TYPES.BYTES,
        name: 'AccM',
        bytes: 6,
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
        name: 'TrAr',
        type: SUBFIELD_TYPES.BYTE,
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
        name: 'LTxt',
      },
      {
        name: 'DtSt',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Date1',
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};

const VisualMaterialFixedField = ({ name, collapsed }) => {
  return (
    <FixedField
      data-test-visual-material-fixed-field
      name={name}
      config={config}
      collapsed={collapsed}
    />
  );
};

VisualMaterialFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

VisualMaterialFixedField.displayName = 'VisualMaterialFixedField';

export default VisualMaterialFixedField;
