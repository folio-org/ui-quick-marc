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
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const MixedMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="mixed-material-chars-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

MixedMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default MixedMaterialCharsField;
