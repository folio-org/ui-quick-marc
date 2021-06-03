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
    name: 'Audn',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'Form',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'File',
    type: SUBFIELD_TYPES.BYTE,
  },
  {
    name: 'GPub',
    type: SUBFIELD_TYPES.BYTE,
  },
];

const ComputerFileMaterialCharsField = ({ name }) => {
  const selectField = useSelectField(TYPE_SELECT_FIELD_PROPS);

  return (
    <BytesField
      name={name}
      id="computer-file-material-chars-field"
      config={{
        fields: [
          selectField,
          ...configFields,
        ],
      }}
    />
  );
};

ComputerFileMaterialCharsField.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ComputerFileMaterialCharsField;
