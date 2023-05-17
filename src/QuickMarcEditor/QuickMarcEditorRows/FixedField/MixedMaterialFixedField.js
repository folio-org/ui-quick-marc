import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';

const config = {
  fields: [
    {
      name: 'Srce',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Ctrl',
      type: SUBFIELD_TYPES.BYTE,
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
      name: 'MRec',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
      length: 3,
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

const MixedMaterialFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

MixedMaterialFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

MixedMaterialFixedField.displayName = 'MixedMaterialFixedField';
MixedMaterialFixedField.configFields = config.fields;

export default MixedMaterialFixedField;
