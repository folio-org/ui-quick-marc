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
      name: 'GPub',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'MRec',
    },
    {
      name: 'Ctry',
      type: SUBFIELD_TYPES.STRING,
      length: 3,
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
VisualMaterialFixedField.configFields = config.fields;

export default VisualMaterialFixedField;
