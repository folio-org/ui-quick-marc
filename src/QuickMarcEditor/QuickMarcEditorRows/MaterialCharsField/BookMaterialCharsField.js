import React from 'react';
import PropTypes from 'prop-types';

import {
  BytesField,
  SUBFIELD_TYPES,
} from '../BytesField';
import useStandardFields from './useStandardFields';

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
  const standardFields = useStandardFields();

  return (
    <BytesField
      name={name}
      config={{
        fields: [
          ...standardFields,
          ...configFields,
        ],
      }}
    />
  );
};

BookMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

BookMaterialCharsField.displayName = 'BookMaterialCharsField';

export default BookMaterialCharsField;
