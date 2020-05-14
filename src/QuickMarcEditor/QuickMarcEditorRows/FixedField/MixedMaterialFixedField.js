import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [2, 2, 2, 2, 2, 2],
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
      undefined,
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
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      undefined,
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
      undefined,
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

const MixedMaterialFixedField = ({ name, collapsed }) => {
  return (
    <FixedField
      data-test-mixed-fixed-field
      name={name}
      config={config}
      collapsed={collapsed}
    />
  );
};

MixedMaterialFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

MixedMaterialFixedField.displayName = 'MixedMaterialFixedField';

export default MixedMaterialFixedField;
