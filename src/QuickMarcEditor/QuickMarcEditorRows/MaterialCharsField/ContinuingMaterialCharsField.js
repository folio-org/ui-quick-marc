import React from 'react';
import PropTypes from 'prop-types';

import {
  TYPE_SELECT_FIELD_PROPS,
} from './constants';
import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useSelectField from '../useSelectField';

const configFields = [
  {
    name: 'Freq',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Regl',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Orig',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'EntW',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Cont',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'SrTp',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Conf',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Alph',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'S/L',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const ContinuingMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="continuing-material-chars-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

ContinuingMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ContinuingMaterialCharsField;
