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
    name: 'Ills',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
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
    name: 'Cont',
    type: SUBFIELD_TYPES.BYTES,
    bytes: 4,
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
    name: 'Fest',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Indx',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'LitF',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Biog',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const BookMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="book-material-chars-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

BookMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default BookMaterialCharsField;
