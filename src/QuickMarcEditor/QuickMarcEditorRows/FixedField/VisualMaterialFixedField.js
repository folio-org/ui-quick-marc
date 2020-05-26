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
      type: SUBFIELD_TYPES.BYTE,
      name: 'MRec',
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Desc',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Tech',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'TMat',
    },
    {
      name: 'Time',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 3,
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
};

const VisualMaterialFixedField = ({ name }) => {
  return (
    <BytesField
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
