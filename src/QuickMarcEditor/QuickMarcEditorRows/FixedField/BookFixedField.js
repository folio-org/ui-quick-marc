import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [1, 3, 2, 2, 2, 2],
  fields: [
    [
      {
        name: 'Type',
        disabled: true,
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'ELvl',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Srce',
        type: SUBFIELD_TYPES.BYTE,
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
      },
    ],
    [
      {
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
        disabled: true,
      },
      {
        name: 'Form',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Conf',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Biog',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'MRec',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        name: 'Ctry',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
    [
      undefined,
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
    ],
    [
      {
        name: 'Desc',
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
      },
      {
        name: 'Date2',
        type: SUBFIELD_TYPES.STRING,
      },
    ],
  ],
};

const BookFixedField = ({ name }) => {
  return (
    <FixedField
      name={name}
      config={config}
    />
  );
};

BookFixedField.propTypes = {
  name: PropTypes.string.isRequired,
};

BookFixedField.displayName = 'BookFixedField';

export default BookFixedField;
