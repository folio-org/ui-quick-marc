import React from 'react';
import PropTypes from 'prop-types';

import FixedField, { SUBFIELD_TYPES } from './FixedField';

const config = {
  colSizes: [1, 3, 2, 2, 2, 2],
  fields: [
    [
      {
        disabled: true,
        name: 'Type',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'ELvl',
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Srce',
      },
      {
        name: 'Audn',
        type: SUBFIELD_TYPES.BYTE,
      },
      {
        type: SUBFIELD_TYPES.BYTE,
        name: 'Ctrl',
      },
      {
        type: SUBFIELD_TYPES.STRING,
        name: 'Lang',
      },
    ],
    [
      {
        disabled: true,
        name: 'BLvl',
        type: SUBFIELD_TYPES.BYTE,
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

const BookFixedField = ({ name, collapsed }) => {
  return (
    <FixedField
      data-test-book-fixed-field
      name={name}
      config={config}
      collapsed={collapsed}
    />
  );
};

BookFixedField.propTypes = {
  name: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

BookFixedField.displayName = 'BookFixedField';

export default BookFixedField;
