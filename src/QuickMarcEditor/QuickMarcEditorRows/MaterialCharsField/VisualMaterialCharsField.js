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
    name: 'Time',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 3,
  },
  {
    name: 'Audn',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'TMat',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Tech',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const VisualMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="visual-material-chars-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

VisualMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default VisualMaterialCharsField;
