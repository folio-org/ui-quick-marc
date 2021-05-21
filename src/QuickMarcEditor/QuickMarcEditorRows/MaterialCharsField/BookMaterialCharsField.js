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
      name: 'Ills',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 4,
    },
    {
      name: 'Audn',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
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
      type: SUBFIELD_TYPES.BYTE,
      name: 'Conf',
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
  ],
};

const BookMaterialCharsField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

BookMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

BookMaterialCharsField.displayName = 'BookMaterialCharsField';

export default BookMaterialCharsField;
