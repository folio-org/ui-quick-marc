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
      type: SUBFIELD_TYPES.STRING,
      name: 'Lang',
      length: 3,
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Form',
    },
    {
      type: SUBFIELD_TYPES.BYTE,
      name: 'Conf',
    },
    {
      name: 'Biog',
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
      name: 'Cont',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 4,
    },
    {
      name: 'GPub',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'LitF',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Indx',
      type: SUBFIELD_TYPES.BYTE,
    },
    {
      name: 'Ills',
      type: SUBFIELD_TYPES.BYTES,
      bytes: 4,
    },
    {
      name: 'Fest',
      type: SUBFIELD_TYPES.BYTE,
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

const BookFixedField = ({ name }) => {
  return (
    <BytesField
      name={name}
      config={config}
    />
  );
};

BookFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

BookFixedField.displayName = 'BookFixedField';
BookFixedField.configFields = config.fields;

export default BookFixedField;
