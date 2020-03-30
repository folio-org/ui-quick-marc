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
        name: 'Srce',
        type: SUBFIELD_TYPES.BYTE,
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
        name: 'Lang',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      {
        name: 'BLvl',
        disabled: true,
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Comp',
        type: SUBFIELD_TYPES.STRING,
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
        name: 'Desc',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'FMus',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'LTxt',
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
  ],
};

const VisualMaterialFixedField = ({ name }) => {
  return (
    <FixedField
      data-test-visual-material-fixed-field
      name={name}
      config={config}
    />
  );
};

VisualMaterialFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

VisualMaterialFixedField.displayName = 'VisualMaterialFixedField';

export default VisualMaterialFixedField;
