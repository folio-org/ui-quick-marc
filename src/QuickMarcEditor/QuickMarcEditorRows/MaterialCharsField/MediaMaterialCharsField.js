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
    name: 'Comp',
    type: SUBFIELD_TYPES.STRING,
  },
  {
    name: 'FMus',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Part',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Audn',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'AccM',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 6,
  },
  {
    name: 'LTxt',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 2,
  },
  {
    name: 'TrAr',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const MediaMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="media-material-chars-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

MediaMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

MediaMaterialCharsField.configFields = configFields;

export default MediaMaterialCharsField;
